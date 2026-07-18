"""
Answer Formatter for Copilot RSSI
Formats LLM responses into professional, structured outputs
"""
from typing import Dict, List, Optional
from datetime import datetime

class AnswerFormatter:
    def __init__(self):
        """Initialize answer formatter"""
        self.response_templates = {
            'CIN': {
                'title': 'Documents contenant des numéros CIN',
                'icon': '🪪',
                'sections': ['documents', 'classification', 'recommendations']
            },
            'RISQUES': {
                'title': 'Analyse des Risques',
                'icon': '⚠️',
                'sections': ['risks', 'severity', 'recommendations']
            },
            'CONTRATS': {
                'title': 'Contrats détectés',
                'icon': '📄',
                'sections': ['contracts', 'classification', 'summary']
            },
            'CLASSIFICATION': {
                'title': 'Classification des Documents',
                'icon': '🔒',
                'sections': ['classification', 'statistics', 'recommendations']
            },
            'ISO': {
                'title': 'Norme ISO 27001',
                'icon': '📋',
                'sections': ['overview', 'key_points', 'implementation']
            },
            'NIST': {
                'title': 'NIST Cybersecurity Framework',
                'icon': '🛡️',
                'sections': ['overview', 'functions', 'implementation']
            },
            'CIS': {
                'title': 'CIS Controls',
                'icon': '✅',
                'sections': ['overview', 'controls', 'priorities']
            },
            'LOI': {
                'title': 'Loi 09-08 - Protection des Données Personnelles',
                'icon': '⚖️',
                'sections': ['overview', 'requirements', 'compliance']
            },
            'DOCUMENTS': {
                'title': 'Documents',
                'icon': '📁',
                'sections': ['documents', 'statistics', 'summary']
            },
            'ACTIFS': {
                'title': 'Actifs Informationnels',
                'icon': '💼',
                'sections': ['assets', 'criticality', 'recommendations']
            },
            'STATISTIQUES': {
                'title': 'Statistiques du Système',
                'icon': '📊',
                'sections': ['statistics', 'trends', 'summary']
            },
            'RECOMMANDATIONS': {
                'title': 'Recommandations de Sécurité',
                'icon': '💡',
                'sections': ['recommendations', 'priority', 'actions']
            },
            'MOT_DE_PASSE': {
                'title': 'Alerte Mots de Passe',
                'icon': '🔐',
                'sections': ['alert', 'affected_documents', 'recommendations']
            },
            'EMAIL': {
                'title': 'Documents contenant des Emails',
                'icon': '📧',
                'sections': ['documents', 'classification', 'recommendations']
            },
            'GENERAL': {
                'title': 'Réponse',
                'icon': '💬',
                'sections': ['response']
            }
        }
    
    def format_response(self, llm_response: str, intent: str, 
                         context: Dict = None, metadata: Dict = None) -> Dict:
        """
        Format the LLM response into a structured professional output
        """
        if context is None:
            context = {}
        if metadata is None:
            metadata = {}
        
        template = self.response_templates.get(intent, self.response_templates['GENERAL'])
        
        formatted = {
            'intent': intent,
            'title': template['title'],
            'icon': template['icon'],
            'timestamp': datetime.now().isoformat(),
            'response': llm_response,
            'structured_sections': self._extract_sections(llm_response, template['sections']),
            'sources': context.get('sources', {}),
            'confidence': metadata.get('confidence', 0.0),
            'tokens_used': metadata.get('tokens_used', 0),
            'model': metadata.get('model', 'unknown')
        }
        
        # Add recommendations if applicable
        if intent in ['RISQUES', 'MOT_DE_PASSE', 'CLASSIFICATION', 'RECOMMANDATIONS']:
            formatted['recommendations'] = self._extract_recommendations(llm_response)
        
        return formatted
    
    def _extract_sections(self, response: str, sections: List[str]) -> Dict[str, str]:
        """Extract different sections from the response"""
        extracted = {}
        
        lines = response.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            # Check if line starts a new section
            for section in sections:
                if section.lower() in line.lower() and ':' in line:
                    if current_section:
                        extracted[current_section] = '\n'.join(current_content).strip()
                    current_section = section
                    current_content = []
                    break
            else:
                if current_section:
                    current_content.append(line)
        
        # Add last section
        if current_section and current_content:
            extracted[current_section] = '\n'.join(current_content).strip()
        
        # If no sections found, put everything in the first section
        if not extracted and sections:
            extracted[sections[0]] = response
        
        return extracted
    
    def _extract_recommendations(self, response: str) -> List[str]:
        """Extract recommendations from the response"""
        recommendations = []
        lines = response.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in ['recommand', 'conseil', 'devrait', 'il faut', 'je recommande']):
                # Clean up the recommendation
                rec = line.strip()
                if rec and len(rec) > 10:
                    recommendations.append(rec)
        
        return recommendations
    
    def format_for_frontend(self, formatted_response: Dict) -> Dict:
        """
        Format the response for the frontend (React)
        Returns a clean, UI-ready structure
        """
        return {
            'type': formatted_response['intent'],
            'title': formatted_response['title'],
            'icon': formatted_response['icon'],
            'content': formatted_response['response'],
            'sections': formatted_response['structured_sections'],
            'recommendations': formatted_response.get('recommendations', []),
            'metadata': {
                'timestamp': formatted_response['timestamp'],
                'sources': formatted_response['sources'],
                'confidence': formatted_response['confidence'],
                'tokens_used': formatted_response['tokens_used'],
                'model': formatted_response['model']
            }
        }
    
    def format_error(self, error_message: str, intent: str = 'ERROR') -> Dict:
        """Format an error response"""
        return {
            'intent': intent,
            'title': 'Erreur',
            'icon': '❌',
            'timestamp': datetime.now().isoformat(),
            'response': error_message,
            'structured_sections': {'error': error_message},
            'sources': {},
            'confidence': 0.0,
            'tokens_used': 0,
            'model': 'error',
            'is_error': True
        }
    
    def format_statistics(self, stats: Dict) -> Dict:
        """Format statistics data for display"""
        return {
            'intent': 'STATISTIQUES',
            'title': 'Statistiques du Système',
            'icon': '📊',
            'timestamp': datetime.now().isoformat(),
            'response': self._format_statistics_text(stats),
            'structured_sections': self._format_statistics_sections(stats),
            'sources': {'mysql': True},
            'confidence': 1.0,
            'tokens_used': 0,
            'model': 'mysql'
        }
    
    def _format_statistics_text(self, stats: Dict) -> str:
        """Format statistics as readable text"""
        lines = ["📊 Statistiques du Système\n"]
        
        for key, value in stats.items():
            if isinstance(value, (int, float)):
                lines.append(f"• {key}: {value}")
        
        return '\n'.join(lines)
    
    def _format_statistics_sections(self, stats: Dict) -> Dict[str, str]:
        """Format statistics into sections"""
        sections = {}
        
        # Group statistics by category
        categories = {
            'documents': ['total_documents', 'confidential_docs', 'very_confidential_docs'],
            'risks': ['total_risks', 'critical_risks'],
            'assets': ['total_assets'],
            'sensitive_data': ['total_sensitive_data']
        }
        
        for category, keys in categories.items():
            category_stats = {k: v for k, v in stats.items() if k in keys}
            if category_stats:
                sections[category] = '\n'.join([f"• {k}: {v}" for k, v in category_stats.items()])
        
        return sections
    
    def create_quick_response(self, message: str, intent: str = 'GENERAL') -> Dict:
        """Create a quick response for simple messages"""
        return {
            'intent': intent,
            'title': self.response_templates.get(intent, {}).get('title', 'Réponse'),
            'icon': self.response_templates.get(intent, {}).get('icon', '💬'),
            'timestamp': datetime.now().isoformat(),
            'response': message,
            'structured_sections': {'response': message},
            'sources': {},
            'confidence': 0.5,
            'tokens_used': 0,
            'model': 'quick'
        }
