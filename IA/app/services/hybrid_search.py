"""
Hybrid Search Service for Copilot RSSI
Combines SQL, Vector Search, and Document content for comprehensive results
"""
from typing import Dict, List, Any
import logging
from app.db import (
    fetch_all_documents,
    fetch_risks,
    fetch_all_sensitive_data,
)
from app.vector_store import VectorStore

logger = logging.getLogger(__name__)


class HybridSearchService:
    """Service for hybrid search combining multiple data sources"""
    
    def __init__(self):
        """Initialize hybrid search service"""
        self.vector_store = VectorStore()
    
    def search(self, query: str, max_results: int = 10) -> Dict[str, Any]:
        """
        Perform hybrid search across multiple sources
        Returns results from SQL, Vector Search, and combined ranking
        """
        results = {
            "query": query,
            "sql_results": {},
            "vector_results": {},
            "combined_results": [],
            "sources_used": []
        }
        
        # 1. SQL Search (structured data)
        sql_results = self._sql_search(query)
        results["sql_results"] = sql_results
        if sql_results:
            results["sources_used"].append("sql")
        
        # 2. Vector Search (semantic similarity)
        try:
            vector_results = self._vector_search(query, max_results)
            results["vector_results"] = vector_results
            if vector_results:
                results["sources_used"].append("vector")
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
            results["vector_results"] = {"error": str(e)}
        
        # 3. Combine and rank results
        combined = self._combine_results(sql_results, vector_results, query)
        results["combined_results"] = combined[:max_results]
        
        return results
    
    def _sql_search(self, query: str) -> Dict[str, List]:
        """Search structured data in SQL database"""
        q = query.lower()
        results = {
            "documents": [],
            "risks": [],
            "sensitive_data": []
        }
        
        try:
            # Search documents
            all_docs = fetch_all_documents()
            
            # Filter by keywords in filename or type
            keywords = ["document", "fichier", "contrat", "facture", "rapport", "politique", "procédure"]
            if any(kw in q for kw in keywords):
                results["documents"] = all_docs[:20]
            
            # Search risks
            if any(kw in q for kw in ["risque", "vulnérabilité", "menace", "danger"]):
                results["risks"] = fetch_risks()[:20]
            
            # Search sensitive data
            if any(kw in q for kw in ["cin", "iban", "email", "mot de passe", "sensible", "donnée"]):
                results["sensitive_data"] = fetch_all_sensitive_data()[:20]
            
        except Exception as e:
            logger.error(f"SQL search error: {e}")
        
        return results
    
    def _vector_search(self, query: str, max_results: int) -> Dict[str, Any]:
        """Search using vector similarity"""
        try:
            # Use vector store to find similar documents
            similar_docs = self.vector_store.search(query, n_results=max_results)
            
            return {
                "documents": similar_docs if similar_docs else [],
                "method": "semantic_similarity"
            }
        except Exception as e:
            logger.error(f"Vector search error: {e}")
            return {"error": str(e)}
    
    def _combine_results(self, sql_results: Dict, vector_results: Dict, query: str) -> List[Dict]:
        """Combine and rank results from multiple sources"""
        combined = []
        seen_ids = set()
        
        # Add SQL results with base score
        for doc in sql_results.get("documents", []):
            doc_id = doc.get("id")
            if doc_id and doc_id not in seen_ids:
                combined.append({
                    "source": "sql",
                    "type": "document",
                    "data": doc,
                    "score": 0.7,
                    "reason": "keyword_match"
                })
                seen_ids.add(doc_id)
        
        for risk in sql_results.get("risks", []):
            risk_id = risk.get("id")
            if risk_id and risk_id not in seen_ids:
                combined.append({
                    "source": "sql",
                    "type": "risk",
                    "data": risk,
                    "score": 0.8,
                    "reason": "keyword_match"
                })
                seen_ids.add(risk_id)
        
        for sensitive in sql_results.get("sensitive_data", []):
            s_id = sensitive.get("id")
            if s_id and s_id not in seen_ids:
                combined.append({
                    "source": "sql",
                    "type": "sensitive_data",
                    "data": sensitive,
                    "score": 0.75,
                    "reason": "keyword_match"
                })
                seen_ids.add(s_id)
        
        # Add vector results with higher score
        for doc in vector_results.get("documents", []):
            doc_id = doc.get("id")
            if doc_id and doc_id not in seen_ids:
                combined.append({
                    "source": "vector",
                    "type": "document",
                    "data": doc,
                    "score": 0.9,
                    "reason": "semantic_similarity"
                })
                seen_ids.add(doc_id)
            elif doc_id in seen_ids:
                # Boost existing result if found by both
                for item in combined:
                    if item.get("data", {}).get("id") == doc_id:
                        item["score"] = min(1.0, item["score"] + 0.2)
                        item["reason"] = "both_keyword_and_semantic"
        
        # Sort by score
        combined.sort(key=lambda x: x["score"], reverse=True)
        
        return combined
    
    def format_for_llm(self, search_results: Dict) -> str:
        """Format search results for LLM context"""
        if not search_results.get("combined_results"):
            return "Aucun résultat trouvé."
        
        context_parts = ["## Résultats de recherche hybride"]
        context_parts.append(f"Sources utilisées: {', '.join(search_results.get('sources_used', []))}")
        context_parts.append(f"Nombre de résultats: {len(search_results['combined_results'])}")
        context_parts.append("")
        
        for result in search_results["combined_results"][:10]:
            data = result["data"]
            result_type = result["type"]
            
            if result_type == "document":
                context_parts.append(f"📄 **Document**: {data.get('file_name', 'N/A')}")
                context_parts.append(f"   Type: {data.get('document_type', 'N/A')}")
                context_parts.append(f"   Confidentialité: {data.get('confidentiality_level', 'N/A')}")
                context_parts.append(f"   Score: {result['score']:.2f} ({result['reason']})")
            
            elif result_type == "risk":
                context_parts.append(f"⚠️ **Risque**: {data.get('title', 'N/A')}")
                context_parts.append(f"   Gravité: {data.get('severity', 'N/A')}")
                context_parts.append(f"   Statut: {data.get('status', 'N/A')}")
                context_parts.append(f"   Score: {result['score']:.2f} ({result['reason']})")
            
            elif result_type == "sensitive_data":
                context_parts.append(f"🔒 **Donnée sensible**: {data.get('data_type', 'N/A')}")
                context_parts.append(f"   Document: {data.get('file_name', 'N/A')}")
                context_parts.append(f"   Valeur masquée: {data.get('masked_value', 'N/A')}")
                context_parts.append(f"   Score: {result['score']:.2f} ({result['reason']})")
            
            context_parts.append("")
        
        return "\n".join(context_parts)


# Global instance
hybrid_search_service = HybridSearchService()
