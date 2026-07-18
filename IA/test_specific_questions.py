"""
Test script for the specific problematic questions mentioned by the user
"""
import sys
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Specific problematic questions to test
TEST_QUESTIONS = [
    {
        "question": "Quels documents contiennent un CIN ?",
        "expected_behavior": "Should return count + list of documents with CIN, NOT all documents"
    },
    {
        "question": "Explique ISO 27001",
        "expected_behavior": "Should explain what ISO 27001 is, NOT just list referentials"
    },
    {
        "question": "Combien de contrats sont dans l'inventaire ?",
        "expected_behavior": "Should return count of contracts, NOT all documents"
    },
    {
        "question": "Quels sont les principaux risques ?",
        "expected_behavior": "Should show top risks summary, NOT all risks in detail"
    },
    {
        "question": "Quel est le score de conformité ?",
        "expected_behavior": "Should return the compliance score percentage"
    },
    {
        "question": "Quels risques sont critiques ?",
        "expected_behavior": "Should show only critical risks with count"
    },
    {
        "question": "Quels documents sont confidentiels ?",
        "expected_behavior": "Should show confidential documents with count"
    },
    {
        "question": "Résume le système",
        "expected_behavior": "Should provide a summary of system state"
    }
]

def test_question(question: str, expected: str):
    """Test a single question"""
    print(f"\n{'='*70}")
    print(f"Question: {question}")
    print(f"Expected: {expected}")
    print(f"{'='*70}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat",
            json={"question": question},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("answer", "")
            
            print(f"\nResponse:\n{answer}")
            
            # Check for raw data dumps
            if "## DOCUMENTS" in answer and len(answer) > 500:
                print("\n⚠️  WARNING: Response contains raw data dump")
            
            # Check for natural language
            if any(word in answer.lower() for word in ["document", "risque", "cin", "contrat"]):
                if answer.count("\n") > 20:
                    print("\n⚠️  WARNING: Too many lines - likely raw data")
            
            return True
        else:
            print(f"\n✗ Error: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def main():
    print("="*70)
    print("Testing Specific Problematic Questions")
    print("="*70)
    
    passed = 0
    failed = 0
    
    for test in TEST_QUESTIONS:
        if test_question(test["question"], test["expected_behavior"]):
            passed += 1
        else:
            failed += 1
    
    print(f"\n{'='*70}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'='*70}")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
