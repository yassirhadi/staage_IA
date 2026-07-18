"""
Vector Database Setup for Copilot RSSI
Uses ChromaDB for storing embeddings of documents and referentiels
"""
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import os

class VectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client and embedding model"""
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Initialize embedding model (multilingual for French/Arabic/English)
        self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        
        # Collections
        self.documents_collection = None
        self.referentiels_collection = None
        
        self._initialize_collections()
    
    def _initialize_collections(self):
        """Initialize or get existing collections"""
        try:
            self.documents_collection = self.client.get_or_create_collection(
                name="documents",
                metadata={"description": "Document embeddings for RAG"}
            )
            self.referentiels_collection = self.client.get_or_create_collection(
                name="referentiels",
                metadata={"description": "ISO/NIST/CIS/Loi referentiels embeddings"}
            )
        except Exception as e:
            print(f"Error initializing collections: {e}")
    
    def add_documents(self, documents: List[Dict[str, str]]):
        """
        Add documents to the vector store
        documents: List of dicts with keys: id, text, metadata
        """
        if not self.documents_collection:
            return
        
        ids = [doc["id"] for doc in documents]
        texts = [doc["text"] for doc in documents]
        metadatas = [doc.get("metadata", {}) for doc in documents]
        
        # Generate embeddings
        embeddings = self.embedding_model.encode(texts).tolist()
        
        self.documents_collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
    
    def add_referentiels(self, referentiels: List[Dict[str, str]]):
        """
        Add referentiels (ISO/NIST/CIS/Loi) to the vector store
        """
        if not self.referentiels_collection:
            return
        
        ids = [ref["id"] for ref in referentiels]
        texts = [ref["text"] for ref in referentiels]
        metadatas = [ref.get("metadata", {}) for ref in referentiels]
        
        embeddings = self.embedding_model.encode(texts).tolist()
        
        self.referentiels_collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
    
    def search_documents(self, query: str, n_results: int = 5) -> List[Dict]:
        """Search for relevant documents"""
        if not self.documents_collection:
            return []
        
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        results = self.documents_collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        
        return [
            {
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]
    
    def search_referentiels(self, query: str, n_results: int = 3) -> List[Dict]:
        """Search for relevant referentiels"""
        if not self.referentiels_collection:
            return []
        
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        results = self.referentiels_collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        
        return [
            {
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]
    
    def clear_collections(self):
        """Clear all collections"""
        if self.documents_collection:
            self.client.delete_collection("documents")
        if self.referentiels_collection:
            self.client.delete_collection("referentiels")
        self._initialize_collections()
