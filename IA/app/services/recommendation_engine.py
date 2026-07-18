"""
AI Recommendations Engine for Copilot RSSI
Generates intelligent, context-aware recommendations based on risks and system state
"""
from typing import Dict, List, Any
import logging
from app.db import fetch_risks, fetch_security_scores, fetch_all_documents

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Engine for generating AI-powered security recommendations"""
    
    def __init__(self):
        """Initialize recommendation engine"""
        self.priority_levels = {
            "CRITIQUE": 1,
            "ÉLEVÉ": 2,
            "MOYEN": 3,
            "FAIBLE": 4
        }
    
    def generate_recommendations(self, context: str = None) -> List[Dict[str, Any]]:
        """
        Generate comprehensive recommendations based on current system state
        """
        recommendations = []
        
        try:
            # Fetch current state
            risks = fetch_risks()
            scores = fetch_security_scores()
            documents = fetch_all_documents()
            
            # 1. Risk-based recommendations
            risk_recommendations = self._generate_risk_recommendations(risks)
            recommendations.extend(risk_recommendations)
            
            # 2. Score-based recommendations
            score_recommendations = self._generate_score_recommendations(scores)
            recommendations.extend(score_recommendations)
            
            # 3. Document-based recommendations
            doc_recommendations = self._generate_document_recommendations(documents)
            recommendations.extend(doc_recommendations)
            
            # 4. Prioritize and sort
            recommendations = self._prioritize_recommendations(recommendations)
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            recommendations = [{
                "category": "Erreur",
                "priority": "MOYENNE",
                "title": "Erreur de génération",
                "description": f"Impossible de générer les recommandations: {str(e)}",
                "actionable": False
            }]
        
        return recommendations
    
    def _generate_risk_recommendations(self, risks: List[Dict]) -> List[Dict]:
        """Generate recommendations based on detected risks"""
        recommendations = []
        
        # Count risks by severity
        severity_counts = {}
        for risk in risks:
            severity = risk.get("severity", "MOYEN")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Critical risks
        if severity_counts.get("CRITIQUE", 0) > 0:
            recommendations.append({
                "category": "Risques Critiques",
                "priority": "CRITIQUE",
                "title": f"{severity_counts['CRITIQUE']} risque(s) critique(s) détecté(s)",
                "description": "Des risques critiques nécessitent une action immédiate pour éviter des impacts majeurs sur la sécurité.",
                "actions": [
                    "Examiner et corriger chaque risque critique dans les 24h",
                    "Documenter les mesures correctives prises",
                    "Notifier les parties prenantes concernées",
                    "Revoir les processus de prévention"
                ],
                "actionable": True
            })
        
        # High severity risks
        if severity_counts.get("ÉLEVÉ", 0) > 0:
            recommendations.append({
                "category": "Risques Élevés",
                "priority": "ÉLEVÉE",
                "title": f"{severity_counts['ÉLEVÉ']} risque(s) élevé(s) détecté(s)",
                "description": "Les risques élevés doivent être traités dans les 30 jours pour maintenir un niveau de sécurité acceptable.",
                "actions": [
                    "Planifier les corrections dans les 30 jours",
                    "Assigner des responsables pour chaque risque",
                    "Suivre les progrès hebdomadairement"
                ],
                "actionable": True
            })
        
        # Password-related risks
        password_risks = [r for r in risks if "mot de passe" in r.get("title", "").lower() or "password" in r.get("title", "").lower()]
        if password_risks:
            recommendations.append({
                "category": "Authentification",
                "priority": "CRITIQUE",
                "title": f"{len(password_risks)} problème(s) de mot de passe détecté(s)",
                "description": "Des mots de passe en clair ou faibles ont été détectés dans les documents.",
                "actions": [
                    "Changer immédiatement tous les mots de passe exposés",
                    "Implémenter une politique de mots de passe robuste",
                    "Utiliser un gestionnaire de mots de passe",
                    "Activer l'authentification multi-facteur (MFA)"
                ],
                "actionable": True
            })
        
        # PII-related risks
        pii_risks = [r for r in risks if any(kw in r.get("title", "").lower() for kw in ["cin", "iban", "email", "donnée personnelle"])]
        if pii_risks:
            recommendations.append({
                "category": "Données Personnelles",
                "priority": "ÉLEVÉE",
                "title": f"{len(pii_risks)} risque(s) lié(s) aux données personnelles",
                "description": "Des données personnelles identifiables (PII) sont exposées dans les documents.",
                "actions": [
                    "Restreindre l'accès aux documents contenant des PII",
                    "Chiffrer les documents sensibles",
                    "Anonymiser les données quand possible",
                    "Vérifier la conformité RGPD/Loi 09-08"
                ],
                "actionable": True
            })
        
        return recommendations
    
    def _generate_score_recommendations(self, scores: Dict) -> List[Dict]:
        """Generate recommendations based on security scores"""
        recommendations = []
        
        security_score = scores.get("security_score", 0)
        compliance_score = scores.get("compliance_score", 0)
        
        # Low security score
        if security_score < 50:
            recommendations.append({
                "category": "Score Sécurité",
                "priority": "CRITIQUE",
                "title": f"Score sécurité critique: {security_score}%",
                "description": "Le niveau de sécurité global est insuffisant. Des actions immédiates sont nécessaires.",
                "actions": [
                    "Effectuer une analyse complète des vulnérabilités",
                    "Prioriser la correction des risques critiques",
                    "Renforcer les contrôles d'accès",
                    "Mettre à jour les politiques de sécurité"
                ],
                "actionable": True
            })
        elif security_score < 70:
            recommendations.append({
                "category": "Score Sécurité",
                "priority": "ÉLEVÉE",
                "title": f"Score sécurité à améliorer: {security_score}%",
                "description": "Le niveau de sécurité est moyen. Des améliorations sont recommandées.",
                "actions": [
                    "Continuer la correction des risques",
                    "Renforcer la surveillance",
                    "Former le personnel à la sécurité"
                ],
                "actionable": True
            })
        
        # Low compliance score
        if compliance_score < 60:
            recommendations.append({
                "category": "Conformité",
                "priority": "ÉLEVÉE",
                "title": f"Score conformité faible: {compliance_score}%",
                "description": "Le niveau de conformité aux référentiels est insuffisant.",
                "actions": [
                    "Mettre à jour la documentation de sécurité",
                    "Aligner les processus sur ISO 27001/NIST",
                    "Préparer un plan de conformité",
                    "Envisager un audit de conformité"
                ],
                "actionable": True
            })
        
        return recommendations
    
    def _generate_document_recommendations(self, documents: List[Dict]) -> List[Dict]:
        """Generate recommendations based on document analysis"""
        recommendations = []
        
        if not documents:
            return recommendations
        
        # Count by classification
        conf_counts = {}
        for doc in documents:
            conf = doc.get("confidentiality_level", "INTERNE")
            conf_counts[conf] = conf_counts.get(conf, 0) + 1
        
        # High number of confidential documents
        total_docs = len(documents)
        conf_ratio = conf_counts.get("CONFIDENTIEL", 0) + conf_counts.get("TRES_CONFIDENTIEL", 0)
        
        if conf_ratio > total_docs * 0.3:
            recommendations.append({
                "category": "Classification",
                "priority": "MOYENNE",
                "title": f"{conf_ratio} documents confidentiels ({conf_ratio/total_docs*100:.1f}%)",
                "description": "Une proportion élevée de documents est classifiée comme confidentielle.",
                "actions": [
                    "Vérifier la pertinence de la classification",
                    "S'assurer que les contrôles d'accès sont appropriés",
                    "Revoir la politique de classification"
                ],
                "actionable": True
            })
        
        # Unanalyzed documents
        unanalyzed = [d for d in documents if d.get("analysis_status") != "COMPLETED"]
        if unanalyzed:
            recommendations.append({
                "category": "Analyse",
                "priority": "MOYENNE",
                "title": f"{len(unanalyzed)} document(s) non analysé(s)",
                "description": "Certains documents n'ont pas été analysés pour détecter les risques.",
                "actions": [
                    "Lancer l'analyse des documents en attente",
                    "Automatiser l'analyse des nouveaux documents",
                    "Vérifier les erreurs d'analyse"
                ],
                "actionable": True
            })
        
        return recommendations
    
    def _prioritize_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Sort recommendations by priority"""
        priority_order = {"CRITIQUE": 0, "ÉLEVÉE": 1, "HAUTE": 1, "MOYENNE": 2, "FAIBLE": 3}
        
        return sorted(
            recommendations,
            key=lambda x: priority_order.get(x.get("priority", "MOYENNE"), 2)
        )
    
    def generate_ai_recommendations(self, user_question: str, context: str = None) -> str:
        """
        Generate AI-powered recommendations using LLM
        """
        try:
            from app.services.llm_service import get_llm
            
            llm = get_llm()
            if not llm:
                return self._generate_fallback_recommendations()
            
            # Get current recommendations
            recommendations = self.generate_recommendations()
            
            # Build context for LLM
            rec_context = "Recommandations actuelles:\n"
            for i, rec in enumerate(recommendations[:5], 1):
                rec_context += f"{i}. [{rec['priority']}] {rec['title']}\n"
                rec_context += f"   {rec['description']}\n"
                if rec.get("actions"):
                    rec_context += "   Actions:\n"
                    for action in rec["actions"][:3]:
                        rec_context += f"   - {action}\n"
                rec_context += "\n"
            
            prompt = f"""{rec_context}

Question de l'utilisateur: {user_question}

Génère une réponse personnalisée avec des recommandations actionnables:
1. Réponds directement à la question
2. Propose 3-5 actions concrètes et prioritaires
3. Sois spécifique et pragmatique
4. Utilise un format structuré avec des listes

Si la question demande "que dois-je faire", donne un plan d'action priorisé."""
            
            response = llm.invoke(prompt)
            return response.content if hasattr(response, 'content') else str(response)
            
        except Exception as e:
            logger.error(f"Error generating AI recommendations: {e}")
            return self._generate_fallback_recommendations()
    
    def _generate_fallback_recommendations(self) -> str:
        """Generate fallback recommendations when LLM is not available"""
        recommendations = self.generate_recommendations()
        
        if not recommendations:
            return "✅ Aucune recommandation particulière. Le système semble en bonne santé."
        
        response = "💡 **Recommandations prioritaires:**\n\n"
        
        for i, rec in enumerate(recommendations[:5], 1):
            response += f"{i}. **{rec['title']}** [{rec['priority']}]\n"
            response += f"   {rec['description']}\n"
            if rec.get("actions"):
                response += "   Actions:\n"
                for action in rec["actions"][:3]:
                    response += f"   • {action}\n"
            response += "\n"
        
        return response


# Global instance
recommendation_engine = RecommendationEngine()
