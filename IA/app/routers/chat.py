from fastapi import APIRouter
from typing import List, Dict, Any

from app.schemas.requests import ChatRequest, ChatResponse
from app.db import insert_copilot_history, fetch_copilot_history, fetch_statistics, fetch_risks, fetch_all_documents
from app.services.llm_service import generate_response, get_llm
from app.services.context_service import build_context_for_query, fetch_structured_data
from app.services.answer_builder import AnswerBuilder
from app.services.function_calling import function_calling_service
from app.intent_detector import IntentDetector
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Conversation memory (in-memory for now; could be extended to DB)
conversation_memory: Dict[int, List[Dict[str, str]]] = {}

# Intent detector
intent_detector = IntentDetector()


@router.get("/dashboard-stats")
def get_dashboard_stats():
    """Get real dashboard statistics from database"""
    try:
        stats = fetch_statistics()
        risks = fetch_risks()
        docs = fetch_all_documents()
        
        # Count risks by severity
        critical_count = sum(1 for r in risks if r.get('severity') in ['CRITIQUE', 'CRITICAL'])
        high_count = sum(1 for r in risks if r.get('severity') in ['ELEVE', 'HAUT', 'HIGH'])
        medium_count = sum(1 for r in risks if r.get('severity') in ['MOYEN', 'MEDIUM'])
        low_count = sum(1 for r in risks if r.get('severity') in ['FAIBLE', 'BAS', 'LOW'])
        
        # Count confidential documents
        confidential_count = sum(1 for d in docs if d.get('confidentiality_level') in ['CONFIDENTIEL', 'TRES_CONFIDENTIEL', 'TRÈS CONFIDENTIEL'])
        
        return {
            "success": True,
            "data": {
                "documents_count": stats.get('documents_count', len(docs)),
                "risks_count": stats.get('risks_count', len(risks)),
                "critical_risks": critical_count,
                "high_risks": high_count,
                "medium_risks": medium_count,
                "low_risks": low_count,
                "confidential_documents": confidential_count,
                "sensitive_data_count": stats.get('sensitive_count', 0),
                "reports_count": stats.get('reports_count', 0),
                "users_count": stats.get('users_count', 2),
                "risks_by_severity": {
                    "CRITIQUE": critical_count,
                    "ELEVE": high_count,
                    "MOYEN": medium_count,
                    "FAIBLE": low_count
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        return {"success": False, "data": None, "error": str(e)}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, conversation_id: int = 1):
    """Chat endpoint that uses RAG (Retrieval-Augmented Generation) to answer questions."""
    user_question = request.get_text() or ""
    sources = []

    # Initialize conversation history if not exists
    if conversation_id not in conversation_memory:
        conversation_memory[conversation_id] = []

    try:
        # Step 1: Use detect_query_type to determine query type (single source of truth)
        from app.services.context_service import detect_query_type
        query_types = detect_query_type(user_question)
        logger.info(f"Detected query types: {query_types}")
        
        # Check for knowledge-related query types
        knowledge_types = ["knowledge", "best_practice", "password_knowledge", "classification_knowledge", "inventory_knowledge", "assets_knowledge", "referentials", "explain"]
        is_knowledge_query = any(qt in query_types for qt in knowledge_types)
        
        # Check for compliance report
        is_compliance_report = "compliance_report" in query_types
        
        # Step 2: Knowledge Base routing (FIRST)
        if is_knowledge_query:
            from app.services.knowledge_base import knowledge_base
            kb_context = knowledge_base.format_for_llm(user_question)
            if kb_context and "Aucune information" not in kb_context and "Aucune information spécifique" not in kb_context:
                answer = kb_context
                logger.info(f"Using Knowledge Base for knowledge query")
                # Update conversation memory
                conversation_memory[conversation_id].append({"role": "user", "content": user_question})
                conversation_memory[conversation_id].append({"role": "assistant", "content": answer})
                insert_copilot_history(None, user_question, answer)
                return ChatResponse(answer=answer, sources=[])
            else:
                # KB didn't have answer, fall through to database routing
                logger.info(f"Knowledge Base didn't have answer, falling through to database")
        
        # Step 3: Compliance report routing (generate structured report without LLM)
        if is_compliance_report:
            from app.db import fetch_statistics, fetch_security_scores, fetch_all_documents, fetch_risks
            try:
                stats = fetch_statistics()
                scores = fetch_security_scores()
                docs = fetch_all_documents()
                risks = fetch_risks()
                
                # Calculate statistics
                total_docs = len(docs)
                total_risks = len(risks)
                critical_risks = len([r for r in risks if r.get('severity') == 'CRITIQUE'])
                high_risks = len([r for r in risks if r.get('severity') == 'HAUT' or r.get('severity') == 'HIGH'])
                medium_risks = len([r for r in risks if r.get('severity') == 'MOYEN' or r.get('severity') == 'MEDIUM'])
                low_risks = len([r for r in risks if r.get('severity') == 'BAS' or r.get('severity') == 'LOW'])
                confidential_docs = len([d for d in docs if 'CONFIDENTIEL' in d.get('confidentiality_level', '')])
                
                # Generate structured report
                report = f"""========================
RAPPORT DE CONFORMITÉ
========================

Documents analysés : {total_docs}
Risques détectés : {total_risks}

Risques par sévérité :
- Critiques : {critical_risks}
- Élevés : {high_risks}
- Moyens : {medium_risks}
- Bas : {low_risks}

Documents confidentiels : {confidential_docs}

Scores de sécurité : {scores}

Statistiques générales : {stats}

Référentiels couverts :
✓ ISO 27001
✓ NIST CSF
✓ Loi 09-08
✓ CIS Controls

Recommandations principales :
- Hacher tous les mots de passe en clair
- Activer l'authentification multi-facteur (MFA)
- Chiffrer les documents confidentiels
- Corriger les risques critiques dans les plus brefs délais
- Mettre en place des politiques de gestion des mots de passe
========================
"""
                
                # Update conversation memory
                conversation_memory[conversation_id].append({"role": "user", "content": user_question})
                conversation_memory[conversation_id].append({"role": "assistant", "content": report})
                insert_copilot_history(None, user_question, report)
                return ChatResponse(answer=report, sources=[])
            except Exception as e:
                logger.error(f"Error generating compliance report: {e}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                answer = "Erreur lors de la génération du rapport de conformité. Veuillez réessayer."
                conversation_memory[conversation_id].append({"role": "user", "content": user_question})
                conversation_memory[conversation_id].append({"role": "assistant", "content": answer})
                insert_copilot_history(None, user_question, answer)
                return ChatResponse(answer=answer, sources=[])
        
        # Step 4: Database routing (AFTER Knowledge Base)
        # Detect intent
        intent_result = intent_detector.detect_intent(user_question)
        logger.info(f"Detected intent: {intent_result['intent']} (confidence: {intent_result['confidence']})")
        
        # Use function calling for structured queries
        function_result = function_calling_service.parse_and_execute(user_question)
        if function_result.get("success"):
            logger.info(f"Function called: {function_result['function']}")
            # Add function result to context
            structured_data = fetch_structured_data(user_question)
            structured_data["function_result"] = function_result
        else:
            # Fallback to regular data fetching
            structured_data = fetch_structured_data(user_question)
        
        # Step 5: Data query - use AnswerBuilder directly (no LLM rewrite for now)
        answer = AnswerBuilder.build_answer(user_question.lower(), structured_data)
        logger.info(f"Using AnswerBuilder directly: {len(answer)} characters")
        
        # If AnswerBuilder returned a generic message, try using knowledge base as fallback
        if "Aucune information disponible" in answer or "Posez une question précise" in answer:
            logger.info(f"AnswerBuilder returned generic message, trying knowledge base fallback")
            from app.services.knowledge_base import knowledge_base
            kb_fallback = knowledge_base.format_for_llm(user_question)
            if kb_fallback and "Aucune information" not in kb_fallback and "Aucune information spécifique" not in kb_fallback:
                answer = kb_fallback
                logger.info(f"Using Knowledge Base fallback")
            
        # Update conversation history
        conversation_memory[conversation_id].append({"role": "user", "content": user_question})
        conversation_memory[conversation_id].append({"role": "assistant", "content": answer})
        
        # Keep only last 10 exchanges to manage memory
        if len(conversation_memory[conversation_id]) > 20:
            conversation_memory[conversation_id] = conversation_memory[conversation_id][-20:]
        
        # Save to DB history
        insert_copilot_history(None, user_question, answer)
        
        return ChatResponse(answer=answer, sources=sources)
        
    except Exception as e:
        import traceback
        logger.error(f"Error in chat endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        error_answer = "Une erreur est survenue lors du traitement de votre question. Veuillez réessayer plus tard."
        
        # Update memory even on error
        conversation_memory[conversation_id].append({"role": "user", "content": user_question})
        conversation_memory[conversation_id].append({"role": "assistant", "content": error_answer})
        
        insert_copilot_history(None, user_question, error_answer)
        
        return ChatResponse(answer=error_answer, sources=[])


@router.post("/summary")
def generate_summary_endpoint(summary_type: str = "dashboard"):
    """Generate intelligent summaries for dashboard, risks, documents, etc."""
    try:
        from app.services.llm_service import generate_summary
        from app.services.context_service import fetch_structured_data
        
        # Fetch all relevant data
        data = fetch_structured_data("summary dashboard")
        
        # Generate summary
        summary = generate_summary(data, summary_type)
        
        return {"summary": summary, "type": summary_type}
        
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return {"summary": "Erreur lors de la génération du résumé.", "type": summary_type}


@router.get("/history")
def get_chat_history(limit: int = 100):
    """Fetch copilot chat history from database"""
    try:
        history = fetch_copilot_history(limit)
        return {"success": True, "data": history}
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        return {"success": False, "data": [], "error": str(e)}


@router.post("/recommendations")
def get_recommendations(user_question: str = ""):
    """Get AI-powered recommendations"""
    try:
        from app.services.recommendation_engine import recommendation_engine
        from app.services.context_service import build_context_for_query
        
        context = build_context_for_query(user_question) if user_question else None
        recommendations = recommendation_engine.generate_ai_recommendations(user_question, context)
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        return {"recommendations": "Erreur lors de la génération des recommandations."}


@router.post("/dashboard")
def get_dashboard_summary():
    """Get comprehensive dashboard summary with statistics"""
    try:
        from app.services.context_service import fetch_statistics
        from app.services.llm_service import generate_summary
        
        # Fetch statistics
        stats = fetch_statistics()
        
        # Generate intelligent summary
        data = {"stats": stats}
        summary = generate_summary(data, "dashboard")
        
        return {
            "statistics": stats,
            "summary": summary,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error generating dashboard: {e}")
        return {"error": str(e), "statistics": {}, "summary": "Erreur."}


@router.get("/status")
def get_status():
    """Get the status of the AI service and LLM connection."""
    try:
        llm = get_llm()
        llm_status = "connected" if llm else "not_configured"
        
        from app.config import settings
        
        return {
            "status": "running",
            "llm_provider": settings.llm_provider,
            "llm_status": llm_status,
            "llm_model": settings.openai_model if settings.llm_provider == "openai" else settings.ollama_model,
            "active_conversations": len(conversation_memory)
        }
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return {"status": "error", "error": str(e)}
