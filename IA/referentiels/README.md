# Référentiels pour Copilot RSSI

Ce dossier contient les documents de référence (normes, lois, politiques) qui seront indexés dans la base de données vectorielle pour le système RAG.

## Fichiers requis

Placez les fichiers suivants dans ce dossier :

- **ISO27001.pdf** - Norme ISO/IEC 27001 (Système de management de la sécurité de l'information)
- **ISO27002.pdf** - Norme ISO/IEC 27002 (Contrôles de sécurité de l'information)
- **NIST_CSF_2.0.pdf** - NIST Cybersecurity Framework 2.0
- **CIS_Controls_v8.pdf** - CIS Controls v8 (Critical Security Controls)
- **Loi_09_08.pdf** - Loi marocaine 09-08 (Protection des données personnelles)
- **Politique_SSI.pdf** - Politique de sécurité des systèmes d'information interne

## Comment indexer les référentiels

Une fois les fichiers placés, utilisez l'endpoint API :

```bash
POST /api/v1/index/referentiels
```

Ou utilisez le script Python :

```python
import requests

response = requests.post("http://localhost:8000/api/v1/index/referentiels", 
                        json={"directory": "./referentiels"})
print(response.json())
```

## Où trouver ces documents

- **ISO 27001/27002** : https://www.iso.org/standard/27001
- **NIST CSF** : https://www.nist.gov/cyberframework
- **CIS Controls** : https://www.cisecurity.org/controls/
- **Loi 09-08** : Site officiel de la CNDP Maroc
- **Politique SSI** : Document interne de votre organisation
