"""
Test script for the complete RAG-based Copilot RSSI system
Tests all components: Intent detection, MySQL queries, Vector search, LLM generation
"""
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.intent_detector import IntentDetector
from app.mysql_query_builder import MySQLQueryBuilder
from app.vector_store import VectorStore
from app.document_ingestion import DocumentIngestion
from app.context_builder import ContextBuilder
from app.llm_generator import LLMGenerator

def test_intent_detection():
    """Test intent detection with various questions"""
    print("\n" + "="*60)
    print("TEST 1: Intent Detection")
    print("="*60)
    
    detector = IntentDetector()
    
    test_questions = [
        "Quels documents contiennent un CIN ?",
        "Quels sont les risques critiques ?",
        "Combien de contrats existent ?",
        "Explique ISO 27001",
        "Quelle est la différence entre NIST et ISO ?",
        "Quels documents sont très confidentiels ?",
        "Comment corriger ce risque ?",
        "Résume le contrat X"
    ]
    
    for question in test_questions:
        result = detector.detect_intent(question)
        print(f"\nQuestion: {question}")
        print(f"Intent: {result['intent']} (Confidence: {result['confidence']})")
        print(f"Requires MySQL: {result['requires_mysql']}")
        print(f"Requires Documents: {result['requires_documents']}")
        print(f"Requires Referentiels: {result['requires_referentiels']}")

def test_mysql_query_builder():
    """Test MySQL query builder"""
    print("\n" + "="*60)
    print("TEST 2: MySQL Query Builder")
    print("="*60)
    
    builder = MySQLQueryBuilder()
    
    test_intents = [
        ('CIN', {}),
        ('RISQUES', {'severity': 'CRITIQUE'}),
        ('CONTRATS', {}),
        ('STATISTIQUES', {})
    ]
    
    for intent, entities in test_intents:
        query = builder.build_query(intent, entities)
        print(f"\nIntent: {intent}")
        print(f"Query: {query[:100]}..." if len(query) > 100 else f"Query: {query}")

def test_vector_store():
    """Test vector store initialization"""
    print("\n" + "="*60)
    print("TEST 3: Vector Store")
    print("="*60)
    
    try:
        vector_store = VectorStore(persist_directory="./chroma_db")
        print("✓ Vector store initialized successfully")
        print(f"  Documents collection: {vector_store.documents_collection is not None}")
        print(f"  Referentiels collection: {vector_store.referentiels_collection is not None}")
        
        # Test search (will return empty if no data indexed)
        results = vector_store.search_documents("test query", n_results=2)
        print(f"  Search test returned {len(results)} results")
        
    except Exception as e:
        print(f"✗ Error: {e}")

def test_document_ingestion():
    """Test document ingestion"""
    print("\n" + "="*60)
    print("TEST 4: Document Ingestion")
    print("="*60)
    
    ingestion = DocumentIngestion()
    
    # Test with sample-documents directory
    sample_dir = "../sample-documents"
    if os.path.exists(sample_dir):
        print(f"Processing directory: {sample_dir}")
        try:
            chunks = ingestion.process_directory(sample_dir)
            print(f"✓ Processed {len(chunks)} chunks")
            if chunks:
                print(f"  Sample chunk: {chunks[0]['text'][:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
    else:
        print(f"Sample directory not found: {sample_dir}")

def test_llm_generator():
    """Test LLM generator"""
    print("\n" + "="*60)
    print("TEST 5: LLM Generator")
    print("="*60)
    
    try:
        llm = LLMGenerator(provider="ollama", model="llama3")
        print("✓ LLM generator initialized")
        
        # Test connection (may fail if Ollama not running)
        if llm.llm:
            print("  Testing connection...")
            # Simple test
            response = llm.generate_response("Test", max_tokens=10)
            print(f"  Response: {response[:50]}...")
        else:
            print("  ⚠ LLM not initialized (Ollama may not be running)")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        print("  Make sure Ollama is running: ollama serve")

def test_full_pipeline():
    """Test the full RAG pipeline"""
    print("\n" + "="*60)
    print("TEST 6: Full RAG Pipeline")
    print("="*60)
    
    try:
        # Initialize components
        vector_store = VectorStore(persist_directory="./chroma_db")
        mysql_builder = MySQLQueryBuilder()
        context_builder = ContextBuilder(mysql_builder, vector_store)
        intent_detector = IntentDetector()
        llm_generator = LLMGenerator(provider="ollama", model="llama3")
        
        # Test question
        question = "Quels sont les risques critiques ?"
        print(f"Question: {question}")
        
        # Step 1: Detect intent
        intent_result = intent_detector.detect_intent(question)
        print(f"✓ Intent detected: {intent_result['intent']}")
        
        # Step 2: Build context
        context = context_builder.build_context(question, intent_result)
        print(f"✓ Context built")
        print(f"  MySQL context: {context['mysql_context'][:50] if context['mysql_context'] else 'None'}...")
        print(f"  Document context: {context['document_context'][:50] if context['document_context'] else 'None'}...")
        print(f"  Referentiel context: {context['referentiel_context'][:50] if context['referentiel_context'] else 'None'}...")
        
        # Step 3: Generate response (only if LLM is available)
        if llm_generator.llm:
            llm_result = llm_generator.generate_with_context(question, context["combined_context"])
            print(f"✓ Response generated")
            print(f"  Response: {llm_result['response'][:100]}...")
        else:
            print("  ⚠ LLM not available, skipping response generation")
        
        print("\n✓ Full pipeline test completed")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("COPilot RSSI - RAG System Tests")
    print("="*60)
    
    # Run individual tests
    test_intent_detection()
    test_mysql_query_builder()
    test_vector_store()
    test_document_ingestion()
    test_llm_generator()
    test_full_pipeline()
    
    print("\n" + "="*60)
    print("TESTS COMPLETED")
    print("="*60)
    print("\nNotes:")
    print("- Vector store will be empty until documents are indexed")
    print("- MySQL queries will fail if database is not set up")
    print("- LLM will fail if Ollama is not running")
    print("\nTo index documents:")
    print("  POST /api/v1/index/documents")
    print("  POST /api/v1/index/referentiels")
    print("\nTo start Ollama:")
    print("  ollama serve")
    print("  ollama pull llama3")

if __name__ == "__main__":
    main()
