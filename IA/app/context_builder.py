"""
Context Builder for Copilot RSSI
Combines MySQL results, document search, and referentiel search into unified context
"""
from typing import Dict, List
from .mysql_query_builder import MySQLQueryBuilder
from .vector_store import VectorStore

class ContextBuilder:
    def __init__(self, mysql_builder: MySQLQueryBuilder, vector_store: VectorStore):
        """Initialize context builder with MySQL and vector store"""
        self.mysql_builder = mysql_builder
        self.vector_store = vector_store
    
    def build_context(self, query: str, intent_result: Dict) -> Dict:
        """
        Build unified context from all available sources
        Returns dict with context sections for MySQL, documents, and referentiels
        """
        intent = intent_result["intent"]
        entities = intent_result["entities"]
        
        context = {
            "query": query,
            "intent": intent,
            "mysql_context": None,
            "document_context": None,
            "referentiel_context": None,
            "combined_context": ""
        }
        
        # Get MySQL context if needed
        if intent_result["requires_mysql"]:
            try:
                mysql_result = self.mysql_builder.get_context_from_query(intent, entities)
                context["mysql_context"] = self.mysql_builder.format_results_for_llm(mysql_result)
            except Exception as e:
                context["mysql_context"] = f"Erreur MySQL: {str(e)}"
        
        # Get document context if needed
        if intent_result["requires_documents"]:
            try:
                doc_results = self.vector_store.search_documents(query, n_results=3)
                if doc_results:
                    context["document_context"] = self._format_document_results(doc_results)
                else:
                    context["document_context"] = "Aucun document pertinent trouvé."
            except Exception as e:
                context["document_context"] = f"Erreur recherche documents: {str(e)}"
        
        # Get referentiel context if needed
        if intent_result["requires_referentiels"]:
            try:
                ref_results = self.vector_store.search_referentiels(query, n_results=2)
                if ref_results:
                    context["referentiel_context"] = self._format_referentiel_results(ref_results)
                else:
                    context["referentiel_context"] = "Aucun référentiel pertinent trouvé."
            except Exception as e:
                context["referentiel_context"] = f"Erreur recherche référentiels: {str(e)}"
        
        # Build combined context
        context["combined_context"] = self._combine_contexts(context)
        
        return context
    
    def _format_document_results(self, results: List[Dict]) -> str:
        """Format document search results for LLM"""
        if not results:
            return "Aucun document pertinent trouvé."
        
        lines = ["Extraits de documents pertinents :"]
        for i, result in enumerate(results, 1):
            lines.append(f"\nDocument {i}:")
            lines.append(f"Fichier: {result['metadata'].get('filename', 'Inconnu')}")
            lines.append(f"Contenu: {result['text'][:500]}...")
        
        return "\n".join(lines)
    
    def _format_referentiel_results(self, results: List[Dict]) -> str:
        """Format referentiel search results for LLM"""
        if not results:
            return "Aucun référentiel pertinent trouvé."
        
        lines = ["Référentiels pertinents :"]
        for i, result in enumerate(results, 1):
            category = result['metadata'].get('category', 'Inconnu')
            lines.append(f"\nRéférentiel {i} ({category}):")
            lines.append(f"Contenu: {result['text'][:600]}...")
        
        return "\n".join(lines)
    
    def _combine_contexts(self, context: Dict) -> str:
        """Combine all context sections into unified context string"""
        parts = []
        
        if context["mysql_context"]:
            parts.append(f"=== DONNÉES MYSQL ===\n{context['mysql_context']}")
        
        if context["document_context"]:
            parts.append(f"\n=== DOCUMENTS ===\n{context['document_context']}")
        
        if context["referentiel_context"]:
            parts.append(f"\n=== RÉFÉRENTIELS ===\n{context['referentiel_context']}")
        
        if not parts:
            return "Aucun contexte disponible."
        
        return "\n\n".join(parts)
    
    def build_prompt(self, query: str, context: Dict) -> str:
        """
        Build the final prompt for the LLM
        """
        intent = context["intent"]
        
        system_prompt = """Tu es un Copilot RSSI (Responsable Sécurité des Systèmes d'Information) professionnel.
Ton rôle est d'assister le RSSI dans ses tâches quotidiennes :
- Analyser les risques de sécurité
- Expliquer les normes (ISO 27001, NIST, CIS, Loi 09-08)
- Fournir des recommandations de sécurité
- Aider à la classification des documents
- Répondre aux questions sur les données sensibles

Réponds de manière professionnelle, précise et actionnable.
Utilise uniquement les informations fournies dans le contexte.
Si tu ne trouves pas l'information dans le contexte, indique-le clairement.
Fournis des recommandations pratiques quand c'est pertinent."""

        user_prompt = f"""Question : {query}

Intention détectée : {intent}

Contexte disponible :

{context['combined_context']}

Réponds à la question en utilisant les informations ci-dessus.
Si la question concerne des risques, fournis des recommandations de mitigation.
Si la question concerne une norme, explique les points clés.
Si la question concerne des documents, liste-les clairement avec leur niveau de confidentialité."""

        return f"{system_prompt}\n\n{user_prompt}"
