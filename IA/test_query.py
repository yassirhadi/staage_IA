from app.services.context_service import detect_query_type
from app.services.knowledge_base import knowledge_base

queries = [
    "Qu'est-ce que le NIST Cybersecurity Framework ?",
    "Comment gérer un mot de passe en clair ?",
    "Comment classer un document RH ?",
    "Comment fonctionne l'inventaire automatique ?",
    "Quels types d'actifs informationnels existent ?",
]

for q in queries:
    qt = detect_query_type(q)
    kb = knowledge_base.format_for_llm(q)
    print(f"Query: {q}")
    print(f"  Types: {qt}")
    print(f"  KB: {kb[:100] if kb else 'None'}...")
    print()
