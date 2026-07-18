from typing import List, Dict, Any
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class AnswerBuilder:
    """Builds natural language answers from raw database data."""

    @staticmethod
    def build_documents_answer(documents: List[Dict], intent: str) -> str:
        """Build answer for document-related questions."""
        if not documents:
            return "Aucun document n'a été trouvé pour le moment."
        
        # Check for specific document type queries
        if "contrat" in intent:
            contracts = [d for d in documents if d.get("document_type") == "CONTRAT"]
            if contracts:
                # Remove duplicates by file_name
                seen = set()
                unique_contracts = []
                for d in contracts:
                    name = d.get('file_name', 'N/A')
                    if name not in seen:
                        seen.add(name)
                        unique_contracts.append(d)
                
                answer_parts = [f"Il y a {len(unique_contracts)} contrat(s) dans l'inventaire :\n"]
                for doc in unique_contracts[:10]:
                    answer_parts.append(f"• {doc.get('file_name')}")
                return "\n".join(answer_parts)
            else:
                return "Aucun contrat n'a été trouvé dans l'inventaire."
        
        if "confidentiel" in intent:
            conf_docs = [d for d in documents if d.get("confidentiality_level") in ["CONFIDENTIEL", "TRÈS CONFIDENTIEL", "TRES_CONFIDENTIEL"]]
            if conf_docs:
                answer_parts = [f"{len(conf_docs)} document(s) confidentiel(s) ont été identifiés :\n"]
                for d in conf_docs[:10]:
                    answer_parts.append(f"• {d.get('file_name')}")
                if len(conf_docs) > 10:
                    answer_parts.append(f"\n(Affichage des 10 premiers sur {len(conf_docs)} documents)")
                return "\n".join(answer_parts)
            else:
                return "Aucun document confidentiel n'a été trouvé."
        
        if "sensible" in intent:
            sens_docs = [d for d in documents if d.get("confidentiality_level") in ["CONFIDENTIEL", "TRÈS CONFIDENTIEL", "TRES_CONFIDENTIEL"]]
            if sens_docs:
                answer_parts = [f"{len(sens_docs)} document(s) sensible(s) ont été identifiés :\n"]
                for d in sens_docs[:5]:
                    answer_parts.append(f"• {d.get('file_name')}")
                return "\n".join(answer_parts)
            else:
                return "Aucun document sensible n'a été trouvé."
        
        # Default: show summary by type
        type_counts = defaultdict(int)
        for d in documents:
            t = d.get("document_type", "Autre")
            type_counts[t] += 1
        
        answer_parts = [f"{len(documents)} documents ont été analysés.\n"]
        answer_parts.append("Répartition par type :\n")
        for t, count in type_counts.items():
            answer_parts.append(f"- {count} {t}")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_risks_answer(risks: List[Dict], intent: str) -> str:
        """Build answer for risks-related questions."""
        if not risks:
            return "Aucun risque n'a été détecté pour le moment. Le système est en bonne santé."
        
        # Check for specific severity queries
        if "critique" in intent or "critical_risks" in intent:
            critical = [r for r in risks if r.get("severity") == "CRITIQUE"]
            if critical:
                # Remove duplicates by title
                seen = set()
                unique_critical = []
                for r in critical:
                    title = r.get('title', 'N/A')
                    if title not in seen:
                        seen.add(title)
                        unique_critical.append(r)
                
                # Count occurrences for each unique risk
                title_counts = {}
                for r in critical:
                    title = r.get('title', 'N/A')
                    title_counts[title] = title_counts.get(title, 0) + 1
                
                answer_parts = [f"{len(unique_critical)} risque(s) critique(s) détecté(s) :\n"]
                for r in unique_critical[:5]:
                    title = r.get('title', 'N/A')
                    count = title_counts.get(title, 1)
                    if count > 1:
                        answer_parts.append(f"• {title} ({count} documents)")
                    else:
                        answer_parts.append(f"• {title}")
                return "\n".join(answer_parts)
            else:
                return "Aucun risque critique n'a été détecté."
        
        # Check for "principaux" query - show all severity levels
        if "principal" in intent:
            # Group by severity and show all levels
            by_severity = defaultdict(list)
            for r in risks:
                sev = r.get("severity", "N/A")
                by_severity[sev].append(r)
            
            answer_parts = [f"{len(risks)} risques ont été détectés.\n"]
            answer_parts.append("Répartition par sévérité :\n")
            for sev in ["CRITIQUE", "HAUT", "HIGH", "MOYEN", "MEDIUM", "BAS", "LOW"]:
                if sev in by_severity:
                    answer_parts.append(f"- {sev} : {len(by_severity[sev])}")
            return "\n".join(answer_parts)
        
        # Default: show summary by severity
        by_severity = defaultdict(list)
        for r in risks:
            sev = r.get("severity", "N/A")
            by_severity[sev].append(r)
        
        answer_parts = [f"{len(risks)} risques ont été détectés.\n"]
        
        for sev in ["CRITIQUE", "ÉLEVÉ", "MOYEN", "FAIBLE"]:
            if sev in by_severity:
                count = len(by_severity[sev])
                answer_parts.append(f"- {sev} : {count}")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_sensitive_data_answer(sensitive: List[Dict], intent: str) -> str:
        """Build answer for sensitive-data-related questions."""
        if not sensitive:
            return "Aucune donnée sensible n'a été détectée pour le moment."
        
        # Check for specific data type queries
        if "cin" in intent or "cin_specific" in intent:
            cin_data = [s for s in sensitive if s.get("data_type") == "CIN"]
            if cin_data:
                unique_docs = list(set(s.get("file_name") for s in cin_data))
                answer_parts = [f"Les documents contenant un numéro CIN sont :\n"]
                for doc in unique_docs[:10]:
                    answer_parts.append(f"• {doc}")
                answer_parts.append(f"\nTotal : {len(unique_docs)} documents.")
                return "\n".join(answer_parts)
            else:
                return "Aucun numéro CIN n'a été détecté."
        
        if "mot de passe" in intent or "password" in intent:
            pwd_data = [s for s in sensitive if s.get("data_type") == "MOT_DE_PASSE"]
            if pwd_data:
                unique_docs = list(set(s.get("file_name") for s in pwd_data))
                answer_parts = [f"{len(unique_docs)} document(s) contiennent des mots de passe en clair :\n"]
                for doc in unique_docs[:10]:
                    answer_parts.append(f"• {doc}")
                return "\n".join(answer_parts)
            else:
                return "Aucun mot de passe en clair n'a été détecté."
        
        # Default: show summary by type
        by_type = defaultdict(list)
        for s in sensitive:
            dt = s.get("data_type", "N/A")
            by_type[dt].append(s)
        
        answer_parts = [f"{len(sensitive)} données sensibles ont été détectées.\n"]
        
        for dt, items in by_type.items():
            count = len(items)
            answer_parts.append(f"- {dt} : {count}")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_referentials_answer(refs: List[Dict], intent: str) -> str:
        """Build answer for referentials-related questions."""
        # Use knowledge base for explanations
        if "iso" in intent and "27001" in intent:
            return """ISO/IEC 27001 est la norme internationale de management de la sécurité de l'information (SMSI).

Elle permet de mettre en place un SMSI afin de protéger la confidentialité, l'intégrité et la disponibilité des informations.

Objectifs principaux :
- Protéger les informations confidentielles
- Gérer les risques de sécurité
- Assurer la conformité réglementaire
- Améliorer continuellement la sécurité

Version actuelle : ISO/IEC 27001:2022
"""
        
        if "nist" in intent:
            return """NIST Cybersecurity Framework (CSF) est un référentiel américain pour améliorer la cybersécurité.

6 Fonctions principales :
1. GOVERN - Gouvernance et stratégie
2. IDENTIFY - Identifier les actifs et risques
3. PROTECT - Mettre en place des protections
4. DETECT - Détecter les incidents
5. RESPOND - Répondre aux incidents
6. RECOVER - Récupérer après incident

Version actuelle : NIST CSF 2.0
"""
        
        if "rgpd" in intent:
            return """RGPD (Règlement Général sur la Protection des Données) est le règlement européen sur la protection des données personnelles.

Principes clés :
- Licéité, loyauté et transparence
- Limitation de la finalité
- Minimisation des données
- Exactitude
- Limitation de la conservation
- Intégrité et confidentialité
- Responsabilité

Sanctions : Jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires mondial.
"""
        
        if "loi 09-08" in intent or "09 08" in intent:
            return """Loi 09-08 est la loi marocaine relative à la protection des données à caractère personnel.

Dispositions principales :
- Consentement obligatoire pour le traitement
- Finalité légitime et proportionnée
- Information des personnes concernées
- Droit d'accès et de rectification
- Droit à l'oubli
- Sécurité des traitements
- Déclaration à la CNDP

Autorité de contrôle : CNDP (Commission Nationale de Contrôle de la Protection des Données).
"""
        
        # Default: show referentials from database
        if refs:
            answer_parts = [f"{len(refs)} référentiel(s) utilisé(s) :\n"]
            for ref in refs[:10]:
                answer_parts.append(f"• {ref.get('name', 'N/A')} (v{ref.get('version', 'N/A')})")
            return "\n".join(answer_parts)
        
        return "Aucun référentiel n'a été configuré pour le moment."
    
    @staticmethod
    def build_stats_answer(stats: Dict, intent: str) -> str:
        """Build answer for statistics-related questions."""
        if not stats:
            return "Aucune statistique n'est disponible pour le moment."
        
        # Check for specific count queries
        if "contrat" in intent:
            if "documents_by_type" in stats:
                contracts = stats['documents_by_type'].get('CONTRAT', 0)
                return f"Il y a {contracts} contrat(s) dans l'inventaire."
        
        if "score" in intent and "sécurité" in intent:
            if "security_score" in stats:
                return f"Le score de sécurité est de {stats['security_score']}%."
        
        if "score" in intent and "conformité" in intent:
            if "compliance_score" in stats:
                return f"Le score de conformité est de {stats['compliance_score']}%."
        
        # Default: show summary
        answer_parts = ["État du système :\n"]
        
        if "documents_count" in stats:
            answer_parts.append(f"Documents : {stats['documents_count']}")
        if "risks_count" in stats:
            answer_parts.append(f"Risques : {stats['risks_count']}")
        if "security_score" in stats:
            answer_parts.append(f"Score sécurité : {stats['security_score']}%")
        if "compliance_score" in stats:
            answer_parts.append(f"Score conformité : {stats['compliance_score']}%")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_users_answer(users: List[Dict], intent: str) -> str:
        """Build answer for users-related questions."""
        if not users:
            return "Aucun utilisateur enregistré pour le moment."
        
        answer_parts = [f"**👥 Utilisateurs ({len(users)}) :**\n"]
        
        active_users = [u for u in users if u.get('is_active', True)]
        inactive_users = [u for u in users if not u.get('is_active', True)]
        
        if "rssi" in intent:
            rssi_users = [u for u in users if 'rssi' in u.get('role', '').lower()]
            if rssi_users:
                answer_parts.append("**RSSI :**")
                for u in rssi_users:
                    answer_parts.append(f"• {u.get('username', 'N/A')} ({u.get('email', 'N/A')})")
            else:
                answer_parts.append("Aucun RSSI identifié.")
        
        if "actif" in intent or "active" in intent:
            answer_parts.append(f"\n**Utilisateurs actifs ({len(active_users)}) :**")
            for u in active_users[:5]:
                answer_parts.append(f"• {u.get('username', 'N/A')} - {u.get('role', 'N/A')}")
        
        if "désactivé" in intent:
            answer_parts.append(f"\n**Comptes désactivés ({len(inactive_users)}) :**")
            for u in inactive_users[:5]:
                answer_parts.append(f"• {u.get('username', 'N/A')}")
        
        if not any(kw in intent for kw in ["rssi", "actif", "active", "désactivé"]):
            for u in users[:10]:
                status = "✓ Actif" if u.get('is_active', True) else "✗ Inactif"
                answer_parts.append(f"• {u.get('username', 'N/A')} - {u.get('role', 'N/A')} ({status})")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_general_ssi_answer(intent: str) -> str:
        """Build answer for general SSI questions."""
        ssi_knowledge = {
            "rssi": """**RSSI (Responsable de la Sécurité des Systèmes d'Information)** est le responsable de la sécurité informatique au sein d'une organisation.

**Rôles principaux :**
• Définir la politique de sécurité
• Gérer les risques de sécurité
• Superviser la mise en œuvre des mesures de sécurité
• Sensibiliser le personnel
• Gérer les incidents de sécurité)

**Compétences requises :**
• Connaissance des normes (ISO 27001, RGPD)
• Expertise technique
• Capacité de communication
• Gestion de projet""",
            "actif": """**Actif informationnel** : toute information, dispositif, ou ressource qui a de la valeur pour l'organisation.

**Types d'actifs :**
• Données (clients, employés, financières)
• Matériels (serveurs, postes, mobiles)
• Logiciels (applications, systèmes)
• Personnel (compétences, connaissances)
• Infrastructure (réseaux, cloud)

**Gestion des actifs :**
• Inventaire
• Classification
• Évaluation de valeur
• Protection appropriée""",
            "donnée sensible": """**Donnée sensible** : information dont la divulgation, modification ou destruction pourrait causer un préjudice.

**Types :**
• Données personnelles (CIN, passeport)
• Données financières (IBAN, carte bancaire)
• Données de santé
• Secrets commerciaux
• Propriété intellectuelle

**Protection :**
• Chiffrement
• Contrôle d'accès
• Anonymisation
• Traçabilité""",
    
            "ransomware": """**Ransomware** : malware qui chiffre les données et exige une rançon.

**Fonctionnement :**
1. Infection (email, téléchargement)
2. Chiffrement des fichiers
3. Demande de rançon
4. Paiement (souvent en crypto)

**Protection :**
• Sauvegardes régulières
• Antivirus à jour
• Sensibilisation des utilisateurs
• Segmentation du réseau
• Plan de reprise d'activité""",
            "phishing": """**Phishing** : tentative d'obtenir des informations sensibles par usurpation d'identité.

**Types :**
• Email phishing
• Smishing (SMS)
• Vishing (téléphone)
• Spear phishing (ciblé)

**Signes :**
• Urgence artificielle
• Erreurs de grammaire
• URLs suspectes
• Demandes d'informations sensibles

**Protection :**
• Vérifier l'expéditeur
• Ne pas cliquer sur les liens suspects
• Utiliser l'authentification à deux facteurs""",
            "chiffrement": """**Chiffrement** : transformation de données pour les rendre illisibles sans clé.

**Types :**
• **Symétrique (AES)** : même clé pour chiffrer/déchiffrer. Rapide, pour grandes quantités.
• **Asymétrique (RSA)** : paire de clés (publique/privée). Plus lent, pour échanges sécurisés.

**Utilisations :**
• Protection des données au repos
• Sécurité des communications
• Signatures numériques
• VPN""",
            "firewall": """**Firewall (Pare-feu)** : système de sécurité qui contrôle le trafic réseau.

**Types :**
• **Pare-feu réseau** : filtre le trafic entre réseaux
• **Pare-feu applicatif (WAF)** : filtre les requêtes HTTP
• **Pare-feu hôte** : protège un ordinateur individuel

**Fonctions :**
• Filtrage par ports et protocoles
• Blocage d'adresses IP malveillantes
• Détection d'intrusions
• VPN""",
            "vpn": """**VPN (Virtual Private Network)** : tunnel sécurisé pour communiquer sur Internet.

**Avantages :**
• Chiffrement des communications
• Masquage de l'adresse IP
• Accès distant sécurisé
• Contournement de restrictions géographiques

**Utilisations :**
• Télétravail
• Connexion aux réseaux d'entreprise
• Protection sur Wi-Fi public""",
            "ids": """**IDS (Intrusion Detection System)** : système de détection d'intrusions.

**Types :**
• **NIDS** : surveille le réseau
• **HIDS** : surveille un hôte

**Méthodes :**
• Détection par signature (connu)
• Détection comportementale (anomalies)

**Alertes :** Notifie les administrateurs en cas de suspicion.""",
            "ips": """**IPS (Intrusion Prevention System)** : système de prévention d'intrusions.

**Différence avec IDS :**
• IDS : détecte et alerte
• IPS : détecte et bloque automatiquement

**Actions :**
• Blocage d'adresses IP
• Arrêt de connexions
• Réinitialisation de sessions

**Intégration :** Souvent combiné avec IDS (IDPS).""",
            "analyse de risques": """**Analyse de risques** : processus d'identification et d'évaluation des risques de sécurité.

**Étapes :**
1. **Identification** des actifs et menaces
2. **Évaluation** de la probabilité et impact
3. **Traitement** : accepter, éviter, transférer, réduire
4. **Surveillance** continue

**Méthodes :**
• EBIOS RM (France)
• NIST SP 800-30 (USA)
• ISO 27005 (International)

**Objectif :** Décider des mesures de sécurité appropriées."""
        }
        
        for key, answer in ssi_knowledge.items():
            if key in intent:
                return answer
        
        return "Je peux vous expliquer les concepts de sécurité suivants : RSSI, actifs, données sensibles, ransomware, phishing, chiffrement, firewall, VPN, IDS, IPS, et analyse de risques. Soyez plus précis dans votre question !"
    
    @staticmethod
    def build_recommendations_answer(risks: List[Dict], intent: str) -> str:
        """Build answer for recommendations-related questions."""
        if not risks:
            return "Aucun risque détecté pour le moment. Voici des recommandations générales :\n\n• Mettre en place une politique de mots de passe robuste\n• Sensibiliser régulièrement le personnel\n• Maintenir les systèmes à jour\n• Effectuer des sauvegardes régulières\n• Mettre en place l'authentification à deux facteurs"
        
        answer_parts = ["**💡 Recommandations basées sur les risques détectés :**\n"]
        
        # Group risks by severity and provide recommendations
        critical_risks = [r for r in risks if r.get('severity') == 'CRITIQUE']
        high_risks = [r for r in risks if r.get('severity') == 'ÉLEVÉ']
        
        if critical_risks:
            answer_parts.append("**🔴 Priorité immédiate (Risques critiques) :**")
            for r in critical_risks:
                answer_parts.append(f"• {r.get('title', 'N/A')}")
                answer_parts.append(f"  → Corriger immédiatement")
        
        if high_risks:
            answer_parts.append("\n**🟠 Priorité haute (Risques élevés) :**")
            for r in high_risks:
                answer_parts.append(f"• {r.get('title', 'N/A')}")
                answer_parts.append(f"  → Corriger dans les 30 jours")
        
        answer_parts.append("\n**✅ Bonnes pratiques générales :**")
        answer_parts.append("• Appliquer les correctifs de sécurité régulièrement")
        answer_parts.append("• Former les employés à la cybersécurité")
        answer_parts.append("• Mettre en place des sauvegardes chiffrées")
        answer_parts.append("• Utiliser l'authentification multi-facteur")
        answer_parts.append("• Segmenter le réseau pour limiter la propagation")
        answer_parts.append("• Surveiller les journaux d'événements")
        
        return "\n".join(answer_parts)
    
    @staticmethod
    def build_answer(intent: str, data: Dict[str, Any]) -> str:
        """Main method to build answer based on intent and data."""
        # 1. Sensitive data (check first before documents)
        if "sensible" in intent or "cin" in intent or "cin_specific" in intent or "iban" in intent or "email" in intent or "passeport" in intent:
            return AnswerBuilder.build_sensitive_data_answer(data.get("sensitive_data", []), intent)
        
        # 2. Documents / Actifs
        if "document" in intent or "inventaire" in intent or "actif" in intent:
            return AnswerBuilder.build_documents_answer(data.get("documents", []), intent)
        
        # 2. File types
        if "file_types" in intent:
            if "pdf" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("extension") == "pdf"], intent)
            elif "word" in intent or "docx" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("extension") in ["doc", "docx"]], intent)
            elif "excel" in intent or "xlsx" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("extension") in ["xls", "xlsx"]], intent)
            elif "image" in intent or "jpg" in intent or "png" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("extension") in ["jpg", "jpeg", "png"]], intent)
        
        # 3. Document types (business)
        if "document_types" in intent or "contract_specific" in intent:
            filtered_docs = data.get("documents", [])
            if "contrat" in intent or "contract_specific" in intent:
                filtered_docs = [d for d in filtered_docs if "contrat" in d.get("document_type", "").lower()]
            elif "facture" in intent:
                filtered_docs = [d for d in filtered_docs if "facture" in d.get("document_type", "").lower()]
            elif "procédure" in intent:
                filtered_docs = [d for d in filtered_docs if "procédure" in d.get("document_type", "").lower()]
            elif "politique" in intent:
                filtered_docs = [d for d in filtered_docs if "politique" in d.get("document_type", "").lower()]
            return AnswerBuilder.build_documents_answer(filtered_docs, intent)
        
        # 4. Classification
        if "classification" in intent or "confidential_docs" in intent:
            if "public" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("confidentiality_level") == "PUBLIC"], intent)
            elif "interne" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if d.get("confidentiality_level") == "INTERNE"], intent)
            elif "confidentiel" in intent or "confidential_docs" in intent:
                return AnswerBuilder.build_documents_answer([d for d in data.get("documents", []) if "CONFIDENTIEL" in d.get("confidentiality_level", "")], intent)
        
        # 5. Risks
        if "risque" in intent or "vulnérabilité" in intent:
            return AnswerBuilder.build_risks_answer(data.get("risks", []), intent)
        
        # 6. Sensitive data
        if "sensible" in intent or "cin" in intent or "cin_specific" in intent or "iban" in intent or "email" in intent or "passeport" in intent:
            return AnswerBuilder.build_sensitive_data_answer(data.get("sensitive_data", []), intent)
        
        # 7. Reports
        if "rapport" in intent:
            reports = data.get("reports", [])
            if reports:
                return f"**📋 Rapports disponibles ({len(reports)}) :**\n\n" + "\n".join([f"• {r.get('name', 'N/A')} - {r.get('type', 'N/A')}" for r in reports[:5]])
            return "Aucun rapport disponible pour le moment."
        
        # 8. Analyses
        if "analyse" in intent:
            unanalyzed = data.get("unanalyzed", [])
            if "analysé" in intent or "analysés" in intent:
                analyzed_count = len(data.get("documents", [])) - len(unanalyzed)
                return f"**🔬 Documents analysés :** {analyzed_count}\n\n**⏳ Documents non analysés :** {len(unanalyzed)}"
            elif "en cours" in intent:
                return "**⏳ Analyse en cours...**\n\nVeuillez patienter pendant que l'analyse des documents est en cours."
            elif "dernière" in intent:
                latest = data.get("latest_analysis", {})
                if latest and latest.get("file_name"):
                    return f"**🔬 Dernière analyse :**\n• Document : {latest.get('file_name')}\n• Type : {latest.get('document_type')}\n• Score : {latest.get('security_score', 0)}%"
                return "Aucune analyse récente disponible."
        
        # 9. Referentials
        if "référentiel" in intent or "iso" in intent or "nist" in intent or "cis" in intent or "rgpd" in intent or "loi" in intent or "pci" in intent or "hipaa" in intent:
            return AnswerBuilder.build_referentials_answer(data.get("referentials", []), intent)
        
        # 10. Compliance
        if "conforme" in intent or "conformité" in intent:
            scores = data.get("security_scores", {})
            if scores:
                compliance_score = scores.get("compliance_score", 0)
                if compliance_score >= 80:
                    status = "✅ Bon niveau de conformité"
                elif compliance_score >= 50:
                    status = "⚠️ Conformité moyenne - amélioration nécessaire"
                else:
                    status = "🔴 Conformité faible - action requise"
                return f"**🎯 Score de conformité :** {compliance_score}%\n\n**Statut :** {status}\n\n**Écarts potentiels :**\n• Vérifier la documentation\n• Mettre à jour les politiques\n• Former le personnel"
            return "Score de conformité non disponible."
        
        # 11. Stats / Dashboard
        if "combien" in intent or "statistique" in intent or "score" in intent or "nombre" in intent or "dashboard" in intent or "tableau de bord" in intent:
            return AnswerBuilder.build_stats_answer(data.get("stats", {}), intent)
        
        # 12. Users
        if "utilisateur" in intent or "rssi" in intent:
            return AnswerBuilder.build_users_answer(data.get("users", []), intent)
        
        # 13. General SSI
        if "general_ssi" in intent:
            return AnswerBuilder.build_general_ssi_answer(intent)
        
        # 14. Recommendations
        if "recommendations" in intent or "recommandation" in intent or "conseil" in intent or "que dois-je faire" in intent or "meilleure pratique" in intent:
            return AnswerBuilder.build_recommendations_answer(data.get("risks", []), intent)
        
        # 15. Conversation
        if "conversation" in intent:
            return "Je suis là pour vous aider ! Posez-moi une question plus précise sur la sécurité informatique, les documents, les risques ou les référentiels."
        
        # Greetings
        if "bonjour" in intent or "salut" in intent or "hello" in intent:
            return "Bonjour ! 👋 Je suis **Copilot RSSI**, votre assistant intelligent en sécurité de l'information.\n\nJe peux vous aider avec :\n• 📄 Documents et actifs\n• ⚠️ Risques et vulnérabilités\n• 🔒 Données sensibles\n• 📋 Rapports et analyses\n• 📚 Référentiels (ISO, NIST, RGPD...)\n• 🎯 Conformité et scores\n• 💡 Recommandations\n\nPosez-moi une question !"
        
        # Fallback: if we have any data, show a summary
        if data.get("documents") or data.get("risks") or data.get("sensitive_data"):
            return f"**📊 Résumé des informations disponibles :**\n\n• 📄 {len(data.get('documents', []))} documents\n• ⚠️ {len(data.get('risks', []))} risques\n• 🔒 {len(data.get('sensitive_data', []))} données sensibles\n• 📋 {len(data.get('reports', []))} rapports\n\nPosez-moi une question précise pour plus de détails !"
        
        return "Aucune information disponible pour le moment. Posez une question précise sur les documents, risques, données sensibles, rapports ou référentiels !"
