"""
MySQL Query Builder for Copilot RSSI
Builds SQL queries based on detected intent and entities
"""
import mysql.connector
from typing import Dict, List, Optional, Tuple
import os

class MySQLQueryBuilder:
    def __init__(self, host: str = "localhost", database: str = "copilot_rssi",
                 user: str = "root", password: str = ""):
        """Initialize MySQL connection"""
        self.host = host
        self.database = database
        self.user = user
        self.password = password
        self.connection = None
    
    def connect(self):
        """Establish MySQL connection"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                database=self.database,
                user=self.user,
                password=self.password
            )
            print("MySQL connection established")
        except Exception as e:
            print(f"MySQL connection error: {e}")
    
    def disconnect(self):
        """Close MySQL connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("MySQL connection closed")
    
    def execute_query(self, query: str, params: Tuple = None) -> List[Dict]:
        """Execute a SELECT query and return results as list of dicts"""
        if not self.connection or not self.connection.is_connected():
            self.connect()
        
        results = []
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            results = cursor.fetchall()
            cursor.close()
        except Exception as e:
            print(f"Query execution error: {e}")
            print(f"Query: {query}")
        
        return results
    
    def build_query(self, intent: str, entities: Dict = None) -> str:
        """Build SQL query based on intent"""
        if entities is None:
            entities = {}
        
        if intent == 'CIN':
            return self._query_cin()
        elif intent == 'RISQUES':
            return self._query_risks(entities)
        elif intent == 'CONTRATS':
            return self._query_contracts()
        elif intent == 'CLASSIFICATION':
            return self._query_classification(entities)
        elif intent == 'DOCUMENTS':
            return self._query_documents(entities)
        elif intent == 'ACTIFS':
            return self._query_assets()
        elif intent == 'STATISTIQUES':
            return self._query_statistics(entities)
        elif intent == 'MOT_DE_PASSE':
            return self._query_passwords()
        elif intent == 'EMAIL':
            return self._query_emails()
        elif intent == 'RECOMMANDATIONS':
            return self._query_recommendations()
        else:
            return None
    
    def _query_cin(self) -> str:
        """Query for documents containing CIN"""
        return """
            SELECT DISTINCT d.file_name, d.file_path, d.confidentiality_level, 
                   sd.data_type, sd.detected_value
            FROM documents d
            JOIN sensitive_data sd ON d.id = sd.document_id
            WHERE sd.data_type = 'CIN'
            ORDER BY d.file_name
        """
    
    def _query_risks(self, entities: Dict) -> str:
        """Query for risks, optionally filtered by severity"""
        base_query = """
            SELECT r.id, r.title, r.description, r.severity, r.category, r.status,
                   d.file_name, a.name as asset_name
            FROM risks r
            LEFT JOIN documents d ON r.document_id = d.id
            LEFT JOIN assets a ON r.asset_id = a.id
        """
        
        if 'severity' in entities:
            base_query += f" WHERE r.severity = '{entities['severity']}'"
        
        base_query += " ORDER BY r.severity DESC, r.id DESC"
        
        return base_query
    
    def _query_contracts(self) -> str:
        """Query for contract documents"""
        return """
            SELECT id, file_name, file_path, confidentiality_level, 
                   document_type, analysis_status
            FROM documents
            WHERE document_type = 'CONTRAT'
            ORDER BY file_name
        """
    
    def _query_classification(self, entities: Dict) -> str:
        """Query for document classification"""
        base_query = """
            SELECT file_name, confidentiality_level, document_type, 
                   analysis_status, file_size
            FROM documents
        """
        
        if 'confidentiality' in entities:
            base_query += f" WHERE confidentiality_level = '{entities['confidentiality']}'"
        
        base_query += " ORDER BY confidentiality_level DESC, file_name"
        
        return base_query
    
    def _query_documents(self, entities: Dict) -> str:
        """Query for documents, optionally filtered by type"""
        base_query = """
            SELECT id, file_name, file_path, document_type, confidentiality_level,
                   analysis_status, file_size, created_date
            FROM documents
        """
        
        if 'document_types' in entities and entities['document_types']:
            types = "', '".join(entities['document_types'])
            base_query += f" WHERE document_type IN ('{types}')"
        
        base_query += " ORDER BY file_name"
        
        return base_query
    
    def _query_assets(self) -> str:
        """Query for information assets"""
        return """
            SELECT id, name, asset_type, description, owner, criticality, 
                   status, location, responsible
            FROM assets
            ORDER BY criticality DESC, name
        """
    
    def _query_statistics(self, entities: Dict) -> str:
        """Query for statistics/count"""
        # Determine what to count based on entities
        if 'document_types' in entities:
            return """
                SELECT document_type, COUNT(*) as count
                FROM documents
                GROUP BY document_type
            """
        else:
            return """
                SELECT 
                    (SELECT COUNT(*) FROM documents) as total_documents,
                    (SELECT COUNT(*) FROM risks) as total_risks,
                    (SELECT COUNT(*) FROM assets) as total_assets,
                    (SELECT COUNT(*) FROM sensitive_data) as total_sensitive_data,
                    (SELECT COUNT(*) FROM documents WHERE confidentiality_level = 'CONFIDENTIEL') as confidential_docs,
                    (SELECT COUNT(*) FROM documents WHERE confidentiality_level = 'TRES_CONFIDENTIEL') as very_confidential_docs,
                    (SELECT COUNT(*) FROM risks WHERE severity = 'CRITIQUE') as critical_risks
            """
    
    def _query_passwords(self) -> str:
        """Query for documents with exposed passwords"""
        return """
            SELECT DISTINCT d.file_name, d.file_path, d.confidentiality_level,
                   sd.data_type, sd.detected_value
            FROM documents d
            JOIN sensitive_data sd ON d.id = sd.document_id
            WHERE sd.data_type = 'MOT_DE_PASSE'
            ORDER BY d.file_name
        """
    
    def _query_emails(self) -> str:
        """Query for documents containing emails"""
        return """
            SELECT DISTINCT d.file_name, d.file_path, d.confidentiality_level,
                   sd.data_type, sd.detected_value
            FROM documents d
            JOIN sensitive_data sd ON d.id = sd.document_id
            WHERE sd.data_type = 'EMAIL'
            ORDER BY d.file_name
        """
    
    def _query_recommendations(self) -> str:
        """Query for recommendations"""
        return """
            SELECT r.id, r.description, r.priority, r.status, 
                   r.progress, r.deadline,
                   risk.title as risk_title, risk.severity as risk_severity,
                   u.username as assigned_to
            FROM recommendations r
            JOIN risks risk ON r.risk_id = risk.id
            LEFT JOIN users u ON r.assigned_to = u.id
            ORDER BY r.priority DESC, r.status
        """
    
    def get_context_from_query(self, intent: str, entities: Dict = None) -> Dict:
        """
        Execute the appropriate query and return formatted context
        """
        query = self.build_query(intent, entities)
        
        if not query:
            return {"source": "mysql", "data": [], "message": "No MySQL query needed for this intent"}
        
        results = self.execute_query(query)
        
        return {
            "source": "mysql",
            "intent": intent,
            "data": results,
            "count": len(results),
            "query": query
        }
    
    def format_results_for_llm(self, context: Dict) -> str:
        """Format MySQL results for LLM context"""
        if not context["data"]:
            return "Aucune donnée trouvée dans la base de données."
        
        intent = context["intent"]
        data = context["data"]
        
        if intent == 'CIN':
            if not data:
                return "Aucun document contenant des numéros CIN n'a été détecté."
            lines = ["Documents contenant des numéros CIN :"]
            for row in data:
                lines.append(f"- {row['file_name']} (Confidentialité: {row['confidentiality_level']})")
            return "\n".join(lines)
        
        elif intent == 'RISQUES':
            if not data:
                return "Aucun risque détecté."
            lines = ["Risques détectés :"]
            for row in data:
                lines.append(f"- {row['title']} (Gravité: {row['severity']}, Statut: {row['status']})")
                if row['description']:
                    lines.append(f"  Description: {row['description']}")
            return "\n".join(lines)
        
        elif intent == 'CONTRATS':
            if not data:
                return "Aucun contrat trouvé."
            lines = ["Contrats trouvés :"]
            for row in data:
                lines.append(f"- {row['file_name']} (Confidentialité: {row['confidentiality_level']})")
            return "\n".join(lines)
        
        elif intent == 'DOCUMENTS':
            if not data:
                return "Aucun document trouvé."
            lines = [f"{context['count']} documents trouvés :"]
            for row in data:
                lines.append(f"- {row['file_name']} (Type: {row['document_type']}, Confidentialité: {row['confidentiality_level']})")
            return "\n".join(lines)
        
        elif intent == 'STATISTIQUES':
            if len(data) == 1 and 'total_documents' in data[0]:
                row = data[0]
                return f"""Statistiques du système :
- Documents totaux : {row['total_documents']}
- Risques détectés : {row['total_risks']}
- Actifs informationnels : {row['total_assets']}
- Données sensibles : {row['total_sensitive_data']}
- Documents confidentiels : {row['confidential_docs']}
- Documents très confidentiels : {row['very_confidential_docs']}
- Risques critiques : {row['critical_risks']}"""
            else:
                lines = ["Statistiques :"]
                for row in data:
                    lines.append(f"- {row}")
                return "\n".join(lines)
        
        else:
            lines = [f"{context['count']} résultats trouvés :"]
            for row in data:
                lines.append(f"- {row}")
            return "\n".join(lines)
