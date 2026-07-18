# Copilot RSSI - Copilote IA pour le Responsable Sécurité SI

Projet de stage (6 semaines) - Architecture professionnelle en 3 modules.

## Architecture

```
Frontend_IA (React.js)  →  Backend_IA (Spring Boot)  →  MySQL
                                    ↓
                              IA (FastAPI/Python)
```

## Structure du projet

```
Stage_IA/
├── Backend_IA/          # API REST Spring Boot (Java 17)
├── Frontend_IA/         # Interface React.js (Vite + TypeScript)
├── IA/                  # Micro-service IA Python (FastAPI)
├── database/            # Script SQL MySQL
├── sample-documents/    # Documents de test (confidentialité simulée)
└── README.md
```

## Prérequis

- Java JDK 17+
- Node.js 18+
- Python 3.11+
- MySQL 8+
- IntelliJ IDEA (backend) + VS Code (frontend/IA)

## Démarrage rapide

### 1. Base de données MySQL

```sql
-- Exécuter database/schema.sql dans MySQL Workbench
source D:/Stage_IA/database/schema.sql
```

Configurer le mot de passe dans `Backend_IA/src/main/resources/application-dev.yml` :
```yaml
spring:
  datasource:
    password: VOTRE_MOT_DE_PASSE
```

### 2. Backend Spring Boot

Ouvrir `Backend_IA` dans IntelliJ IDEA et lancer `CopilotRssiApplication`.

- API : http://localhost:8080/api
- Swagger : http://localhost:8080/api/swagger-ui.html

**Comptes par défaut :**
| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| admin       | admin123     | ADMIN |
| rssi        | rssi123      | RSSI |

### 3. Service IA Python

```powershell
cd IA
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

- API IA : http://localhost:8000
- Docs : http://localhost:8000/docs

### 4. Frontend React

```powershell
cd Frontend_IA
npm install
npm run dev
```

- Interface : http://localhost:5173

## Test du flux complet

1. Se connecter avec `rssi / rssi123`
2. Aller dans **Inventaire**
3. Scanner : `D:\Stage_IA\sample-documents`
4. Cliquer **Analyser IA** sur un document
5. Consulter **Risques** et **Copilote IA**

## Bonnes pratiques appliquées

**Backend :** DTO, validation, JWT, Swagger, gestion globale des exceptions, BCrypt

**Frontend :** Composants réutilisables, Context API, routes protégées, services API

**IA :** Modules séparés (extractor, classifier, detector, risk_analyzer), API REST FastAPI
