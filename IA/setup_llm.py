"""
LLM Setup Script for Copilot RSSI
Helps configure OpenAI or Ollama connection
"""
import os
from pathlib import Path

def setup_llm():
    """Interactive setup for LLM configuration"""
    print("=" * 60)
    print("Copilot RSSI - LLM Configuration")
    print("=" * 60)
    
    env_path = Path(__file__).parent / ".env"
    
    # Check if .env exists
    if env_path.exists():
        print(f"\n✓ Configuration file exists: {env_path}")
        with open(env_path, 'r') as f:
            current_content = f.read()
        print("\nCurrent configuration:")
        print(current_content)
    else:
        print(f"\n✗ Configuration file not found: {env_path}")
        print("Creating new configuration file...")
        current_content = ""
    
    print("\n" + "=" * 60)
    print("Choose LLM Provider:")
    print("1. Ollama (Free, Local)")
    print("2. OpenAI (Paid, Cloud)")
    print("=" * 60)
    
    choice = input("\nEnter your choice (1 or 2): ").strip()
    
    if choice == "1":
        setup_ollama(env_path, current_content)
    elif choice == "2":
        setup_openai(env_path, current_content)
    else:
        print("Invalid choice. Please run the script again.")
        return
    
    print("\n" + "=" * 60)
    print("✓ Configuration completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the AI service: python run.py")
    print("2. Test the connection: python test_llm_connection.py")
    print("3. Start the backend: cd ../Backend_IA && mvn spring-boot:run")

def setup_ollama(env_path, current_content):
    """Configure Ollama"""
    print("\n--- Ollama Configuration ---")
    
    base_url = input("Ollama base URL [default: http://localhost:11434]: ").strip()
    if not base_url:
        base_url = "http://localhost:11434"
    
    print("\nAvailable Ollama models:")
    print("- llama3 (recommended)")
    print("- llama3.1:8b (recommended)")
    print("- mistral")
    print("- qwen2.5")
    print("- codellama")
    
    model = input("Model name [default: llama3.1:8b]: ").strip()
    if not model:
        model = "llama3.1:8b"
    
    # Update or create .env
    lines = current_content.split('\n') if current_content else []
    
    # Remove existing LLM config lines
    lines = [line for line in lines if not line.startswith(('LLM_PROVIDER=', 'OLLAMA_', 'OPENAI_'))]
    
    # Add new config
    lines.append("LLM_PROVIDER=ollama")
    lines.append(f"OLLAMA_BASE_URL={base_url}")
    lines.append(f"OLLAMA_MODEL={model}")
    
    with open(env_path, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"\n✓ Ollama configured:")
    print(f"  - Base URL: {base_url}")
    print(f"  - Model: {model}")
    print(f"\n⚠️  Make sure Ollama is running: ollama serve")
    print(f"⚠️  Pull the model if needed: ollama pull {model}")

def setup_openai(env_path, current_content):
    """Configure OpenAI"""
    print("\n--- OpenAI Configuration ---")
    
    api_key = input("Enter your OpenAI API key: ").strip()
    if not api_key:
        print("❌ API key is required for OpenAI")
        return
    
    print("\nAvailable OpenAI models:")
    print("- gpt-4o (best, expensive)")
    print("- gpt-4o-mini (recommended, cost-effective)")
    print("- gpt-4-turbo")
    print("- gpt-3.5-turbo")
    
    model = input("Model name [default: gpt-4o-mini]: ").strip()
    if not model:
        model = "gpt-4o-mini"
    
    # Update or create .env
    lines = current_content.split('\n') if current_content else []
    
    # Remove existing LLM config lines
    lines = [line for line in lines if not line.startswith(('LLM_PROVIDER=', 'OLLAMA_', 'OPENAI_'))]
    
    # Add new config
    lines.append("LLM_PROVIDER=openai")
    lines.append(f"OPENAI_API_KEY={api_key}")
    lines.append(f"OPENAI_MODEL={model}")
    
    with open(env_path, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"\n✓ OpenAI configured:")
    print(f"  - Model: {model}")
    print(f"  - API Key: {api_key[:10]}...{api_key[-4:]}")

if __name__ == "__main__":
    setup_llm()
