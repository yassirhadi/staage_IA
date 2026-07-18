"""
Intent Detection Module for Copilot RSSI
Classifies user questions to determine the appropriate data source
"""
from typing import Dict, List, Optional
import re

class IntentDetector:
    def __init__(self):
        """Initialize intent detection patterns"""
        self.intent_patterns = {
            'CIN': [
                r'\bcin\b', r'\bcarte.*identité\b', r'\bcarte.*national\b',
                r'numéro.*identité', r'carte.*d\'identité'
            ],
            'RISQUES': [
                r'\brisque\b', r'\brisques\b', r'\bvulnérabilit', r'\bmenace',
                r'\bthreat\b', r'\bvulnerability', r'\bdanger'
            ],
            'CONTRATS': [
                r'\bcontrat\b', r'\baccord\b', r'\bconvention',
                r'\bcontract\b', r'\bagreement'
            ],
            'CLASSIFICATION': [
                r'\bconfidentiel\b', r'\bclassification\b', r'\bniveau.*confidentialité',
                r'\bpublic\b', r'\binterne\b', r'\btrès.*confidentiel',
                r'\bsensibl', r'\bconfidentiality'
            ],
            'ISO': [
                r'\biso\b', r'\biso\s*27001\b', r'\biso\s*27002\b',
                r'\bsmsi\b', r'\bsystème.*management.*sécurité'
            ],
            'NIST': [
                r'\bnist\b', r'\bcybersecurity.*framework\b',
                r'\bnist.*csf\b'
            ],
            'CIS': [
                r'\bcis\b', r'\bcis.*controls?', r'\bcritical.*security.*controls'
            ],
            'LOI': [
                r'\bloi\b', r'\b09-08\b', r'\bprotection.*données\b',
                r'\bdata.*protection\b', r'\brgpd\b'
            ],
            'DOCUMENTS': [
                r'\bdocument\b', r'\bfichier\b', r'\bfile\b',
                r'\bcombien.*document', r'\bliste.*document'
            ],
            'ACTIFS': [
                r'\bactif\b', r'\basset\b', r'\binventaire\b',
                r'\béquipement\b', r'\bmatériel'
            ],
            'STATISTIQUES': [
                r'\bcombien\b', r'\bnombre\b', r'\bstatistique',
                r'\bcount\b', r'\bhow many\b', r'\btotal\b'
            ],
            'RECOMMANDATIONS': [
                r'\brecommandation\b', r'\bconseil\b', r'\bsolution',
                r'\bcorriger\b', r'\bfix\b', r'\bmitigate\b',
                r'\bcomment.*corriger\b', r'\bcomment.*résoudre'
            ],
            'MOT_DE_PASSE': [
                r'\bmot.*passe\b', r'\bpassword\b', r'\bpasswd\b',
                r'\bsecret\b', r'\bauthentification'
            ],
            'EMAIL': [
                r'\bemail\b', r'\bmail\b', r'\bcourriel\b',
                r'\badresse.*mail'
            ]
        }
    
    def detect_intent(self, query: str) -> Dict[str, any]:
        """
        Detect the intent of a user query
        Returns dict with intent, confidence, and metadata
        """
        query_lower = query.lower()
        
        # Check each intent pattern
        detected_intents = []
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower, re.IGNORECASE):
                    detected_intents.append(intent)
                    break
        
        # Determine primary intent
        if not detected_intents:
            primary_intent = "GENERAL"
            confidence = 0.0
        elif len(detected_intents) == 1:
            primary_intent = detected_intents[0]
            confidence = 0.9
        else:
            # Multiple intents detected - prioritize
            priority_order = ['CIN', 'MOT_DE_PASSE', 'RISQUES', 'RECOMMANDATIONS', 
                             'ISO', 'NIST', 'CIS', 'LOI', 'CONTRATS', 
                             'CLASSIFICATION', 'DOCUMENTS', 'ACTIFS', 'STATISTIQUES']
            
            for intent in priority_order:
                if intent in detected_intents:
                    primary_intent = intent
                    confidence = 0.8
                    break
            else:
                primary_intent = detected_intents[0]
                confidence = 0.7
        
        # Extract entities
        entities = self._extract_entities(query, primary_intent)
        
        return {
            "intent": primary_intent,
            "confidence": confidence,
            "all_intents": detected_intents,
            "entities": entities,
            "requires_mysql": self._requires_mysql(primary_intent),
            "requires_documents": self._requires_documents(primary_intent),
            "requires_referentiels": self._requires_referentiels(primary_intent),
            "requires_llm": True  # All responses go through LLM
        }
    
    def _extract_entities(self, query: str, intent: str) -> Dict[str, any]:
        """Extract relevant entities based on intent"""
        entities = {}
        
        if intent == 'STATISTIQUES':
            # Extract numbers if present
            numbers = re.findall(r'\d+', query)
            if numbers:
                entities['numbers'] = [int(n) for n in numbers]
        
        elif intent in ['DOCUMENTS', 'CONTRATS']:
            # Extract document types mentioned
            doc_types = []
            if 'contrat' in query.lower():
                doc_types.append('CONTRAT')
            if 'facture' in query.lower():
                doc_types.append('FACTURE')
            if 'rapport' in query.lower():
                doc_types.append('RAPPORT')
            if doc_types:
                entities['document_types'] = doc_types
        
        elif intent == 'RISQUES':
            # Extract severity if mentioned
            severity_keywords = {
                'critique': 'CRITIQUE',
                'élevé': 'ELEVE',
                'haute': 'ELEVE',
                'moyen': 'MOYEN',
                'faible': 'FAIBLE',
                'basse': 'FAIBLE'
            }
            for keyword, value in severity_keywords.items():
                if keyword in query.lower():
                    entities['severity'] = value
                    break
        
        return entities
    
    def _requires_mysql(self, intent: str) -> bool:
        """Determine if intent requires MySQL query"""
        mysql_intents = {
            'CIN', 'RISQUES', 'CONTRATS', 'CLASSIFICATION', 
            'DOCUMENTS', 'ACTIFS', 'STATISTIQUES', 'MOT_DE_PASSE', 'EMAIL'
        }
        return intent in mysql_intents
    
    def _requires_documents(self, intent: str) -> bool:
        """Determine if intent requires document search"""
        document_intents = {
            'CIN', 'RISQUES', 'CONTRATS', 'CLASSIFICATION', 
            'DOCUMENTS', 'MOT_DE_PASSE', 'EMAIL'
        }
        return intent in document_intents
    
    def _requires_referentiels(self, intent: str) -> bool:
        """Determine if intent requires referentiel search"""
        referentiel_intents = {
            'ISO', 'NIST', 'CIS', 'LOI', 'RECOMMANDATIONS', 'RISQUES'
        }
        return intent in referentiel_intents
    
    def get_query_type(self, intent: str) -> str:
        """Get the type of query needed"""
        if intent == 'CIN':
            return 'SELECT_SENSITIVE_DATA'
        elif intent == 'RISQUES':
            return 'SELECT_RISKS'
        elif intent == 'CONTRATS':
            return 'SELECT_CONTRACTS'
        elif intent == 'CLASSIFICATION':
            return 'SELECT_CLASSIFICATION'
        elif intent == 'DOCUMENTS':
            return 'SELECT_DOCUMENTS'
        elif intent == 'ACTIFS':
            return 'SELECT_ASSETS'
        elif intent == 'STATISTIQUES':
            return 'SELECT_COUNT'
        elif intent in ['ISO', 'NIST', 'CIS', 'LOI']:
            return 'SEARCH_REFERENTIELS'
        elif intent == 'RECOMMANDATIONS':
            return 'SELECT_RECOMMENDATIONS'
        else:
            return 'GENERAL'
