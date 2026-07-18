"""
Simple test script for RAG components (without PyMuPDF dependency)
Tests intent detection, MySQL query builder, and vector store
"""
import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_intent_detection():
    """Test intent detection with various questions"""
    print("\n" + "="*60)
    print("TEST 1: Intent Detection")
    print("="*60)
    
    from app.intent_detector import IntentDetector
    
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
    
    from app.mysql_query_builder import MySQLQueryBuilder
    
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
        from app.vector_store import VectorStore
        
        vector_store = VectorStore(persist_directory="./chroma_db")
        print("✓ Vector store initialized successfully")
        print(f"  Documents collection: {vector_store.documents_collection is not None}")
        print(f"  Referentiels collection: {vector_store.referentiels_collection is not None}")
        
        # Test search (will return empty if no data indexed)
        results = vector_store.search_documents("test query", n_results=2)
        print(f"  Search test returned {len(results)} results")
        
    except Exception as e:
        print(f"✗ Error: {e}")

def test_context_builder():
    """Test context builder"""
    print("\n" + "="*60)
    print("TEST 4: Context Builder")
    print("="*60)
    
    try:
        from app.context_builder import ContextBuilder
        from app.mysql_query_builder import MySQLQueryBuilder
        from app.vector_store import VectorStore
        from app.intent_detector import IntentDetector
        
        vector_store = VectorStore(persist_directory="./chroma_db")
        mysql_builder = MySQLQueryBuilder()
        context_builder = ContextBuilder(mysql_builder, vector_store)
        intent_detector = IntentDetector()
        
        # Test question
        question = "Quels sont les risques critiques ?"
        print(f"Question: {question}")
        
        # Detect intent
        intent_result = intent_detector.detect_intent(question)
        print(f"✓ Intent detected: {intent_result['intent']}")
        
        # Build context
        context = context_builder.build_context(question, intent_result)
        print(f"✓ Context built")
        print(f"  MySQL context available: {context['mysql_context'] is not None}")
        print(f"  Document context available: {context['document_context'] is not None}")
        print(f"  Referentiel context available: {context['referentiel_context'] is not None}")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("COPilot RSSI - RAG System Simple Tests")
    print("="*60)
    
    # Run individual tests
    test_intent_detection()
    test_mysql_query_builder()
    test_vector_store()
    test_context_builder()
    
    print("\n" + "="*60)
    print("TESTS COMPLETED")
    print("="*60)
    print("\nNext steps:")
    print("1. Install PyMuPDF correctly for document processing")
    print("2. Set up MySQL database")
    print("3. Start Ollama: ollama serve && ollama pull llama3")
    print("4. Index documents: POST /api/v1/index/documents")
    print("5. Index referentiels: POST /api/v1/index/referentiels")

if __name__ == "__main__":
    main()
