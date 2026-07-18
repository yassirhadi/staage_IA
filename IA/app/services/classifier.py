class DocumentClassifier:
    """Classification documentaire basée sur mots-clés (extensible vers LLM)."""

    TYPE_KEYWORDS = {
        "CONTRAT": ["contrat", "convention", "accord", "engagement"],
        "FACTURE": ["facture", "invoice", "montant", "tva", "total ht"],
        "RAPPORT": ["rapport", "report", "analyse", "synthèse", "bilan"],
        "PROCEDURE": ["procédure", "procedure", "processus", "étape", "instruction"],
        "POLITIQUE_SSI": ["politique", "sécurité", "ssi", "confidentialité", "iso 27001"],
        "DOSSIER_RH": ["employé", "salaire", "cnss", "rh", "recrutement", "cin"],
        "NOTE_INTERNE": ["note interne", "memo", "communication interne"],
    }

    CONFIDENTIALITY_KEYWORDS = {
        "TRES_CONFIDENTIEL": ["très confidentiel", "secret", "strictement confidentiel"],
        "CONFIDENTIEL": ["confidentiel", "données personnelles", "cin", "iban"],
        "INTERNE": ["usage interne", "interne", "restreint"],
        "PUBLIC": ["public", "diffusion libre"],
    }

    def classify_type(self, text: str, file_name: str = "") -> str:
        content = (text + " " + file_name).lower()
        scores = {doc_type: 0 for doc_type in self.TYPE_KEYWORDS}

        for doc_type, keywords in self.TYPE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in content:
                    scores[doc_type] += 1

        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else "AUTRE"

    def classify_confidentiality(self, text: str, sensitive_count: int) -> str:
        content = text.lower()

        for level, keywords in self.CONFIDENTIALITY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in content:
                    return level

        if sensitive_count >= 3:
            return "TRES_CONFIDENTIEL"
        if sensitive_count >= 1:
            return "CONFIDENTIEL"
        return "INTERNE"
