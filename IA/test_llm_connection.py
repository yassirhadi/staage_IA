"""
Test LLM Connection for Copilot RSSI
Verifies that the LLM is properly configured and accessible
"""
import sys
from app.config import settings
from app.services.llm_service import get_llm

def test_llm_connection():
    """Test LLM connection and basic functionality"""
    print("=" * 60)
    print("Copilot RSSI - LLM Connection Test")
    print("=" * 60)
    
    print(f"\nConfiguration:")
    print(f"  Provider: {settings.llm_provider}")
    if settings.llm_provider == "openai":
        print(f"  Model: {settings.openai_model}")
        print(f"  API Key: {'✓ Configured' if settings.openai_api_key else '✗ Missing'}")
    else:
        print(f"  Model: {settings.ollama_model}")
        print(f"  Base URL: {settings.ollama_base_url}")
    
    print("\n" + "-" * 60)
    print("Testing connection...")
    print("-" * 60)
    
    try:
        llm = get_llm()
        
        if llm is None:
            print("\n❌ LLM initialization failed")
            print("\nPossible causes:")
            if settings.llm_provider == "openai":
                print("  - OPENAI_API_KEY not set or invalid")
                print("  - Network connectivity issues")
            else:
                print("  - Ollama is not running")
                print("  - Ollama base URL is incorrect")
                print("  - Model not downloaded")
            print("\nSolutions:")
            print("  - Run: python setup_llm.py")
            if settings.llm_provider == "ollama":
                print("  - Start Ollama: ollama serve")
                print(f"  - Pull model: ollama pull {settings.ollama_model}")
            return False
        
        print("\n✓ LLM initialized successfully")
        
        # Test basic invocation
        print("\nTesting basic invocation...")
        test_prompt = "Respond with 'OK' if you can read this."
        response = llm.invoke(test_prompt)
        
        if hasattr(response, 'content'):
            response_text = response.content
        else:
            response_text = str(response)
        
        print(f"Response: {response_text[:100]}")
        
        if response_text:
            print("\n✓ LLM is working correctly")
            return True
        else:
            print("\n❌ LLM returned empty response")
            return False
            
    except Exception as e:
        print(f"\n❌ Error during LLM test: {e}")
        print("\nTroubleshooting:")
        if settings.llm_provider == "ollama":
            print("  - Ensure Ollama is running: ollama serve")
            print(f"  - Check if model exists: ollama list")
            print(f"  - Pull model if needed: ollama pull {settings.ollama_model}")
        else:
            print("  - Verify your API key is valid")
            print("  - Check your OpenAI account credits")
        return False

def test_rag_pipeline():
    """Test the full RAG pipeline with a sample question"""
    print("\n" + "=" * 60)
    print("Testing RAG Pipeline")
    print("=" * 60)
    
    try:
        from app.services.llm_service import generate_response
        from app.services.context_service import build_context_for_query
        
        test_question = "Quels documents contiennent des données sensibles ?"
        print(f"\nTest question: {test_question}")
        
        context = build_context_for_query(test_question)
        print(f"\nContext length: {len(context)} characters")
        
        response = generate_response(context, test_question)
        print(f"\nResponse:\n{response[:500]}...")
        
        return True
        
    except Exception as e:
        print(f"\n❌ RAG pipeline test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_llm_connection()
    
    if success:
        print("\n" + "=" * 60)
        print("Running RAG pipeline test...")
        print("=" * 60)
        test_rag_pipeline()
    
    print("\n" + "=" * 60)
    if success:
        print("✓ All tests passed! The LLM is ready to use.")
    else:
        print("✗ Tests failed. Please fix the configuration.")
    print("=" * 60)
    
    sys.exit(0 if success else 1)
