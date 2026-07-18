"""
Comprehensive Test Suite for Copilot RSSI
Tests all question types and intents
"""
import sys
import os
import requests
import json
from typing import Dict, List

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.intent_detector import IntentDetector
from app.mysql_query_builder import MySQLQueryBuilder
from app.vector_store import VectorStore
from app.context_builder import ContextBuilder
from app.llm_generator import LLMGenerator
from app.answer_formatter import AnswerFormatter

class CopilotTestSuite:
    def __init__(self):
        """Initialize test suite"""
        self.intent_detector = IntentDetector()
        self.mysql_builder = MySQLQueryBuilder()
        self.vector_store = VectorStore(persist_directory="./chroma_db")
        self.context_builder = ContextBuilder(self.mysql_builder, self.vector_store)
        self.llm_generator = LLMGenerator(provider="ollama", model="llama3")
        self.answer_formatter = AnswerFormatter()
        
        self.test_questions = {
            'CIN': [
                "Quels documents contiennent un CIN ?",
                "Où trouve-t-on des numéros de carte d'identité ?",
                "Liste des fichiers avec CIN"
            ],
            'RISQUES': [
                "Quels sont les risques critiques ?",
                "Montre-moi tous les risques",
                "Quels risques de haute gravité ?",
                "Comment corriger ce risque ?"
            ],
            'CONTRATS': [
                "Combien de contrats existent ?",
                "Quels contrats avons-nous ?",
                "Liste des contrats détectés"
            ],
            'CLASSIFICATION': [
                "Quels documents sont très confidentiels ?",
                "Montre-moi la classification des documents",
                "Quels fichiers sont confidentiels ?"
            ],
            'ISO': [
                "Explique ISO 27001",
                "Qu'est-ce que ISO 27002 ?",
                "Les principes de ISO 27001"
            ],
            'NIST': [
                "Explique NIST",
                "Qu'est-ce que le NIST Cybersecurity Framework ?",
                "Les fonctions du NIST CSF"
            ],
            'CIS': [
                "Explique CIS Controls",
                "Quels sont les CIS Controls ?",
                "CIS Controls v8"
            ],
            'LOI': [
                "Que dit la Loi 09-08 ?",
                "Explique la loi marocaine sur les données personnelles",
                "Loi 09-08 protection des données"
            ],
            'DOCUMENTS': [
                "Combien de documents avons-nous ?",
                "Liste tous les documents",
                "Quels types de documents ?"
            ],
            'ACTIFS': [
                "Quels sont les actifs informationnels ?",
                "Inventaire des actifs",
                "Liste des équipements"
            ],
            'STATISTIQUES': [
                "Donne-moi les statistiques",
                "Combien de fichiers analysés ?",
                "Résumé des statistiques"
            ],
            'RECOMMANDATIONS': [
                "Quelles sont les recommandations ?",
                "Comment améliorer la sécurité ?",
                "Que suggère-t-on pour corriger ?"
            ],
            'MOT_DE_PASSE': [
                "Où trouve-t-on des mots de passe ?",
                "Documents avec mots de passe exposés",
                "Alerte mots de passe"
            ],
            'EMAIL': [
                "Quels documents contiennent des emails ?",
                "Fichiers avec adresses mail",
                "Où sont les emails ?"
            ]
        }
    
    def test_intent_detection(self):
        """Test intent detection for all question types"""
        print("\n" + "="*60)
        print("TEST: Intent Detection for All Question Types")
        print("="*60)
        
        results = {}
        for intent, questions in self.test_questions.items():
            print(f"\n{intent}:")
            correct = 0
            for question in questions:
                result = self.intent_detector.detect_intent(question)
                if result['intent'] == intent:
                    correct += 1
                    print(f"  ✓ {question[:50]}...")
                else:
                    print(f"  ✗ {question[:50]}... (detected: {result['intent']})")
            
            accuracy = (correct / len(questions)) * 100
            results[intent] = accuracy
            print(f"  Accuracy: {accuracy:.1f}%")
        
        overall_accuracy = sum(results.values()) / len(results)
        print(f"\nOverall Intent Detection Accuracy: {overall_accuracy:.1f}%")
        return results
    
    def test_mysql_queries(self):
        """Test MySQL query generation for all intents"""
        print("\n" + "="*60)
        print("TEST: MySQL Query Generation")
        print("="*60)
        
        for intent in self.test_questions.keys():
            if intent in ['ISO', 'NIST', 'CIS', 'LOI']:
                continue  # These don't use MySQL
            
            query = self.mysql_builder.build_query(intent, {})
            if query:
                print(f"\n{intent}:")
                print(f"  Query generated: {len(query)} characters")
            else:
                print(f"\n{intent}: No query generated")
    
    def test_vector_search(self):
        """Test vector search capabilities"""
        print("\n" + "="*60)
        print("TEST: Vector Search")
        print("="*60)
        
        test_queries = [
            "CIN documents",
            "risques sécurité",
            "ISO 27001",
            "contrats confidentiels"
        ]
        
        for query in test_queries:
            doc_results = self.vector_store.search_documents(query, n_results=2)
            ref_results = self.vector_store.search_referentiels(query, n_results=2)
            
            print(f"\nQuery: {query}")
            print(f"  Documents found: {len(doc_results)}")
            print(f"  Referentiels found: {len(ref_results)}")
    
    def test_context_building(self):
        """Test context building for different intents"""
        print("\n" + "="*60)
        print("TEST: Context Building")
        print("="*60)
        
        test_cases = [
            ("Quels documents contiennent un CIN ?", "CIN"),
            ("Quels sont les risques critiques ?", "RISQUES"),
            ("Explique ISO 27001", "ISO")
        ]
        
        for question, expected_intent in test_cases:
            intent_result = self.intent_detector.detect_intent(question)
            context = self.context_builder.build_context(question, intent_result)
            
            print(f"\nQuestion: {question}")
            print(f"  Intent: {intent_result['intent']}")
            print(f"  MySQL context: {'Yes' if context['mysql_context'] else 'No'}")
            print(f"  Document context: {'Yes' if context['document_context'] else 'No'}")
            print(f"  Referentiel context: {'Yes' if context['referentiel_context'] else 'No'}")
    
    def test_answer_formatting(self):
        """Test answer formatting"""
        print("\n" + "="*60)
        print("TEST: Answer Formatting")
        print("="*60)
        
        sample_responses = {
            'CIN': "Les documents contenant un numéro CIN sont: contrat_travail.txt, CV_Ahmed.txt. Ces documents sont confidentiels.",
            'RISQUES': "Les risques critiques sont: mot de passe en clair dans config.txt. Recommandation: chasser immédiatement.",
            'ISO': "ISO 27001 est une norme internationale pour la sécurité de l'information. Elle permet de gérer les risques."
        }
        
        for intent, response in sample_responses.items():
            formatted = self.answer_formatter.format_response(
                response, intent, 
                context={'sources': {'mysql': True}},
                metadata={'confidence': 0.9, 'tokens_used': 100}
            )
            
            print(f"\n{intent}:")
            print(f"  Title: {formatted['title']}")
            print(f"  Icon: {formatted['icon']}")
            print(f"  Sections: {list(formatted['structured_sections'].keys())}")
    
    def test_full_pipeline(self):
        """Test the full RAG pipeline"""
        print("\n" + "="*60)
        print("TEST: Full RAG Pipeline")
        print("="*60)
        
        # Test a simple question
        question = "Quels sont les risques critiques ?"
        
        print(f"\nQuestion: {question}")
        
        # Step 1: Intent detection
        intent_result = self.intent_detector.detect_intent(question)
        print(f"✓ Intent detected: {intent_result['intent']}")
        
        # Step 2: Context building
        context = self.context_builder.build_context(question, intent_result)
        print(f"✓ Context built")
        
        # Step 3: LLM generation (if available)
        if self.llm_generator.llm:
            try:
                llm_result = self.llm_generator.generate_with_context(
                    question, 
                    context["combined_context"]
                )
                print(f"✓ LLM response generated")
                print(f"  Response: {llm_result['response'][:100]}...")
                
                # Step 4: Answer formatting
                formatted = self.answer_formatter.format_response(
                    llm_result['response'],
                    intent_result['intent'],
                    context,
                    llm_result
                )
                print(f"✓ Answer formatted")
                print(f"  Title: {formatted['title']}")
                
            except Exception as e:
                print(f"✗ LLM error: {e}")
        else:
            print("⚠ LLM not available, skipping response generation")
    
    def test_api_endpoints(self, base_url: str = "http://localhost:8000"):
        """Test API endpoints"""
        print("\n" + "="*60)
        print("TEST: API Endpoints")
        print("="*60)
        
        try:
            # Test health endpoint
            response = requests.get(f"{base_url}/api/v1/health")
            if response.status_code == 200:
                print("✓ Health check passed")
                print(f"  Response: {response.json()}")
            else:
                print(f"✗ Health check failed: {response.status_code}")
            
            # Test chat endpoint
            response = requests.post(
                f"{base_url}/api/v1/chat",
                json={"query": "Quels documents contiennent un CIN ?"}
            )
            if response.status_code == 200:
                print("✓ Chat endpoint passed")
                result = response.json()
                print(f"  Intent: {result.get('intent')}")
                print(f"  Reply: {result.get('reply', '')[:50]}...")
            else:
                print(f"✗ Chat endpoint failed: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print("⚠ Server not running. Start with: python main.py")
        except Exception as e:
            print(f"✗ API test error: {e}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("🧪 Copilot RSSI - Comprehensive Test Suite")
        print("="*60)
        
        # Run all tests
        self.test_intent_detection()
        self.test_mysql_queries()
        self.test_vector_search()
        self.test_context_building()
        self.test_answer_formatting()
        self.test_full_pipeline()
        self.test_api_endpoints()
        
        print("\n" + "="*60)
        print("✅ Test Suite Completed")
        print("="*60)
        print("\nSummary:")
        print("- Intent Detection: Tested all question types")
        print("- MySQL Queries: Generated for applicable intents")
        print("- Vector Search: Tested semantic search")
        print("- Context Building: Tested multi-source context")
        print("- Answer Formatting: Tested structured outputs")
        print("- Full Pipeline: Tested end-to-end flow")
        print("- API Endpoints: Tested REST API")

def main():
    """Run the comprehensive test suite"""
    test_suite = CopilotTestSuite()
    test_suite.run_all_tests()

if __name__ == "__main__":
    main()
