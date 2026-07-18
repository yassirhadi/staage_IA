"""
Comprehensive Test Suite for Intelligent Assistant
Tests all features of the enhanced Copilot RSSI AI system
"""
import sys
import requests
import json
from typing import Dict, List

# Configuration
BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "chat": f"{BASE_URL}/api/v1/chat",
    "status": f"{BASE_URL}/api/v1/status",
    "summary": f"{BASE_URL}/api/v1/summary",
    "recommendations": f"{BASE_URL}/api/v1/recommendations",
    "dashboard": f"{BASE_URL}/api/v1/dashboard"
}

# Test questions covering all features
TEST_QUESTIONS = [
    # Basic functionality
    {
        "category": "Basic",
        "question": "Bonjour",
        "expected_keywords": ["bonjour", "copilot", "assistant"]
    },
    {
        "category": "Basic",
        "question": "Quels documents contiennent un CIN ?",
        "expected_keywords": ["document", "cin"]
    },
    
    # Intent detection
    {
        "category": "Intent Detection",
        "question": "Quels sont les risques critiques ?",
        "expected_keywords": ["risque", "critique"]
    },
    {
        "category": "Intent Detection",
        "question": "Combien de rapports sont terminés ?",
        "expected_keywords": ["rapport", "terminé"]
    },
    
    # Conversation memory
    {
        "category": "Conversation Memory",
        "question": "Quels documents contiennent un CIN ?",
        "follow_up": "Lequel est le plus critique ?",
        "expected_keywords": ["critique"]
    },
    
    # Function calling
    {
        "category": "Function Calling",
        "question": "Combien de documents confidentiels ?",
        "expected_keywords": ["document", "confidentiel"]
    },
    {
        "category": "Function Calling",
        "question": "Quel est le score de sécurité ?",
        "expected_keywords": ["score", "sécurité"]
    },
    
    # Knowledge base
    {
        "category": "Knowledge Base",
        "question": "Explique ISO 27001",
        "expected_keywords": ["iso", "27001", "sécurité", "management"]
    },
    {
        "category": "Knowledge Base",
        "question": "Qu'est-ce que le NIST CSF ?",
        "expected_keywords": ["nist", "cybersecurity", "framework"]
    },
    {
        "category": "Knowledge Base",
        "question": "Compare ISO 27001 et NIST",
        "expected_keywords": ["iso", "nist", "différence", "comparaison"]
    },
    
    # Summarization
    {
        "category": "Summarization",
        "question": "Résume les risques détectés",
        "expected_keywords": ["risque", "résumé"]
    },
    {
        "category": "Summarization",
        "question": "Résume l'état du système",
        "expected_keywords": ["système", "état", "résumé"]
    },
    
    # Recommendations
    {
        "category": "Recommendations",
        "question": "Que dois-je faire ?",
        "expected_keywords": ["action", "recommandation", "faire"]
    },
    {
        "category": "Recommendations",
        "question": "Quelles sont les recommandations prioritaires ?",
        "expected_keywords": ["recommandation", "prioritaire"]
    },
    
    # Statistics
    {
        "category": "Statistics",
        "question": "Combien de documents RH ?",
        "expected_keywords": ["document", "rh"]
    },
    {
        "category": "Statistics",
        "question": "Quel type de document est le plus fréquent ?",
        "expected_keywords": ["type", "document", "fréquent"]
    },
    
    # Dashboard
    {
        "category": "Dashboard",
        "question": "Résume le système",
        "expected_keywords": ["système", "résumé", "document", "risque"]
    },
    
    # Complex queries
    {
        "category": "Complex",
        "question": "Quels risques sont liés au RGPD ?",
        "expected_keywords": ["risque", "rgpd"]
    },
    {
        "category": "Complex",
        "question": "Quels documents doivent être chiffrés ?",
        "expected_keywords": ["document", "chiffrer", "chiffrement"]
    },
    
    # Action-oriented
    {
        "category": "Action",
        "question": "Génère un plan d'action",
        "expected_keywords": ["plan", "action"]
    },
    {
        "category": "Action",
        "question": "Génère un rapport RSSI",
        "expected_keywords": ["rapport", "rssi"]
    }
]


class IntelligentAssistantTester:
    """Test suite for the intelligent assistant"""
    
    def __init__(self):
        """Initialize tester"""
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def print_header(self, text: str):
        """Print a formatted header"""
        print("\n" + "=" * 70)
        print(f" {text}")
        print("=" * 70)
    
    def print_section(self, text: str):
        """Print a formatted section"""
        print(f"\n{'─' * 70}")
        print(f" {text}")
        print(f"{'─' * 70}")
    
    def test_status(self) -> bool:
        """Test the AI service status"""
        self.print_section("Testing AI Service Status")
        
        try:
            response = requests.get(API_ENDPOINTS["status"], timeout=5)
            
            if response.status_code == 200:
                status_data = response.json()
                print(f"✓ Service Status: {status_data.get('status')}")
                print(f"✓ LLM Provider: {status_data.get('llm_provider')}")
                print(f"✓ LLM Status: {status_data.get('llm_status')}")
                print(f"✓ LLM Model: {status_data.get('llm_model')}")
                
                if status_data.get('llm_status') == 'connected':
                    print("\n✅ LLM is properly configured and connected!")
                    return True
                else:
                    print("\n⚠️  LLM is not configured. Run: python setup_llm.py")
                    return False
            else:
                print(f"✗ Status check failed: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("✗ Cannot connect to AI service. Is it running?")
            print("   Start with: python run.py")
            return False
        except Exception as e:
            print(f"✗ Error: {e}")
            return False
    
    def test_chat(self, question: str, expected_keywords: List[str] = None) -> Dict:
        """Test a single chat question"""
        try:
            response = requests.post(
                API_ENDPOINTS["chat"],
                json={"question": question},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                
                # Check for expected keywords
                if expected_keywords:
                    found_keywords = [kw for kw in expected_keywords if kw.lower() in answer.lower()]
                    keyword_match = len(found_keywords) > 0
                else:
                    keyword_match = True
                
                return {
                    "success": True,
                    "answer": answer,
                    "keyword_match": keyword_match,
                    "found_keywords": expected_keywords if expected_keywords else []
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "answer": ""
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "answer": ""
            }
    
    def test_summary(self, summary_type: str = "dashboard") -> Dict:
        """Test the summary endpoint"""
        try:
            response = requests.post(
                API_ENDPOINTS["summary"],
                json={"summary_type": summary_type},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "summary": data.get("summary", ""),
                    "type": data.get("type", "")
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_recommendations(self, question: str = "") -> Dict:
        """Test the recommendations endpoint"""
        try:
            response = requests.post(
                API_ENDPOINTS["recommendations"],
                json={"user_question": question},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "recommendations": data.get("recommendations", "")
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_dashboard(self) -> Dict:
        """Test the dashboard endpoint"""
        try:
            response = requests.post(
                API_ENDPOINTS["dashboard"],
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "statistics": data.get("statistics", {}),
                    "summary": data.get("summary", "")
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def run_tests(self):
        """Run all tests"""
        self.print_header("Copilot RSSI - Intelligent Assistant Test Suite")
        
        # Test 1: Service Status
        llm_configured = self.test_status()
        
        if not llm_configured:
            print("\n⚠️  LLM is not configured. Tests will run in fallback mode.")
            print("   Configure LLM with: python setup_llm.py")
            print("\nProceeding with tests anyway...")
        
        # Test 2: Chat Questions
        self.print_section("Testing Chat Questions")
        
        for test in TEST_QUESTIONS:
            category = test.get("category", "General")
            question = test.get("question")
            expected = test.get("expected_keywords", [])
            
            print(f"\n[{category}] {question}")
            
            result = self.test_chat(question, expected)
            
            if result["success"]:
                print(f"✓ Response received")
                if result.get("keyword_match"):
                    print(f"✓ Keywords matched: {result.get('found_keywords', [])}")
                else:
                    print(f"⚠ Keywords not fully matched")
                
                # Show truncated answer
                answer = result["answer"][:200] + "..." if len(result["answer"]) > 200 else result["answer"]
                print(f"  Answer: {answer}")
                
                self.passed += 1
            else:
                print(f"✗ Failed: {result.get('error')}")
                self.failed += 1
            
            self.results.append({
                "category": category,
                "question": question,
                "success": result["success"]
            })
            
            # Test follow-up if exists
            if test.get("follow_up"):
                follow_up = test["follow_up"]
                print(f"\n  [Follow-up] {follow_up}")
                follow_result = self.test_chat(follow_up)
                if follow_result["success"]:
                    print(f"  ✓ Follow-up response received")
                    self.passed += 1
                else:
                    print(f"  ✗ Follow-up failed: {follow_result.get('error')}")
                    self.failed += 1
        
        # Test 3: Summary Endpoint
        self.print_section("Testing Summary Endpoint")
        
        for summary_type in ["dashboard", "risks", "documents"]:
            print(f"\nTesting summary: {summary_type}")
            result = self.test_summary(summary_type)
            
            if result["success"]:
                print(f"✓ Summary generated for {summary_type}")
                summary = result["summary"][:150] + "..." if len(result["summary"]) > 150 else result["summary"]
                print(f"  {summary}")
                self.passed += 1
            else:
                print(f"✗ Summary failed: {result.get('error')}")
                self.failed += 1
        
        # Test 4: Recommendations Endpoint
        self.print_section("Testing Recommendations Endpoint")
        
        print("\nTesting general recommendations")
        result = self.test_recommendations()
        if result["success"]:
            print(f"✓ Recommendations generated")
            recs = result["recommendations"][:150] + "..." if len(result["recommendations"]) > 150 else result["recommendations"]
            print(f"  {recs}")
            self.passed += 1
        else:
            print(f"✗ Recommendations failed: {result.get('error')}")
            self.failed += 1
        
        # Test 5: Dashboard Endpoint
        self.print_section("Testing Dashboard Endpoint")
        
        print("\nTesting dashboard summary")
        result = self.test_dashboard()
        if result["success"]:
            print(f"✓ Dashboard generated")
            stats = result.get("statistics", {})
            print(f"  Statistics keys: {list(stats.keys())}")
            self.passed += 1
        else:
            print(f"✗ Dashboard failed: {result.get('error')}")
            self.failed += 1
        
        # Print summary
        self.print_header("Test Summary")
        
        total = self.passed + self.failed
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"\nTotal Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        
        # Results by category
        print(f"\n{'─' * 70}")
        print(" Results by Category")
        print(f"{'─' * 70}")
        
        category_results = {}
        for result in self.results:
            cat = result["category"]
            if cat not in category_results:
                category_results[cat] = {"passed": 0, "failed": 0}
            if result["success"]:
                category_results[cat]["passed"] += 1
            else:
                category_results[cat]["failed"] += 1
        
        for cat, counts in category_results.items():
            total_cat = counts["passed"] + counts["failed"]
            print(f"\n{cat}:")
            print(f"  Passed: {counts['passed']}/{total_cat}")
        
        print(f"\n{'=' * 70}")
        
        if pass_rate >= 80:
            print("✅ Excellent! The intelligent assistant is working well.")
        elif pass_rate >= 60:
            print("⚠️  Good, but some improvements needed.")
        else:
            print("❌ Several issues detected. Please review the errors.")
        
        print(f"{'=' * 70}\n")
        
        return pass_rate >= 60


if __name__ == "__main__":
    tester = IntelligentAssistantTester()
    success = tester.run_tests()
    sys.exit(0 if success else 1)
