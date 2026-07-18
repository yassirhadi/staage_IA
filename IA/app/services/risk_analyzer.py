class RiskAnalyzer:
    """Analyse des risques basée sur le contenu et la classification."""

    def analyze(
        self,
        text: str,
        document_type: str,
        confidentiality: str,
        sensitive_data: list[dict],
    ) -> list[dict]:
        risks = []
        data_types = {item["data_type"] for item in sensitive_data}

        if sensitive_data and confidentiality in ("PUBLIC", "INTERNE"):
            risks.append({
                "title": "Données sensibles mal classifiées",
                "description": "Des données personnelles ont été détectées dans un document non marqué confidentiel.",
                "severity": "ELEVE",
                "category": "CLASSIFICATION",
            })

        if "MOT_DE_PASSE" in data_types:
            risks.append({
                "title": "Mot de passe en clair",
                "description": "Un mot de passe a été détecté dans le contenu du document.",
                "severity": "CRITIQUE",
                "category": "SECURITE",
            })

        if "CIN" in data_types:
            risks.append({
                "title": "Numéro CIN détecté",
                "description": "Un numéro de carte d'identité nationale a été trouvé. Vérifier le stockage et les accès.",
                "severity": "ELEVE",
                "category": "DONNEES_PERSONNELLES",
            })

        if "IBAN" in data_types:
            risks.append({
                "title": "Coordonnées bancaires exposées",
                "description": "Un IBAN a été détecté dans le document. Risque de fraude ou fuite financière.",
                "severity": "ELEVE",
                "category": "DONNEES_FINANCIERES",
            })

        if document_type == "DOSSIER_RH" and sensitive_data:
            risks.append({
                "title": "Dossier RH contenant des PII",
                "description": "Document RH avec données personnelles. Accès restreint recommandé.",
                "severity": "MOYEN",
                "category": "CONFORMITE",
            })

        if document_type == "DOSSIER_RH" and confidentiality == "PUBLIC":
            risks.append({
                "title": "Document RH exposé",
                "description": "Un dossier RH ne devrait pas être classifié comme public.",
                "severity": "ELEVE",
                "category": "CONFORMITE",
            })

        if len(sensitive_data) >= 3:
            risks.append({
                "title": "Forte densité de données sensibles",
                "description": f"{len(sensitive_data)} types de données sensibles détectés dans un seul document.",
                "severity": "ELEVE",
                "category": "EXPOSITION",
            })

        if not text.strip():
            risks.append({
                "title": "Contenu non extractible",
                "description": "Impossible d'extraire le texte du document pour analyse.",
                "severity": "MOYEN",
                "category": "QUALITE",
            })

        return risks
