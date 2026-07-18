from typing import Dict, Any
from app.db import (
    fetch_all_documents,
    fetch_risks,
    fetch_recommendations,
    fetch_all_sensitive_data,
    fetch_all_reports,
    fetch_referentials,
    fetch_security_scores,
    fetch_latest_analysis,
    fetch_statistics,
    fetch_users,
    fetch_documents_by_extension,
    fetch_largest_documents,
    fetch_documents_by_date,
    fetch_document_content,
    fetch_unanalyzed_documents,
)
from app.services.knowledge_base import knowledge_base
import logging

logger = logging.getLogger(__name__)


def detect_query_type(user_question: str) -> list:
    """Detect what type of query it is (documents, risks, sensitive data, reports, referentials, stats, general."""
    q = user_question.lower()
    types = []
    
    # 0. KNOWLEDGE/REFERENTIAL QUERIES - HIGHEST PRIORITY
    # These should use Knowledge Base + LLM, not database
    knowledge_keywords = [
        "iso", "27001", "27002", "27701",
        "nist", "nist csf", "nis2",
        "rgpd", "gdpr",
        "loi 09-08", "09 08",
        "cis", "cis controls",
        "pci dss", "soc2", "cobit",
        "actifs informationnels", "actif informationnel", "asset", "assets"
    ]
    explain_keywords = [
        "explique", "qu'est-ce que", "qu est ce que", "c'est quoi", "c est quoi",
        "définition", "definition", "définis", "definis", "présente", "presente",
        "qu'est-ce", "qu est ce"
    ]
    best_practice_keywords = [
        "comment", "gérer", "gerer", "classer", "protéger", "proteger",
        "sécuriser", "securiser", "stocker", "comment fonctionne"
    ]
    
    # Specific knowledge routing for common queries
    if any(x in q for x in ["mot de passe", "password", "bcrypt", "argon2", "hash", "hachage"]):
        types.append("password_knowledge")
        return types  # Early return for password knowledge
    
    if any(x in q for x in ["classer", "classification", "document rh", "rh"]):
        types.append("classification_knowledge")
        return types  # Early return for classification knowledge
    
    if "inventaire automatique" in q:
        types.append("inventory_knowledge")
        return types  # Early return for inventory knowledge
    
    if any(x in q for x in ["actifs informationnels", "actifs", "asset"]):
        types.append("assets_knowledge")
        return types  # Early return for assets knowledge
    
    if any(kw in q for kw in knowledge_keywords):
        types.append("knowledge")
    if any(kw in q for kw in explain_keywords):
        types.append("knowledge")
    if any(kw in q for kw in best_practice_keywords):
        types.append("best_practice")
    
    # If it's a knowledge/best_practice query, return early - don't add other types
    if "knowledge" in types or "best_practice" in types:
        return types
    
    # 1. Specific data type queries (highest priority)
    if "cin" in q:
        types.append("cin_specific")
    if "iban" in q:
        types.append("iban_specific")
    if "mot de passe" in q or "password" in q:
        # Distinguish between data query and knowledge query
        if any(x in q for x in ["comment", "gérer", "gerer", "sécuriser", "securiser", "protéger", "proteger", "stocker", "hash", "bcrypt", "argon2", "chiffrer", "chiffrement"]):
            types.append("knowledge")  # Knowledge query
        else:
            types.append("password_specific")  # Data query
    if "email" in q:
        types.append("email_specific")
    
    # 2. Specific document type queries
    if "contrat" in q:
        types.append("contract_specific")
    if "facture" in q:
        types.append("invoice_specific")
    if "rapport" in q:
        types.append("report_specific")
    
    # 3. Severity-specific queries
    if "critique" in q:
        types.append("critical_risks")
    if "élevé" in q or "haute" in q:
        types.append("high_risks")
    
    # 4. Report generation queries
    if "rapport de conformité" in q or "rapport de conformite" in q or "générer rapport" in q or "generer rapport" in q:
        types.append("compliance_report")
    
    # If it's a compliance report, return early
    if "compliance_report" in types:
        return types
    
    # 4. Classification-specific queries
    if "confidentiel" in q:
        types.append("confidential_docs")
    if "très confidentiel" in q:
        types.append("very_confidential_docs")
    
    # 5. Count queries
    if "combien" in q:
        types.append("count_query")
    
    # 6. General queries (only if no specific type detected)
    if not types:
        if any(kw in q for kw in ["document", "documents", "inventaire"]):
            types.append("documents")
        if any(kw in q for kw in ["risque", "risques"]):
            types.append("risks")
        if any(kw in q for kw in ["référentiel"]):
            types.append("referentials")
        if any(kw in q for kw in ["score", "conformité"]):
            types.append("compliance")
        if any(kw in q for kw in ["recommandation", "que dois-je faire"]):
            types.append("recommendations")
        if any(kw in q for kw in ["résume", "système", "dashboard"]):
            types.append("dashboard")
    
    if not types:
        types = ["general"]
    return types


def fetch_structured_data(user_question: str) -> Dict[str, Any]:
    """Fetch structured data for AnswerBuilder based on detected query type."""
    query_types = detect_query_type(user_question)
    data = {
        "documents": [],
        "risks": [],
        "sensitive_data": [],
        "reports": [],
        "referentials": [],
        "stats": {},
        "users": [],
        "security_scores": {},
        "latest_analysis": {},
        "unanalyzed": []
    }
    
    # Always fetch documents for most queries
    if "documents" in query_types or "file_types" in query_types or "document_types" in query_types or "classification" in query_types or "confidential_docs" in query_types or "contract_specific" in query_types or "general" in query_types:
        try:
            data["documents"] = fetch_all_documents()
        except Exception as e:
            logger.error(f"Error fetching docs: {e}")
            
    if "risks" in query_types or "critical_risks" in query_types or "general" in query_types or "recommendations" in query_types:
        try:
            data["risks"] = fetch_risks()
        except Exception as e:
            logger.error(f"Error fetching risks: {e}")
            
    if "sensitive_data" in query_types or "cin_specific" in query_types or "password_specific" in query_types or "general" in query_types:
        try:
            data["sensitive_data"] = fetch_all_sensitive_data()
        except Exception as e:
            logger.error(f"Error fetching sensitive data: {e}")
            
    if "reports" in query_types or "general" in query_types:
        try:
            data["reports"] = fetch_all_reports()
        except Exception as e:
            logger.error(f"Error fetching reports: {e}")
            
    if "referentials" in query_types or "general" in query_types:
        try:
            data["referentials"] = fetch_referentials()
        except Exception as e:
            logger.error(f"Error fetching referentials: {e}")
            
    if "stats" in query_types or "compliance" in query_types or "dashboard" in query_types or "general" in query_types:
        try:
            data["stats"] = fetch_statistics()
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
            
    if "users" in query_types or "general" in query_types:
        try:
            data["users"] = fetch_users()
        except Exception as e:
            logger.error(f"Error fetching users: {e}")
            
    if "compliance" in query_types or "general" in query_types:
        try:
            data["security_scores"] = fetch_security_scores()
        except Exception as e:
            logger.error(f"Error fetching security scores: {e}")
            
    if "analyses" in query_types or "general" in query_types:
        try:
            data["latest_analysis"] = fetch_latest_analysis()
        except Exception as e:
            logger.error(f"Error fetching latest analysis: {e}")
            
    if "analyses" in query_types:
        try:
            data["unanalyzed"] = fetch_unanalyzed_documents()
        except Exception as e:
            logger.error(f"Error fetching unanalyzed docs: {e}")
            
    return data


def build_context_for_query(user_question: str) -> str:
    """Build relevant context based on detected query type (for LLM)."""
    query_types = detect_query_type(user_question)
    context_parts = []
    q = user_question.lower()
    
    # Knowledge/referential/best_practice questions - use KB only, no database
    if "referentials" in query_types or "explain" in query_types or "knowledge" in query_types or "best_practice" in query_types:
        try:
            kb_context = knowledge_base.format_for_llm(user_question)
            if kb_context and "Aucune information" not in kb_context:
                context_parts.append(kb_context)
                # Return early - don't fetch database for knowledge questions
                final_context = "\n".join(context_parts)
                if not final_context.strip():
                    # Return empty string for LLM to use its own knowledge
                    return ""
                return final_context
            else:
                # No KB info, return empty string for LLM to use its own knowledge
                return ""
        except Exception as e:
            logger.error(f"Error fetching KB: {e}")
            # On error, return empty string for LLM to use its own knowledge
            return ""
    
    # Specific data type queries - fetch only relevant data (no ## headers for LLM)
    if "cin_specific" in query_types:
        try:
            from app.db import fetch_all_sensitive_data
            sensitive = fetch_all_sensitive_data()
            cin_data = [s for s in sensitive if s.get('data_type') == 'CIN']
            if cin_data:
                # Get unique document names
                unique_docs = list(set([s.get('file_name') for s in cin_data]))
                context_parts.append(f"Documents avec CIN: {len(unique_docs)}")
                for doc in unique_docs[:10]:  # Limit to 10
                    context_parts.append(f"- {doc}")
        except Exception as e:
            logger.error(f"Error fetching CIN data: {e}")
    
    elif "iban_specific" in query_types:
        try:
            from app.db import fetch_all_sensitive_data
            sensitive = fetch_all_sensitive_data()
            iban_data = [s for s in sensitive if 'iban' in s.get('data_type', '').lower()]
            if iban_data:
                # Get unique document names
                unique_docs = list(set([s.get('file_name') for s in iban_data]))
                context_parts.append(f"Documents avec IBAN: {len(unique_docs)}")
                for doc in unique_docs[:10]:  # Limit to 10
                    context_parts.append(f"- {doc}")
        except Exception as e:
            logger.error(f"Error fetching IBAN data: {e}")
    
    elif "contract_specific" in query_types:
        try:
            from app.db import fetch_all_documents
            docs = fetch_all_documents()
            contracts = [d for d in docs if d.get('document_type') == 'CONTRAT']
            if contracts:
                context_parts.append(f"Contrats: {len(contracts)}")
                for doc in contracts[:10]:
                    context_parts.append(f"- {doc.get('file_name')} ({doc.get('confidentiality_level')})")
        except Exception as e:
            logger.error(f"Error fetching contracts: {e}")
    
    elif "critical_risks" in query_types:
        try:
            from app.db import fetch_risks
            risks = fetch_risks()
            critical = [r for r in risks if r.get('severity') == 'CRITIQUE']
            if critical:
                context_parts.append(f"Risques critiques: {len(critical)}")
                for risk in critical[:5]:
                    context_parts.append(f"- {risk.get('title')} ({risk.get('status')})")
        except Exception as e:
            logger.error(f"Error fetching critical risks: {e}")
    
    elif "confidential_docs" in query_types:
        try:
            from app.db import fetch_all_documents
            docs = fetch_all_documents()
            conf = [d for d in docs if d.get('confidentiality_level') == 'CONFIDENTIEL']
            if conf:
                context_parts.append(f"Documents confidentiels: {len(conf)}")
                for doc in conf[:10]:
                    context_parts.append(f"- {doc.get('file_name')} ({doc.get('document_type')})")
        except Exception as e:
            logger.error(f"Error fetching confidential docs: {e}")
    
    elif "count_query" in query_types:
        try:
            from app.db import fetch_statistics
            stats = fetch_statistics()
            context_parts.append("Statistiques:")
            for key, value in stats.items():
                context_parts.append(f"- {key}: {value}")
        except Exception as e:
            logger.error(f"Error fetching stats: {e}")
    
    elif "dashboard" in query_types:
        try:
            from app.db import fetch_statistics, fetch_security_scores
            stats = fetch_statistics()
            scores = fetch_security_scores()
            context_parts.append("État du système:")
            context_parts.append(f"Documents: {stats.get('documents_count', 0)}")
            context_parts.append(f"Risques: {stats.get('risks_count', 0)}")
            context_parts.append(f"Score sécurité: {scores.get('security_score', 0)}%")
            context_parts.append(f"Score conformité: {scores.get('compliance_score', 0)}%")
        except Exception as e:
            logger.error(f"Error fetching dashboard: {e}")
    
    elif "recommendations" in query_types:
        try:
            from app.db import fetch_risks
            risks = fetch_risks()
            if risks:
                context_parts.append(f"Risques détectés: {len(risks)}")
                # Count by severity
                severity_counts = {}
                for r in risks:
                    sev = r.get('severity', 'N/A')
                    severity_counts[sev] = severity_counts.get(sev, 0) + 1
                for sev, count in severity_counts.items():
                    context_parts.append(f"- {sev}: {count}")
        except Exception as e:
            logger.error(f"Error fetching risks for recommendations: {e}")
    
    # Fallback: only fetch minimal data
    elif "documents" in query_types:
        try:
            from app.db import fetch_all_documents
            docs = fetch_all_documents()
            if docs:
                context_parts.append(f"Documents analysés: {len(docs)}")
                # Only show first 5
                for doc in docs[:5]:
                    context_parts.append(f"- {doc.get('file_name')} ({doc.get('document_type')})")
        except Exception as e:
            logger.error(f"Error fetching docs: {e}")
    
    elif "risks" in query_types:
        try:
            from app.db import fetch_risks
            risks = fetch_risks()
            if risks:
                context_parts.append(f"Risques détectés: {len(risks)}")
                # Count by severity
                severity_counts = {}
                for r in risks:
                    sev = r.get('severity', 'N/A')
                    severity_counts[sev] = severity_counts.get(sev, 0) + 1
                for sev, count in severity_counts.items():
                    context_parts.append(f"- {sev}: {count}")
        except Exception as e:
            logger.error(f"Error fetching risks: {e}")
    
    final_context = "\n".join(context_parts)
    if not final_context.strip():
        final_context = "Aucune donnée disponible pour le moment dans la base de données."
    return final_context
