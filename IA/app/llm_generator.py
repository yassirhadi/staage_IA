"""
LLM Generator for Copilot RSSI
Integrates with Ollama for intelligent response generation
"""
from langchain_ollama import OllamaLLM
from langchain_openai import ChatOpenAI
from typing import Optional, Dict
import os

class LLMGenerator:
    def __init__(self, provider: str = "ollama", model: str = "llama3", 
                 base_url: str = "http://localhost:11434", api_key: Optional[str] = None):
        """
        Initialize LLM generator
        provider: "ollama" or "openai"
        model: model name (e.g., "llama3", "mistral", "qwen2.5" for Ollama; "gpt-4" for OpenAI)
        base_url: Ollama server URL
        api_key: OpenAI API key (if using OpenAI)
        """
        self.provider = provider
        self.model = model
        self.base_url = base_url
        self.api_key = api_key
        
        self.llm = self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the LLM based on provider"""
        if self.provider == "ollama":
            try:
                return OllamaLLM(
                    model=self.model,
                    base_url=self.base_url,
                    temperature=0.7,
                    num_ctx=4096  # Context window size
                )
            except Exception as e:
                print(f"Error initializing Ollama: {e}")
                print("Make sure Ollama is running: ollama serve")
                return None
        elif self.provider == "openai":
            if not self.api_key:
                raise ValueError("API key required for OpenAI provider")
            try:
                return ChatOpenAI(
                    model=self.model,
                    api_key=self.api_key,
                    temperature=0.7
                )
            except Exception as e:
                print(f"Error initializing OpenAI: {e}")
                return None
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def generate_response(self, prompt: str, max_tokens: int = 1000) -> str:
        """
        Generate a response from the LLM
        """
        if not self.llm:
            return "Erreur: LLM non initialisé. Vérifiez qu'Ollama est en cours d'exécution."
        
        try:
            response = self.llm.invoke(prompt)
            return response
        except Exception as e:
            print(f"Error generating response: {e}")
            return f"Erreur lors de la génération de la réponse: {str(e)}"
    
    def generate_with_context(self, query: str, context: str, 
                             system_prompt: str = None) -> Dict[str, any]:
        """
        Generate a response with full context
        Returns dict with response, tokens_used, etc.
        """
        if system_prompt is None:
            system_prompt = """Tu es un Copilot RSSI professionnel.
Réponds de manière précise et professionnelle en utilisant les informations fournies."""
        
        full_prompt = f"""{system_prompt}

Question : {query}

Contexte :
{context}

Réponse :"""
        
        try:
            response = self.generate_response(full_prompt)
            
            return {
                "response": response,
                "query": query,
                "tokens_used": len(full_prompt.split()) + len(response.split()),
                "provider": self.provider,
                "model": self.model
            }
        except Exception as e:
            return {
                "response": f"Erreur: {str(e)}",
                "query": query,
                "tokens_used": 0,
                "provider": self.provider,
                "model": self.model,
                "error": str(e)
            }
    
    def test_connection(self) -> bool:
        """Test if the LLM is accessible"""
        try:
            test_response = self.llm.invoke("Test")
            return True
        except Exception as e:
            print(f"LLM connection test failed: {e}")
            return False
    
    def set_model(self, model: str):
        """Change the model (requires reinitialization)"""
        self.model = model
        self.llm = self._initialize_llm()
