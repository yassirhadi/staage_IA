"""
Knowledge Base Service for Copilot RSSI
Provides comprehensive information about security standards and best practices
"""
from typing import Dict, List, Any

class KnowledgeBase:
    """Knowledge base for security standards and best practices"""
    
    def __init__(self):
        """Initialize knowledge base with security standards"""
        self.standards = {
            "ISO 27001": {
                "name": "ISO/IEC 27001",
                "version": "2022",
                "description": "Norme internationale de management de la sécurité de l'information (SMSI)",
                "objectives": [
                    "Protéger les informations confidentielles",
                    "Gérer les risques de sécurité",
                    "Assurer la conformité réglementaire",
                    "Améliorer continuellement la sécurité"
                ],
                "domains": [
                    "Politique de sécurité",
                    "Organisation de la sécurité",
                    "Gestion des actifs",
                    "Sécurité des ressources humaines",
                    "Sécurité physique",
                    "Gestion des communications",
                    "Contrôle d'accès",
                    "Acquisition de systèmes",
                    "Gestion des vulnérabilités",
                    "Continuité d'activité"
                ],
                "certification": "La certification ISO 27001 est délivrée par des organismes accrédités après un audit.",
                "key_controls": 114,
                "annex_controls": 93
            },
            "ISO 27002": {
                "name": "ISO/IEC 27002",
                "version": "2022",
                "description": "Code de bonnes pratiques pour la sécurité de l'information",
                "purpose": "Fournit des lignes directrices pour les contrôles de sécurité",
                "structure": "93 contrôles organisés en 4 thèmes",
                "themes": [
                    "Organisation (5 contrôles)",
                    "Personnes (8 contrôles)",
                    "Actifs physiques (14 contrôles)",
                    "Technologie (66 contrôles)"
                ],
                "usage": "Guide d'implémentation des mesures de sécurité définies dans l'ISO 27001"
            },
            "NIST CSF": {
                "name": "NIST Cybersecurity Framework",
                "version": "2.0",
                "description": "Référentiel américain pour améliorer la cybersécurité",
                "country": "États-Unis",
                "functions": [
                    {
                        "name": "GOVERN",
                        "description": "Gouvernance et stratégie de cybersécurité"
                    },
                    {
                        "name": "IDENTIFY",
                        "description": "Identifier les actifs et risques"
                    },
                    {
                        "name": "PROTECT",
                        "description": "Mettre en place des protections"
                    },
                    {
                        "name": "DETECT",
                        "description": "Détecter les incidents"
                    },
                    {
                        "name": "RESPOND",
                        "description": "Répondre aux incidents"
                    },
                    {
                        "name": "RECOVER",
                        "description": "Récupérer après incident"
                    }
                ],
                "benefits": [
                    "Flexible et adaptable",
                    "Reconnu internationalement",
                    "Non certifiable (framework de référence)"
                ]
            },
            "CIS Controls": {
                "name": "CIS Controls",
                "version": "v8",
                "description": "Meilleures pratiques de cybersécurité par le Center for Internet Security",
                "structure": "18 contrôles organisés en 3 groupes",
                "groups": [
                    {
                        "name": "Essentials (Basiques)",
                        "controls": [
                            "Inventaire des actifs",
                            "Contrôle des actifs",
                            "Sécurité des configurations",
                            "Maintenance continue",
                            "Gestion des vulnérabilités",
                            "Contrôle d'accès administratif",
                            "Protection des emails",
                            "Protection des navigateurs"
                        ]
                    },
                    {
                        "name": "Foundational (Fondationnels)",
                        "controls": "Contrôles avancés (authentification, réseau, etc.)"
                    },
                    {
                        "name": "Organizational (Organisationnels)",
                        "controls": "Tests et formation"
                    }
                ],
                "usage": "Priorisation des actions de sécurité"
            },
            "RGPD": {
                "name": "Règlement Général sur la Protection des Données",
                "acronym": "GDPR",
                "region": "Union Européenne",
                "description": "Règlement européen sur la protection des données personnelles",
                "principles": [
                    "Licéité, loyauté et transparence",
                    "Limitation de la finalité",
                    "Minimisation des données",
                    "Exactitude",
                    "Limitation de la conservation",
                    "Intégrité et confidentialité",
                    "Responsabilité"
                ],
                "rights": [
                    "Droit d'accès",
                    "Droit de rectification",
                    "Droit à l'effacement (droit à l'oubli)",
                    "Droit à la portabilité",
                    "Droit d'opposition"
                ],
                "sanctions": "Jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires mondial"
            },
            "Loi 09-08": {
                "name": "Loi marocaine 09-08",
                "description": "Loi relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel",
                "country": "Maroc",
                "provisions": [
                    "Consentement obligatoire pour le traitement",
                    "Finalité légitime et proportionnée",
                    "Information des personnes concernées",
                    "Droit d'accès et de rectification",
                    "Droit à l'oubli",
                    "Sécurité des traitements",
                    "Déclaration à la CNDP"
                ],
                "authority": "CNDP (Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel)",
                "sanctions": "Amendes et peines de prison en cas de violation"
            },
            "PCI DSS": {
                "name": "Payment Card Industry Data Security Standard",
                "description": "Protège les données de cartes bancaires",
                "requirements": 12,
                "key_requirements": [
                    "Firewall et configuration sécurisée",
                    "Protection des mots de passe",
                    "Protection des données stockées",
                    "Chiffrement des transmissions",
                    "Protection contre les malware",
                    "Applications sécurisées",
                    "Accès restreints",
                    "Authentification forte",
                    "Contrôle d'accès physique",
                    "Journalisation et surveillance",
                    "Tests de sécurité",
                    "Politique de sécurité"
                ],
                "compliance_levels": 4
            },
            "HIPAA": {
                "name": "Health Insurance Portability and Accountability Act",
                "description": "Protège les données de santé aux USA",
                "privacy_rule": "Protège les informations de santé identifiables (PHI)",
                "security_rule": "Protège les PHI électroniques (ePHI)",
                "technical_requirements": [
                    "Contrôles d'accès",
                    "Audit trails",
                    "Intégrité des données",
                    "Transmission sécurisée"
                ],
                "sanctions": "Amendes civiles et pénales"
            }
        }
        
        self.best_practices = {
            "passwords": {
                "title": "Bonnes pratiques pour les mots de passe",
                "recommendations": [
                    "Minimum 12 caractères",
                    "Mélange de majuscules, minuscules, chiffres et caractères spéciaux",
                    "Pas de mots du dictionnaire",
                    "Unique pour chaque compte",
                    "Rotation régulière (tous les 90 jours)",
                    "Utiliser un gestionnaire de mots de passe",
                    "Activer l'authentification multi-facteur (MFA)"
                ]
            },
            "password_clear": {
                "title": "Gestion des mots de passe en clair",
                "description": "Ne jamais stocker un mot de passe en clair dans les documents ou les bases de données.",
                "risks": [
                    "Accès non autorisé si la base de données est compromise",
                    "Violation de la conformité (ISO 27001, RGPD)",
                    "Perte de confiance des clients et partenaires"
                ],
                "solutions": [
                    "Utiliser des fonctions de hachage sécurisées (Argon2id, bcrypt, scrypt)",
                    "Ne jamais stocker ou transmettre des mots de passe en clair",
                    "Changer immédiatement tout mot de passe compromis",
                    "Activer l'authentification multi-facteur (MFA)",
                    "Former les employés sur la sécurité des mots de passe"
                ]
            },
            "document_classification": {
                "title": "Classification des documents RH",
                "description": "Les documents RH doivent être classés selon leur sensibilité et leur confidentialité.",
                "categories": [
                    "PUBLIC: Informations accessibles à tous (offres d'emploi, organigramme)",
                    "INTERNE: Informations internes à l'entreprise (procédures RH, politiques)",
                    "CONFIDENTIEL: Informations sensibles (salaires, évaluations, données personnelles)",
                    "TRÈS CONFIDENTIEL: Informations très sensibles (données bancaires, dossiers médicaux)"
                ],
                "best_practices": [
                    "Appliquer le principe du moindre privilège",
                    "Chiffrer les documents confidentiels",
                    "Conserver un historique des accès",
                    "Réviser régulièrement les classifications"
                ]
            },
            "inventory_automation": {
                "title": "Inventaire automatique des documents",
                "description": "Le système parcourt automatiquement les documents pour les analyser et les classer.",
                "process": [
                    "Scan automatique des répertoires configurés",
                    "Extraction des métadonnées (type, taille, date)",
                    "Analyse du contenu pour détecter les données sensibles",
                    "Classification selon les règles de sécurité",
                    "Calcul des scores de risque",
                    "Génération de recommandations",
                    "Mise à jour du tableau de bord"
                ],
                "benefits": [
                    "Gain de temps: automatisation des tâches répétitives",
                    "Conformité: respect des normes ISO 27001 et RGPD",
                    "Visibilité: vue d'ensemble de l'état de sécurité",
                    "Réactivité: détection rapide des nouvelles vulnérabilités"
                ]
            },
            "information_assets": {
                "title": "Types d'actifs informationnels",
                "description": "Les actifs informationnels sont toutes les informations qui ont de la valeur pour l'organisation.",
                "categories": [
                    "Données personnelles: informations sur les employés, clients, partenaires",
                    "Données financières: factures, contrats, budgets, rapports",
                    "Propriété intellectuelle: brevets, secrets commerciaux, codes source",
                    "Infrastructure: serveurs, réseaux, équipements de sécurité",
                    "Documentation: politiques, procédures, manuels, guides"
                ],
                "management": [
                    "Inventaire complet de tous les actifs",
                    "Classification par niveau de criticité",
                    "Évaluation des risques associés",
                    "Mise en place de contrôles de protection",
                    "Surveillance continue et audits réguliers"
                ]
            },
            "phishing": {
                "title": "Protection contre le phishing",
                "signs": [
                    "Urgence artificielle",
                    "Erreurs de grammaire",
                    "URLs suspectes",
                    "Demandes d'informations sensibles",
                    "Expéditeur inconnu"
                ],
                "protection": [
                    "Vérifier l'expéditeur",
                    "Ne pas cliquer sur les liens suspects",
                    "Utiliser l'authentification à deux facteurs",
                    "Signaler les emails suspects"
                ]
            },
            "ransomware": {
                "title": "Protection contre les ransomwares",
                "prevention": [
                    "Sauvegardes régulières (3-2-1 rule)",
                    "Antivirus à jour",
                    "Sensibilisation des utilisateurs",
                    "Segmentation du réseau",
                    "Plan de reprise d'activité",
                    "Mises à jour régulières"
                ]
            },
            "encryption": {
                "title": "Bonnes pratiques de chiffrement",
                "types": [
                    {
                        "type": "Symétrique (AES)",
                        "usage": "Grandes quantités de données",
                        "pros": "Rapide",
                        "cons": "Gestion des clés"
                    },
                    {
                        "type": "Asymétrique (RSA)",
                        "usage": "Échanges sécurisés",
                        "pros": "Pas de partage de clé secrète",
                        "cons": "Plus lent"
                    }
                ],
                "usage": [
                    "Protection des données au repos",
                    "Sécurité des communications",
                    "Signatures numériques",
                    "VPN"
                ]
            }
        }
    
    def get_standard(self, name: str) -> Dict:
        """Get information about a specific standard"""
        # Try exact match first
        if name in self.standards:
            return self.standards[name]
        
        # Try case-insensitive match
        for key, value in self.standards.items():
            if name.lower() in key.lower() or key.lower() in name.lower():
                return value
        
        return None
    
    def search_standards(self, query: str) -> List[Dict]:
        """Search for standards matching the query"""
        results = []
        query_lower = query.lower()
        
        # Common aliases mapping
        aliases = {
            "cybersecurity framework": "nist csf",
            "nist framework": "nist csf",
            "nist cybersecurity": "nist csf",
            "gdpr": "rgpd",
            "data protection": "rgpd",
            "pci": "pci dss",
            "hipaa": "hipaa",
        }
        
        # Check for aliases in query
        for alias, target in aliases.items():
            if alias in query_lower:
                query_lower = query_lower.replace(alias, target)
                break
        
        for name, standard in self.standards.items():
            # Search in name, description, objectives, and benefits
            # Also search for partial matches (e.g., "iso" matches "ISO 27001")
            name_lower = name.lower()
            
            # Check if query matches any part of the standard
            matches = (
                query_lower in name_lower or 
                name_lower in query_lower or
                query_lower in standard["description"].lower() or
                any(query_lower in str(obj).lower() for obj in standard.get("objectives", [])) or
                any(query_lower in str(func.get("name", "")).lower() for func in standard.get("functions", [])) or
                any(query_lower in str(func.get("description", "")).lower() for func in standard.get("functions", [])) or
                any(query_lower in str(benefit).lower() for benefit in standard.get("benefits", []))
            )
            
            if matches:
                results.append(standard)
        
        return results
    
    def compare_standards(self, standard1: str, standard2: str) -> str:
        """Compare two security standards"""
        std1 = self.get_standard(standard1)
        std2 = self.get_standard(standard2)
        
        if not std1 or not std2:
            return "Impossible de comparer: un ou deux standards introuvables."
        
        comparison = f"""## Comparaison: {std1['name']} vs {std2['name']}

### {std1['name']}
- **Version**: {std1.get('version', 'N/A')}
- **Description**: {std1['description']}
- **Pays/Région**: {std1.get('country', 'International')}

### {std2['name']}
- **Version**: {std2.get('version', 'N/A')}
- **Description**: {std2['description']}
- **Pays/Région**: {std2.get('country', 'International')}

### Points clés de comparaison
"""
        
        # Add specific comparisons based on standards
        if "ISO" in std1['name'] and "NIST" in std2['name']:
            comparison += """
**ISO 27001:**
- Norme internationale avec certification
- Focus sur le management de la sécurité
- Exigences obligatoires pour certification
- Basé sur un cycle PDCA

**NIST CSF:**
- Référentiel américain (non certifiable)
- Focus sur la cybersécurité
- Flexibilité et adaptabilité
- Basé sur 6 fonctions (Govern, Identify, Protect, Detect, Respond, Recover)

**Complémentarité:** Les deux peuvent être utilisés ensemble - ISO pour la certification, NIST pour l'amélioration continue.
"""
        
        return comparison
    
    def get_best_practice(self, topic: str) -> Dict:
        """Get best practices for a specific topic"""
        topic_lower = topic.lower()
        
        for key, practice in self.best_practices.items():
            if topic_lower in key or key in topic_lower:
                return practice
        
        return None
    
    def format_for_llm(self, query: str) -> str:
        """Format knowledge base information for LLM context (natural text, no Markdown)"""
        # Check best practices first for specific topics
        query_lower = query.lower()
        
        # Password-related queries
        if "mot de passe" in query_lower or "password" in query_lower:
            practice = self.get_best_practice("password")
            if practice:
                return self._format_best_practice(practice)
            practice = self.get_best_practice("password_clear")
            if practice:
                return self._format_best_practice(practice)
        
        # Classification queries
        if "classer" in query_lower or "classification" in query_lower or "rh" in query_lower:
            practice = self.get_best_practice("document_classification")
            if practice:
                return self._format_best_practice(practice)
        
        # Inventory queries
        if "inventaire" in query_lower:
            practice = self.get_best_practice("inventory_automation")
            if practice:
                return self._format_best_practice(practice)
        
        # Assets queries
        if "actif" in query_lower or "asset" in query_lower:
            practice = self.get_best_practice("information_assets")
            if practice:
                return self._format_best_practice(practice)
        
        # Search for relevant standards
        standards = self.search_standards(query)
        
        if not standards:
            return "Aucune information spécifique trouvée dans la base de connaissances."
        
        # Format standards as natural text
        context_parts = []
        
        for standard in standards[:3]:  # Limit to top 3
            context_parts.append(f"{standard['name']} est {standard['description']}.")
            
            if standard.get("objectives"):
                context_parts.append("Elle permet de:")
                for obj in standard["objectives"][:3]:
                    context_parts.append(f"- {obj}")
            
            if standard.get("functions"):
                context_parts.append("Fonctions principales:")
                for func in standard["functions"][:3]:
                    context_parts.append(f"- {func['name']}: {func['description']}")
            
            context_parts.append("")  # Empty line between standards
        
        return "\n".join(context_parts)
    
    def _format_best_practice(self, practice: Dict) -> str:
        """Format best practices as natural text"""
        parts = [f"{practice.get('title', 'Bonnes pratiques')}:"]
        
        if practice.get("description"):
            parts.append(practice["description"])
        
        if practice.get("risks"):
            parts.append("Risques:")
            for risk in practice["risks"]:
                parts.append(f"- {risk}")
        
        if practice.get("solutions"):
            parts.append("Solutions:")
            for solution in practice["solutions"]:
                parts.append(f"- {solution}")
        
        if practice.get("recommendations"):
            parts.append("Recommandations:")
            for rec in practice["recommendations"]:
                parts.append(f"- {rec}")
        
        if practice.get("categories"):
            parts.append("Catégories:")
            for cat in practice["categories"]:
                parts.append(f"- {cat}")
        
        if practice.get("best_practices"):
            parts.append("Bonnes pratiques:")
            for bp in practice["best_practices"]:
                parts.append(f"- {bp}")
        
        if practice.get("process"):
            parts.append("Processus:")
            for step in practice["process"]:
                parts.append(f"- {step}")
        
        if practice.get("benefits"):
            parts.append("Avantages:")
            for benefit in practice["benefits"]:
                parts.append(f"- {benefit}")
        
        if practice.get("management"):
            parts.append("Gestion:")
            for mgmt in practice["management"]:
                parts.append(f"- {mgmt}")
        
        return "\n".join(parts)


# Global instance
knowledge_base = KnowledgeBase()
