# Cahier des Charges - Copilot RSSI

## Projet
**Nom :** Copilot RSSI - Copilote IA pour le Responsable Sécurité SI  
**Type :** Application web full-stack  
**Durée :** 6 semaines (stage)  
**Architecture :** Frontend (React.js) → Backend (Spring Boot) → Base de données (MySQL) + Service IA (FastAPI/Python)

---

## Objectifs du projet

Développer un assistant intelligent pour aider les Responsables Sécurité des Systèmes d'Information (RSSI) à :
- Gérer et analyser les documents sensibles
- Détecter les risques de sécurité
- Classifier les documents automatiquement
- Obtenir des réponses intelligentes via un copilote IA
- Suivre l'historique des analyses effectuées

---

## Architecture technique

### Frontend
- **Framework :** React.js avec TypeScript
- **Build tool :** Vite
- **UI Library :** shadcn/ui + TailwindCSS
- **State management :** Context API
- **Routing :** React Router
- **Icons :** Lucide React

### Backend
- **Framework :** Spring Boot (Java 17)
- **Architecture :** Architecture en couches (Controller → Service → Repository)
- **Sécurité :** JWT Authentication + BCrypt
- **API Documentation :** Swagger/OpenAPI
- **Database :** MySQL 8+

### Service IA
- **Framework :** FastAPI (Python 3.11+)
- **Fonctionnalités :** Extraction de contenu, classification, détection de données sensibles, analyse de risques
- **RAG :** Intégration avec référentiels (ISO 27001, NIST)

---

## Fonctionnalités principales

### 1. Authentification et Autorisation
- [x] Login avec JWT
- [x] Rôles : ADMIN, RSSI
- [x] Protection des routes
- [x] Gestion des sessions

### 2. Inventaire des documents
- [x] Scan automatique de répertoires
- [x] Indexation des fichiers (PDF, Word, Excel, TXT, images)
- [x] Extraction de contenu (OCR pour images)
- [x] Affichage des métadonnées

### 3. Classification documentaire
- [x] Classification automatique par type (RH, Finance, Juridique, Direction, Informatique, Achats)
- [x] Détection de données sensibles (CIN, email, téléphone, IBAN, mots de passe)
- [x] Niveau de confidentialité

### 4. Analyse des risques
- [x] Évaluation des risques par document
- [x] Score de risque
- [x] Recommandations de sécurité
- [x] Historique des analyses

### 5. Copilote IA
- [x] Chat interactif avec l'IA
- [x] Questions/réponses sur les documents
- [x] RAG avec référentiels de sécurité
- [x] Historique des conversations

### 6. Référentiels de sécurité
- [x] ISO 27001
- [x] NIST
- [x] RGPD
- [x] Personnalisation des référentiels

---

## Historique des analyses

### Fonctionnalités incluses

- ✅ **Recherche** : Permet de rechercher des analyses spécifiques
- ✅ **Filtre par date** : Filtrer les analyses par période (date début / date fin)
- ✅ **Filtre par type d'analyse** : Filtrer par catégorie (Documents / Risques / Référentiels / IA)
- ✅ **Bouton "Voir détails"** : Permet de voir les détails complets d'une analyse spécifique
- ✅ **Bouton "Supprimer"** : Permet de supprimer une interaction/analyse individuelle
- ✅ **Bouton "Vider l'historique"** : Permet de supprimer tout l'historique des analyses (avec confirmation)
- ✅ **Export PDF** : Exporter l'historique des analyses au format PDF
- ✅ **Export Excel** : Exporter l'historique des analyses au format Excel

---

## Spécifications techniques

### Base de données
- **SGBD :** MySQL 8+
- **Tables principales :**
  - users (utilisateurs)
  - documents (documents)
  - analyses (analyses)
  - risks (risques)
  - referentiels (référentiels)
  - chat_history (historique des conversations)

### API REST
- **Base URL :** http://localhost:8080/api
- **Authentication :** Bearer Token (JWT)
- **Endpoints principaux :**
  - `/auth/*` : Authentification
  - `/documents/*` : Gestion des documents
  - `/analyses/*` : Analyses et historique
  - `/risks/*` : Gestion des risques
  - `/referentiels/*` : Référentiels
  - `/chat/*` : Copilote IA

### Service IA
- **Base URL :** http://localhost:8000
- **Endpoints principaux :**
  - `/extract` : Extraction de contenu
  - `/classify` : Classification documentaire
  - `/detect` : Détection données sensibles
  - `/analyze-risks` : Analyse des risques
  - `/chat` : Chat avec l'IA
  - `/rag` : RAG avec référentiels

---

## Interface utilisateur

### Pages principales
1. **Dashboard** : Vue d'ensemble avec statistiques
2. **Inventaire** : Gestion des documents
3. **Analyses** : Historique des analyses
4. **Risques** : Vue des risques détectés
5. **Copilote IA** : Interface de chat
6. **Référentiels** : Gestion des référentiels
7. **Paramètres** : Configuration utilisateur

### Design
- **Style :** Moderne et professionnel
- **Responsive :** Adapté mobile/tablette/desktop
- **Thème :** Sombre/Clair
- **Accessibilité :** WCAG 2.1 AA

---

## Livrables

### Code source
- [x] Frontend React.js
- [x] Backend Spring Boot
- [x] Service IA Python
- [x] Scripts de base de données

### Documentation
- [x] README.md
- [x] Cahier des charges (ce document)
- [x] Guide d'installation
- [x] Documentation API (Swagger)

### Tests
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E

---

## Contraintes et exigences

### Sécurité
- [x] Authentification JWT
- [x] Hashage des mots de passe (BCrypt)
- [x] Validation des entrées
- [x] Protection contre les injections SQL
- [x] CORS configuré

### Performance
- [x] Pagination des résultats
- [x] Lazy loading des documents
- [x] Cache des réponses IA
- [ ] Optimisation des requêtes

### Qualité
- [x] Code commenté
- [x] Principes SOLID
- [x] Architecture en couches
- [x] Gestion des erreurs
- [ ] Tests de couverture > 80%

---

## Calendrier

### Semaine 1-2
- [x] Setup du projet
- [x] Architecture de base
- [x] Authentification
- [x] Inventaire des documents

### Semaine 3-4
- [x] Classification et détection
- [x] Analyse des risques
- [x] Service IA
- [x] Interface frontend

### Semaine 5-6
- [x] Copilote IA
- [x] Référentiels
- [x] Historique des analyses
- [ ] Tests et documentation
- [ ] Déploiement

---

## Critères d'acceptation

- [ ] Toutes les fonctionnalités principales implémentées
- [ ] Interface responsive et intuitive
- [ ] Performance acceptable (< 3s pour les requêtes)
- [ ] Sécurité validée
- [ ] Documentation complète
- [ ] Tests passants

---

## Notes

Ce cahier des charges est évolutif et peut être mis à jour en fonction des besoins du projet et des retours des utilisateurs.

**Version :** 1.0  
**Date :** 12 Juillet 2026  
**Auteur :** Équipe de développement
