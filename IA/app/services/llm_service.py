from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Global LLM instance
_llm_instance = None


def get_llm():
    """Get the appropriate LLM based on configuration (cached)."""
    global _llm_instance
    
    if _llm_instance is not None:
        return _llm_instance
    
    try:
        if settings.llm_provider == "openai":
            if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key_here":
                raise ValueError("OPENAI_API_KEY is not configured")
            from langchain_openai import ChatOpenAI
            _llm_instance = ChatOpenAI(
                model=settings.openai_model,
                api_key=settings.openai_api_key,
                temperature=0.7,
                max_tokens=2000
            )
        elif settings.llm_provider == "ollama":
            from langchain_ollama import ChatOllama
            _llm_instance = ChatOllama(
                model=settings.ollama_model,
                base_url=settings.ollama_base_url,
                temperature=0,  # More deterministic
                num_ctx=4096,
                num_predict=2000,
                timeout=60,  # 60 seconds timeout
                streaming=False  # Disable streaming for now
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {settings.llm_provider}")
        
        logger.info(f"LLM initialized: {settings.llm_provider} - {settings.openai_model if settings.llm_provider == 'openai' else settings.ollama_model}")
        return _llm_instance
    except ImportError as e:
        logger.warning(f"LLM dependencies not installed: {e}")
        return None
    except Exception as e:
        logger.error(f"Error initializing LLM: {e}")
        return None


def build_prompt(context: str, user_question: str, conversation_history: list = None) -> str:
    """Build a RAG prompt - strict for context, flexible for rewrite."""
    prompt_parts = []
    
    # Check if this is a rewrite task (context contains "Texte à réécrire")
    is_rewrite = "Texte à réécrire" in context if context else False
    
    if is_rewrite:
        # For rewrite tasks, use the context as-is (it already has instructions)
        return context
    else:
        # For RAG tasks, use strict rules
        prompt_parts.append("Tu es Copilot RSSI, un assistant en sécurité de l'information.")
        prompt_parts.append("Réponds toujours en français de manière professionnelle.")
        prompt_parts.append("")
        prompt_parts.append("RÈGLES IMPORTANTES:")
        prompt_parts.append("- Réponds UNIQUEMENT avec les informations du CONTEXTE fourni.")
        prompt_parts.append("- N'invente JAMAIS une information qui n'est pas dans le contexte.")
        prompt_parts.append("- Si le contexte ne contient pas la réponse, réponds: 'Je ne dispose pas de cette information dans la base de données.'")
        prompt_parts.append("- N'utilise PAS tes connaissances générales pour compléter les informations.")
        prompt_parts.append("")
        
        # Add context if available
        if context and context.strip():
            prompt_parts.append("CONTEXTE:")
            prompt_parts.append(context)
            prompt_parts.append("")
        else:
            prompt_parts.append("CONTEXTE: (vide)")
            prompt_parts.append("")
        
        # Add current question
        prompt_parts.append("QUESTION:")
        prompt_parts.append(user_question)
        prompt_parts.append("")
        prompt_parts.append("RÉPONSE:")
        
        return "\n".join(prompt_parts)


def fallback_response(context: str, user_question: str) -> str:
    """Fallback response when LLM is not available, using basic keyword matching and context."""
    q = user_question.lower()
    
    if any(kw in q for kw in ["bonjour", "salut", "hello", "hi", "ça va", "comment ça va"]):
        return "Bonjour ! Je suis Copilot RSSI, votre assistant en sécurité informatique. Posez-moi une question sur les documents, risques, données sensibles, rapports, ou référentiels !"
        
    # For questions about confidentiels
    if any(kw in q for kw in ["confidentiel", "confidentiels", "très confidentiel"]):
        if context:
            return f"Voici les informations disponibles :\n{context}"
        return "Aucun document confidentiel trouvé pour le moment."
        
    if any(kw in q for kw in ["risque critique", "risques critiques", "gravité critique"]):
        if context:
            return f"Voici les informations disponibles sur les risques :\n{context}"
        return "Aucun risque critique trouvé pour le moment."
        
    if any(kw in q for kw in ["cin", "iban", "email", "téléphone", "phone", "passeport"]):
        if context:
            return f"Voici les informations sur les données sensibles :\n{context}"
        return "Aucune donnée sensible de ce type trouvée pour le moment."
        
    # Fallback
    if context:
        return f"Voici les informations de la base de données :\n{context}"
    else:
        return "Aucune information disponible dans la base de données pour le moment."


def generate_response(context: str, user_question: str, conversation_history: list = None) -> str:
    """Generate a response using the LLM and RAG context, with fallback."""
    try:
        llm = get_llm()
        if llm:
            prompt = build_prompt(context, user_question, conversation_history)
            logger.info(f"Prompt length: {len(prompt)} characters")
            logger.info("===== CALLING OLLAMA =====")
            
            # Use HumanMessage format for better compatibility
            from langchain_core.messages import HumanMessage
            response = llm.invoke([HumanMessage(content=prompt)])
            
            logger.info(f"===== OLLAMA RESPONSE: {response} =====")
            
            if hasattr(response, 'content'):
                return response.content
            else:
                return str(response)
        else:
            logger.warning("LLM not available, using fallback")
            return fallback_response(context, user_question)
    except Exception as e:
        import traceback
        logger.error(f"Error generating response: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Only use fallback if LLM is truly not available, not on connection errors
        if "WinError" in str(e) or "connection" in str(e).lower():
            # Connection error - try once more with retry
            try:
                llm = get_llm()
                if llm:
                    prompt = build_prompt(context, user_question, conversation_history)
                    from langchain_core.messages import HumanMessage
                    response = llm.invoke([HumanMessage(content=prompt)])
                    if hasattr(response, 'content'):
                        return response.content
                    else:
                        return str(response)
            except Exception as retry_e:
                logger.error(f"Retry also failed: {retry_e}")
                logger.error(f"Retry traceback: {traceback.format_exc()}")
        # If still failing, use fallback
        return fallback_response(context, user_question)


def generate_summary(data: dict, summary_type: str) -> str:
    """Generate intelligent summaries for risks, documents, etc."""
    try:
        llm = get_llm()
        if not llm:
            return generate_fallback_summary(data, summary_type)
        
        if summary_type == "risks":
            return generate_risks_summary(data, llm)
        elif summary_type == "documents":
            return generate_documents_summary(data, llm)
        elif summary_type == "dashboard":
            return generate_dashboard_summary(data, llm)
        else:
            return generate_fallback_summary(data, summary_type)
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return generate_fallback_summary(data, summary_type)


def generate_risks_summary(data: dict, llm) -> str:
    """Generate intelligent risk summary"""
    risks = data.get("risks", [])
    if not risks:
        return "✅ Aucun risque détecté. Le système est en bonne santé."
    
    # Count by severity
    severity_counts = {}
    for risk in risks:
        severity = risk.get("severity", "UNKNOWN")
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
    
    # Build context for LLM
    context = f"""Risques détectés: {len(risks)}
Par gravité:
- CRITIQUE: {severity_counts.get('CRITIQUE', 0)}
- ÉLEVÉ: {severity_counts.get('ÉLEVÉ', 0)}
- MOYEN: {severity_counts.get('MOYEN', 0)}
- FAIBLE: {severity_counts.get('FAIBLE', 0)}

Risques principaux:
"""
    
    for risk in risks[:5]:  # Top 5 risks
        context += f"- {risk.get('title', 'N/A')} ({risk.get('severity', 'N/A')})\n"
    
    prompt = f"""{context}

Génère un résumé exécutif des risques en 3-4 points maximum:
1. Point principal sur les risques critiques
2. Point sur les risques élevés
3. Recommandation prioritaire

Sois concis et professionnel."""
    
    response = llm.invoke(prompt)
    return response.content if hasattr(response, 'content') else str(response)


def generate_documents_summary(data: dict, llm) -> str:
    """Generate intelligent document summary"""
    documents = data.get("documents", [])
    if not documents:
        return "📄 Aucun document analysé."
    
    # Count by type
    type_counts = {}
    for doc in documents:
        doc_type = doc.get("document_type", "AUTRE")
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
    
    # Count by classification
    conf_counts = {}
    for doc in documents:
        conf = doc.get("confidentiality_level", "INTERNE")
        conf_counts[conf] = conf_counts.get(conf, 0) + 1
    
    context = f"""Documents analysés: {len(documents)}
Par type:
"""
    for doc_type, count in type_counts.items():
        context += f"- {doc_type}: {count}\n"
    
    context += "\nPar classification:\n"
    for conf, count in conf_counts.items():
        context += f"- {conf}: {count}\n"
    
    prompt = f"""{context}

Génère un résumé du parc documentaire en 2-3 points:
1. Volume et types principaux
2. Niveau de sensibilité
3. Point d'attention si nécessaire"""
    
    response = llm.invoke(prompt)
    return response.content if hasattr(response, 'content') else str(response)


def generate_dashboard_summary(data: dict, llm) -> str:
    """Generate intelligent dashboard summary"""
    stats = data.get("stats", {})
    
    context = f"""État du système:
- Documents: {stats.get('documents_count', 0)}
- Risques: {stats.get('risks_count', 0)}
- Données sensibles: {stats.get('sensitive_count', 0)}
- Score sécurité: {stats.get('security_score', 0)}%
- Score conformité: {stats.get('compliance_score', 0)}%
"""
    
    prompt = f"""{context}

Génère un résumé exécutif de l'état de sécurité en 3-4 points:
1. État général (sain/préoccupant/critique)
2. Points forts
3. Points d'attention prioritaires
4. Action recommandée"""
    
    response = llm.invoke(prompt)
    return response.content if hasattr(response, 'content') else str(response)


def generate_fallback_summary(data: dict, summary_type: str) -> str:
    """Fallback summary when LLM is not available"""
    if summary_type == "risks":
        risks = data.get("risks", [])
        if not risks:
            return "✅ Aucun risque détecté."
        return f"⚠️ {len(risks)} risques détectés. Configurez un LLM pour des résumés détaillés."
    elif summary_type == "documents":
        docs = data.get("documents", [])
        return f"📄 {len(docs)} documents analysés."
    elif summary_type == "dashboard":
        stats = data.get("stats", {})
        return f"📊 Documents: {stats.get('documents_count', 0)}, Risques: {stats.get('risks_count', 0)}"
    return "Données insuffisantes pour le résumé."

