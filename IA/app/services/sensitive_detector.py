import re
from dataclasses import dataclass


@dataclass
class DetectionPattern:
    data_type: str
    pattern: re.Pattern
    mask_fn: callable


class SensitiveDataDetector:
    """Détection des données sensibles via expressions régulières."""

    PATTERNS = [
        DetectionPattern(
            "PASSEPORT",
            re.compile(r"(?i)(?:passeport|passport)\s*[:#]?\s*([A-Z]?\d{6,9})", re.IGNORECASE),
            lambda v: "P****",
        ),
        DetectionPattern(
            "CIN",
            re.compile(r"\b[A-Z]{1,2}\d{5,6}\b", re.IGNORECASE),
            lambda v: v[:2] + "****" + v[-2:] if len(v) > 4 else "****",
        ),
        DetectionPattern(
            "EMAIL",
            re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
            lambda v: v[:2] + "***@" + v.split("@")[-1] if "@" in v else "****",
        ),
        DetectionPattern(
            "TELEPHONE",
            re.compile(r"(?:\+212|0)[\s.-]?(?:5|6|7)[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}"),
            lambda v: v[:4] + "****" + v[-2:],
        ),
        DetectionPattern(
            "IBAN",
            re.compile(r"\bMA\d{2}[\s]?(?:\d{4}[\s]?){5}\d{2}\b", re.IGNORECASE),
            lambda v: "MA** **** **** **** **** **** **",
        ),
        DetectionPattern(
            "MOT_DE_PASSE",
            re.compile(r"(?i)(mot\s*de\s*passe(?:\s+\w+)?|password|mdp)\s*[:=]\s*\S+"),
            lambda v: "********",
        ),
    ]

    def detect(self, text: str) -> list[dict]:
        if not text:
            return []

        results = []
        seen = set()

        for pattern in self.PATTERNS:
            for match in pattern.pattern.finditer(text):
                value = match.group()
                key = (pattern.data_type, value)
                if key in seen:
                    continue
                seen.add(key)
                results.append({
                    "data_type": pattern.data_type,
                    "detected_value": value,
                    "masked_value": pattern.mask_fn(value),
                    "confidence": 0.85,
                })

        return results
