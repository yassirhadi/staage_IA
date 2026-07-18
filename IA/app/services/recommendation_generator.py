class RecommendationGenerator:
    """Génère des recommandations pour chaque risque détecté."""

    MAPPING = {
        "SECURITE": (
            "Supprimer immédiatement les mots de passe en clair. Utiliser un gestionnaire de secrets (HashiCorp Vault, Azure Key Vault).",
            "HAUTE",
        ),
        "DONNEES_PERSONNELLES": (
            "Restreindre l'accès au document. Appliquer le masquage des PII conformément à la loi 09-08.",
            "HAUTE",
        ),
        "DONNEES_FINANCIERES": (
            "Chiffrer les coordonnées bancaires. Limiter l'accès aux personnes autorisées.",
            "HAUTE",
        ),
        "CONFORMITE": (
            "Reclassifier le document selon la politique SSI. Former les équipes concernées.",
            "MOYENNE",
        ),
        "CLASSIFICATION": (
            "Corriger le niveau de confidentialité. Déplacer le document vers un dossier sécurisé.",
            "HAUTE",
        ),
        "EXPOSITION": (
            "Réduire la densité de données sensibles. Segmenter les informations par document.",
            "MOYENNE",
        ),
        "QUALITE": (
            "Vérifier le format du document. Appliquer l'OCR ou demander une version numérique.",
            "BASSE",
        ),
    }

    def generate(self, risks: list[dict]) -> list[dict]:
        recommendations = []
        for risk in risks:
            category = risk.get("category", "")
            desc, priority = self.MAPPING.get(
                category,
                ("Analyser le risque et appliquer une mesure corrective.", "MOYENNE"),
            )
            recommendations.append({
                "description": desc,
                "priority": priority,
                "risk_title": risk.get("title"),
            })
        return recommendations
