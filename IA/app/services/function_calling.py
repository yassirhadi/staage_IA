"""
Function Calling Service for Copilot RSSI
Enables LLM to call database functions for structured queries
"""
from typing import Dict, List, Any, Callable
import json
import logging
from app.db import (
    fetch_all_documents,
    fetch_risks,
    fetch_all_sensitive_data,
    fetch_all_reports,
    fetch_statistics,
    fetch_users,
    fetch_security_scores,
)

logger = logging.getLogger(__name__)


class FunctionCallingService:
    """Service for function calling with LLM"""
    
    def __init__(self):
        """Initialize available functions"""
        self.functions = {
            "get_documents_count": {
                "description": "Get the total number of documents in the system",
                "parameters": {},
                "function": self._get_documents_count
            },
            "get_risks_count": {
                "description": "Get the total number of risks, optionally filtered by severity",
                "parameters": {
                    "severity": {
                        "type": "string",
                        "description": "Filter by severity (CRITIQUE, ÉLEVÉ, MOYEN, FAIBLE)",
                        "required": False
                    }
                },
                "function": self._get_risks_count
            },
            "get_sensitive_data_count": {
                "description": "Get the count of sensitive data, optionally by type",
                "parameters": {
                    "data_type": {
                        "type": "string",
                        "description": "Filter by data type (CIN, IBAN, EMAIL, MOT_DE_PASSE, etc.)",
                        "required": False
                    }
                },
                "function": self._get_sensitive_data_count
            },
            "get_documents_by_type": {
                "description": "Get documents filtered by type",
                "parameters": {
                    "document_type": {
                        "type": "string",
                        "description": "Document type (CONTRAT, FACTURE, RAPPORT, PROCEDURE, etc.)",
                        "required": False
                    }
                },
                "function": self._get_documents_by_type
            },
            "get_documents_by_classification": {
                "description": "Get documents filtered by confidentiality level",
                "parameters": {
                    "confidentiality_level": {
                        "type": "string",
                        "description": "Confidentiality level (PUBLIC, INTERNE, CONFIDENTIEL, TRES_CONFIDENTIEL)",
                        "required": False
                    }
                },
                "function": self._get_documents_by_classification
            },
            "get_security_score": {
                "description": "Get the current security score",
                "parameters": {},
                "function": self._get_security_score
            },
            "get_compliance_score": {
                "description": "Get the current compliance score",
                "parameters": {},
                "function": self._get_compliance_score
            },
            "get_users_count": {
                "description": "Get the total number of users",
                "parameters": {},
                "function": self._get_users_count
            },
            "get_reports_count": {
                "description": "Get the total number of reports",
                "parameters": {},
                "function": self._get_reports_count
            },
            "get_statistics": {
                "description": "Get comprehensive system statistics",
                "parameters": {},
                "function": self._get_statistics
            }
        }
    
    def _get_documents_count(self, params: Dict = None) -> Dict:
        """Get total documents count"""
        try:
            docs = fetch_all_documents()
            return {
                "function": "get_documents_count",
                "result": len(docs),
                "success": True,
                "summary": f"{len(docs)} documents analysés"
            }
        except Exception as e:
            logger.error(f"Error in get_documents_count: {e}")
            return {"function": "get_documents_count", "error": str(e), "success": False}
    
    def _get_risks_count(self, params: Dict = None) -> Dict:
        """Get risks count, optionally filtered by severity"""
        try:
            risks = fetch_risks()
            if params and "severity" in params:
                severity = params["severity"].upper()
                risks = [r for r in risks if r.get("severity") == severity]
            return {
                "function": "get_risks_count",
                "result": len(risks),
                "success": True,
                "filter": params,
                "summary": f"{len(risks)} risques" + (f" ({severity})" if params and "severity" in params else "")
            }
        except Exception as e:
            logger.error(f"Error in get_risks_count: {e}")
            return {"function": "get_risks_count", "error": str(e), "success": False}
    
    def _get_sensitive_data_count(self, params: Dict = None) -> Dict:
        """Get sensitive data count, optionally by type"""
        try:
            sensitive_data = fetch_all_sensitive_data()
            if params and "data_type" in params:
                data_type = params["data_type"].upper()
                sensitive_data = [s for s in sensitive_data if s.get("data_type") == data_type]
            return {
                "function": "get_sensitive_data_count",
                "result": len(sensitive_data),
                "success": True,
                "filter": params,
                "summary": f"{len(sensitive_data)} données sensibles" + (f" ({data_type})" if params and "data_type" in params else "")
            }
        except Exception as e:
            logger.error(f"Error in get_sensitive_data_count: {e}")
            return {"function": "get_sensitive_data_count", "error": str(e), "success": False}
    
    def _get_documents_by_type(self, params: Dict = None) -> Dict:
        """Get documents by type"""
        try:
            docs = fetch_all_documents()
            if params and "document_type" in params:
                doc_type = params["document_type"].upper()
                docs = [d for d in docs if d.get("document_type") == doc_type]
            return {
                "function": "get_documents_by_type",
                "result": docs,
                "count": len(docs),
                "success": True,
                "filter": params
            }
        except Exception as e:
            logger.error(f"Error in get_documents_by_type: {e}")
            return {"function": "get_documents_by_type", "error": str(e), "success": False}
    
    def _get_documents_by_classification(self, params: Dict = None) -> Dict:
        """Get documents by classification"""
        try:
            docs = fetch_all_documents()
            if params and "confidentiality_level" in params:
                conf_level = params["confidentiality_level"].upper()
                docs = [d for d in docs if d.get("confidentiality_level") == conf_level]
            return {
                "function": "get_documents_by_classification",
                "result": docs,
                "count": len(docs),
                "success": True,
                "filter": params
            }
        except Exception as e:
            logger.error(f"Error in get_documents_by_classification: {e}")
            return {"function": "get_documents_by_classification", "error": str(e), "success": False}
    
    def _get_security_score(self, params: Dict = None) -> Dict:
        """Get security score"""
        try:
            scores = fetch_security_scores()
            return {
                "function": "get_security_score",
                "result": scores.get("security_score", 0),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error in get_security_score: {e}")
            return {"function": "get_security_score", "error": str(e), "success": False}
    
    def _get_compliance_score(self, params: Dict = None) -> Dict:
        """Get compliance score"""
        try:
            scores = fetch_security_scores()
            return {
                "function": "get_compliance_score",
                "result": scores.get("compliance_score", 0),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error in get_compliance_score: {e}")
            return {"function": "get_compliance_score", "error": str(e), "success": False}
    
    def _get_users_count(self, params: Dict = None) -> Dict:
        """Get users count"""
        try:
            users = fetch_users()
            return {
                "function": "get_users_count",
                "result": len(users),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error in get_users_count: {e}")
            return {"function": "get_users_count", "error": str(e), "success": False}
    
    def _get_reports_count(self, params: Dict = None) -> Dict:
        """Get reports count"""
        try:
            reports = fetch_all_reports()
            return {
                "function": "get_reports_count",
                "result": len(reports),
                "success": True
            }
        except Exception as e:
            logger.error(f"Error in get_reports_count: {e}")
            return {"function": "get_reports_count", "error": str(e), "success": False}
    
    def _get_statistics(self, params: Dict = None) -> Dict:
        """Get comprehensive statistics"""
        try:
            stats = fetch_statistics()
            return {
                "function": "get_statistics",
                "result": stats,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error in get_statistics: {e}")
            return {"function": "get_statistics", "error": str(e), "success": False}
    
    def get_functions_schema(self) -> str:
        """Get the schema of available functions for LLM"""
        schema = "Available functions:\n\n"
        for name, func_info in self.functions.items():
            schema += f"- {name}: {func_info['description']}\n"
            if func_info["parameters"]:
                schema += "  Parameters:\n"
                for param_name, param_info in func_info["parameters"].items():
                    required = " (required)" if param_info.get("required", False) else " (optional)"
                    schema += f"    - {param_name}: {param_info['description']}{required}\n"
            schema += "\n"
        return schema
    
    def execute_function(self, function_name: str, params: Dict = None) -> Dict:
        """Execute a function by name"""
        if function_name not in self.functions:
            return {
                "function": function_name,
                "error": f"Unknown function: {function_name}",
                "success": False
            }
        
        func = self.functions[function_name]["function"]
        return func(params)
    
    def parse_and_execute(self, user_question: str) -> Dict:
        """
        Parse user question and execute appropriate function(s)
        This is a simplified version - in production, use LLM to decide which functions to call
        """
        q = user_question.lower()
        params = {}
        
        # Knowledge/referential questions - don't call database functions
        if any(kw in q for kw in ["iso", "27001", "nist", "rgpd", "loi 09-08", "09 08", "cis", "cis controls", "explique", "qu'est-ce", "c'est quoi", "définition"]):
            return {"success": False, "reason": "knowledge_query"}
        
        # Detect parameters from question
        if "critique" in q:
            params["severity"] = "CRITIQUE"
        elif "élevé" in q or "haute" in q:
            params["severity"] = "ÉLEVÉ"
        elif "moyen" in q:
            params["severity"] = "MOYEN"
        elif "faible" in q or "basse" in q:
            params["severity"] = "FAIBLE"
        
        if "cin" in q:
            params["data_type"] = "CIN"
        elif "iban" in q:
            params["data_type"] = "IBAN"
        elif "email" in q:
            params["data_type"] = "EMAIL"
        elif "mot de passe" in q or "password" in q:
            params["data_type"] = "MOT_DE_PASSE"
        
        if "contrat" in q:
            params["document_type"] = "CONTRAT"
        elif "facture" in q:
            params["document_type"] = "FACTURE"
        elif "rapport" in q:
            params["document_type"] = "RAPPORT"
        
        if "confidentiel" in q:
            params["confidentiality_level"] = "CONFIDENTIEL"
        elif "très confidentiel" in q:
            params["confidentiality_level"] = "TRES_CONFIDENTIEL"
        elif "public" in q:
            params["confidentiality_level"] = "PUBLIC"
        elif "interne" in q:
            params["confidentiality_level"] = "INTERNE"
        
        # Determine which function to call
        if "combien" in q and "document" in q:
            return self.execute_function("get_documents_count", params)
        elif "combien" in q and "risque" in q:
            return self.execute_function("get_risks_count", params)
        elif "combien" in q and ("sensible" in q or "cin" in q or "iban" in q):
            return self.execute_function("get_sensitive_data_count", params)
        elif "combien" in q and "utilisateur" in q:
            return self.execute_function("get_users_count", params)
        elif "combien" in q and "rapport" in q:
            return self.execute_function("get_reports_count", params)
        elif "score" in q and "sécurité" in q:
            return self.execute_function("get_security_score", params)
        elif "score" in q and "conformité" in q:
            return self.execute_function("get_compliance_score", params)
        elif "statistique" in q or "dashboard" in q or "tableau de bord" in q:
            return self.execute_function("get_statistics", params)
        elif "document" in q:
            if "type" in q or "contrat" in q or "facture" in q:
                return self.execute_function("get_documents_by_type", params)
            elif "confidentiel" in q or "classification" in q:
                return self.execute_function("get_documents_by_classification", params)
            else:
                return self.execute_function("get_documents_count", params)
        elif "risque" in q:
            return self.execute_function("get_risks_count", params)
        else:
            # Default: no function call for general/knowledge questions
            return {"success": False, "reason": "no_matching_function"}


# Global instance
function_calling_service = FunctionCallingService()
