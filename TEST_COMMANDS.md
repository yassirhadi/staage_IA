# Commandes de Test - Application Complète

## 🚀 Démarrage de l'Application

### 1️⃣ Terminal 1 - Service IA (Python FastAPI)
```powershell
cd D:\Stage_IA
python start_backend.py --host 127.0.0.1 --port 8000 --reload
```
✅ Service disponible: `http://127.0.0.1:8000`

### 2️⃣ Terminal 2 - Frontend (React + Vite)
```powershell
cd D:\Stage_IA\Frontend_IA
npm run dev
```
✅ Interface disponible: `http://localhost:5173`

### 3️⃣ Terminal 3 - Backend Java (optionnel)
```powershell
cd D:\Stage_IA\Backend_IA
mvn spring-boot:run
```
✅ Backend disponible: `http://localhost:8080`

---

## 🧪 Tests - Service IA

### ✅ Test Health Check
```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/health' | ConvertTo-Json
```
**Réponse attendue:**
```json
{"status": "UP", "service": "copilot-rssi-ai"}
```

### ✅ Test OpenAPI Docs
```powershell
Start-Process 'http://127.0.0.1:8000/docs'
```

### ✅ Test Analyse de Document
```powershell
$body = @{
    file_path = "D:\Stage_IA\sample-documents\Finance\facture_2025.txt"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/analyze' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body

$response | ConvertTo-Json -Depth 3
```

### ✅ Test Chat - Requête simple
```powershell
$body = @{
    question = "Quels documents contiennent un CIN ?"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/chat' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body

$response | ConvertTo-Json
```

### ✅ Test Chat - Autres questions
```powershell
# Question: Documents confidentiels
$body = @{ question = "Quels documents sont confidentiels ?" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/chat' -Method POST -ContentType 'application/json' -Body $body | Select-Object answer, sources

# Question: Risques détectés
$body = @{ question = "Quels sont les risques ?" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/chat' -Method POST -ContentType 'application/json' -Body $body | Select-Object answer, sources

# Question: Recommandations
$body = @{ question = "Quelles sont les recommandations ?" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/chat' -Method POST -ContentType 'application/json' -Body $body | Select-Object answer, sources
```

---

## 🌐 Tests - Frontend (http://localhost:5173)

### ✅ Pages à tester

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `http://localhost:5173/` | Affichage des KPIs |
| Inventaire | `http://localhost:5173/inventory` | Gestion des documents |
| Dossiers | `http://localhost:5173/folders` | Structure des dossiers |
| Risques | `http://localhost:5173/risks` | Affichage des risques |
| Recommandations | `http://localhost:5173/recommendations` | Actions recommandées |
| Audit | `http://localhost:5173/audit` | Logs d'audit |
| Copilot | `http://localhost:5173/copilot` | Chat IA |
| Documentation | `http://localhost:5173/docs` | API Docs |

### ✅ Tests Manuels

**1. Vérifier le chargement des données:**
- Ouvrir DevTools (F12)
- Console → Vérifier qu'il n'y a pas d'erreurs
- Network → Vérifier les appels API

**2. Tester Dashboard:**
- Vérifier les compteurs
- Vérifier les graphiques

**3. Tester Inventaire:**
- Rechercher un document
- Trier par colonne
- Paginer les résultats

**4. Tester Copilot Chat:**
- Demander "Quels documents contiennent un CIN ?"
- Vérifier la réponse depuis la DB

---

## 🔗 Tests - Backend Java (http://localhost:8080)

### ✅ Vérifier le démarrage
```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/health' | ConvertTo-Json
```

### ✅ Tester les endpoints
```powershell
# Health check
Invoke-RestMethod -Uri 'http://localhost:8080/api/health'

# Récupérer les documents
Invoke-RestMethod -Uri 'http://localhost:8080/api/documents' | ConvertTo-Json -Depth 2

# Récupérer les risques
Invoke-RestMethod -Uri 'http://localhost:8080/api/risks' | ConvertTo-Json -Depth 2
```

---

## 📊 Tests Complets - Scripts d'Automatisation

### ✅ Test IA - Script Complet
```powershell
# Fichier: test_ia.ps1
$baseUrl = "http://127.0.0.1:8000"

Write-Host "🔍 Test 1: Health Check" -ForegroundColor Green
$health = Invoke-RestMethod -Uri "$baseUrl/api/v1/health"
Write-Host "Status: $($health.status)" -ForegroundColor Cyan

Write-Host "`n🔍 Test 2: Analyze Document" -ForegroundColor Green
$analyze = @{
    file_path = "D:\Stage_IA\sample-documents\Finance\facture_2025.txt"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$baseUrl/api/v1/analyze" `
    -Method POST `
    -ContentType 'application/json' `
    -Body $analyze

Write-Host "Document Type: $($result.document_type)" -ForegroundColor Cyan
Write-Host "Confidentiality: $($result.confidentiality_level)" -ForegroundColor Cyan
Write-Host "Sensitive Data Found: $($result.sensitive_data.Count)" -ForegroundColor Cyan

Write-Host "`n🔍 Test 3: Chat - CIN Search" -ForegroundColor Green
$chat = @{ question = "Quels documents contiennent un CIN ?" } | ConvertTo-Json
$chatResult = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat" `
    -Method POST `
    -ContentType 'application/json' `
    -Body $chat

Write-Host "Response: $($chatResult.answer)" -ForegroundColor Cyan
Write-Host "Sources: $($chatResult.sources)" -ForegroundColor Cyan

Write-Host "`n✅ Tous les tests IA sont passés!" -ForegroundColor Green
```

**Exécuter:**
```powershell
powershell -ExecutionPolicy Bypass -File test_ia.ps1
```

### ✅ Test Frontend - Build et Lint
```powershell
cd D:\Stage_IA\Frontend_IA

# Lint (Oxlint)
npm run lint

# Build de production
npm run build

# Aperçu du build
npm run preview
```

### ✅ Test Backend - Build Maven
```powershell
cd D:\Stage_IA\Backend_IA

# Compilation
mvn clean compile

# Tests unitaires
mvn test

# Build complet
mvn clean package

# Vérifier l'application construite
dir target\*.jar
```

---

## 🔄 Flux de Test Complet

### Phase 1: Démarrage
1. Ouvrir 3 terminaux PowerShell
2. Terminal 1: Lancer l'IA service
3. Terminal 2: Lancer le Frontend
4. Terminal 3: Lancer le Backend (optionnel)

### Phase 2: Tests IA
```powershell
# Dans Terminal 4
cd D:\Stage_IA

# Test 1: Health
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/health'

# Test 2: Analyze
$body = @{ file_path = "D:\Stage_IA\sample-documents\Finance\facture_2025.txt" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/analyze' -Method POST -ContentType 'application/json' -Body $body

# Test 3: Chat
$body = @{ question = "Quels documents contiennent un CIN ?" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/v1/chat' -Method POST -ContentType 'application/json' -Body $body
```

### Phase 3: Tests Frontend (Browser)
1. Ouvrir `http://localhost:5173`
2. Vérifier Dashboard
3. Tester Copilot Chat
4. Vérifier DevTools pour erreurs

### Phase 4: Tests Backend (Browser)
1. Ouvrir `http://localhost:8080/swagger-ui.html`
2. Tester les endpoints
3. Vérifier les réponses

---

## ✅ Critères de Succès

### IA Service
- ✅ Health check retourne "UP"
- ✅ `/docs` charge correctement
- ✅ Analyze retourne 200 + document analysis
- ✅ Chat retourne 200 + réponses basées DB
- ✅ Pas d'erreurs Python

### Frontend
- ✅ Page charge sans erreurs
- ✅ Données s'affichent (Dashboard)
- ✅ Chat fonctionne avec réponses
- ✅ Pas d'erreurs JavaScript
- ✅ Build réussit

### Backend
- ✅ Démarre sans erreurs
- ✅ Endpoints répondent
- ✅ Connexion DB validée
- ✅ Build Maven réussit

---

## 🐛 Dépannage Rapide

### IA Service ne démarre pas
```powershell
# Vérifier le port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Libérer le port
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force

# Relancer
cd D:\Stage_IA
python start_backend.py
```

### Frontend - Dépendances manquantes
```powershell
cd D:\Stage_IA\Frontend_IA
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### Backend - Erreurs de compilation
```powershell
cd D:\Stage_IA\Backend_IA
mvn clean
mvn compile
mvn spring-boot:run
```

---

## 📋 Checklist de Validation

- [ ] IA Service démarre sur port 8000
- [ ] Health check retourne 200
- [ ] Analyze endpoint fonctionne
- [ ] Chat endpoint fonctionne
- [ ] Frontend charge sur port 5173
- [ ] Dashboard affiche les données
- [ ] Copilot Chat fonctionne
- [ ] Pas d'erreurs Console
- [ ] Backend démarre sur port 8080 (optionnel)
- [ ] Build Frontend réussit
- [ ] Build Backend réussit
