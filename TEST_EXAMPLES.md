# Exemples de Tests - Guide de Test Manuel

## Date: 2024
## Projet: Stage_IA - Système de Gestion RSSI

---

## Guide de Test pour Chaque Page

Ce document fournit des scénarios de test pour chaque page de l'application afin de vérifier le bon fonctionnement des fonctionnalités.

---

## 1. DashboardPage

### Scénarios de Test

#### Test 1.1: Affichage des statistiques
**Objectif**: Vérifier que les statistiques s'affichent correctement
**Étapes**:
1. Naviguer vers la page Dashboard
2. Vérifier que les cartes de statistiques s'affichent
3. Vérifier les valeurs: Documents, Risques, Recommandations
4. Vérifier que les graphiques (PieChart, BarChart) s'affichent

**Résultat attendu**: Toutes les statistiques et graphiques s'affichent avec les données correctes

---

#### Test 1.2: Chargement des données
**Objectif**: Vérifier le chargement des données depuis l'API
**Étapes**:
1. Ouvrir les DevTools (F12)
2. Naviguer vers l'onglet Network
3. Rafraîchir la page Dashboard
4. Vérifier les appels API: /api/documents, /api/risks, /api/recommendations

**Résultat attendu**: Tous les appels API retournent un statut 200 OK

---

## 2. InventoryPage

### Scénarios de Test

#### Test 2.1: Scan de dossier
**Objectif**: Vérifier le scan d'un dossier
**Étapes**:
1. Naviguer vers la page Inventaire
2. Entrer un chemin de dossier valide (ex: d:\Stage_IA\sample-documents)
3. Cliquer sur le bouton "Scanner"
4. Attendre la fin du scan
5. Vérifier le message de succès

**Résultat attendu**: Le scan se termine avec succès et affiche le nombre de fichiers traités

---

#### Test 2.2: Recherche et filtrage
**Objectif**: Vérifier la recherche et le filtrage des documents
**Étapes**:
1. Naviguer vers la page Inventaire
2. Dans la barre de recherche, entrer "contrat"
3. Vérifier que seuls les documents contenant "contrat" s'affichent
4. Filtrer par type de document (ex: RH)
5. Vérifier que seuls les documents RH s'affichent

**Résultat attendu**: La recherche et le filtrage fonctionnent correctement

---

#### Test 2.3: Analyse d'un document
**Objectif**: Vérifier l'analyse IA d'un document
**Étapes**:
1. Naviguer vers la page Inventaire
2. Sélectionner un document avec le statut "PENDING"
3. Cliquer sur le bouton "Analyser"
4. Attendre la fin de l'analyse
5. Vérifier que le rapport d'analyse s'affiche

**Résultat attendu**: L'analyse se termine avec succès et le rapport s'affiche

---

#### Test 2.4: Suppression d'un document
**Objectif**: Vérifier la suppression d'un document
**Étapes**:
1. Naviguer vers la page Inventaire
2. Cliquer sur le bouton "Supprimer" d'un document
3. Confirmer la suppression dans la boîte de dialogue
4. Vérifier que le document n'apparaît plus dans la liste

**Résultat attendu**: Le document est supprimé avec succès

---

#### Test 2.5: Tri des documents
**Objectif**: Vérifier le tri des documents
**Étapes**:
1. Naviguer vers la page Inventaire
2. Cliquer sur l'en-tête de colonne "Nom"
3. Vérifier que les documents sont triés par nom
4. Cliquer à nouveau pour inverser l'ordre

**Résultat attendu**: Le tri fonctionne correctement dans les deux sens

---

## 3. AssetsPage

### Scénarios de Test

#### Test 3.1: Création d'un actif
**Objectif**: Vérifier la création d'un nouvel actif
**Étapes**:
1. Naviguer vers la page Gestion des actifs
2. Remplir le formulaire:
   - Nom: "Serveur Principal"
   - Type: "MATERIEL"
   - Description: "Serveur de production"
   - Propriétaire: "IT Department"
   - Criticité: "CRITIQUE"
   - Statut: "ACTIF"
3. Cliquer sur "Créer"
4. Vérifier que l'actif apparaît dans la liste

**Résultat attendu**: L'actif est créé avec succès

---

#### Test 3.2: Modification d'un actif
**Objectif**: Vérifier la modification d'un actif existant
**Étapes**:
1. Naviguer vers la page Gestion des actifs
2. Cliquer sur "Modifier" pour un actif existant
3. Changer le statut en "INACTIF"
4. Cliquer sur "Mettre à jour"
5. Vérifier que les modifications sont sauvegardées

**Résultat attendu**: Les modifications sont sauvegardées avec succès

---

#### Test 3.3: Suppression d'un actif
**Objectif**: Vérifier la suppression d'un actif
**Étapes**:
1. Naviguer vers la page Gestion des actifs
2. Cliquer sur "Supprimer" pour un actif
3. Confirmer la suppression
4. Vérifier que l'actif n'apparaît plus

**Résultat attendu**: L'actif est supprimé avec succès

---

## 4. RisksPage

### Scénarios de Test

#### Test 4.1: Affichage des risques
**Objectif**: Vérifier l'affichage des risques détectés
**Étapes**:
1. Naviguer vers la page Analyse des risques
2. Vérifier que le tableau des risques s'affiche
3. Vérifier les colonnes: Titre, Description, Sévérité, Catégorie, Document, Solution

**Résultat attendu**: Tous les risques s'affichent avec les bonnes informations

---

#### Test 4.2: Filtrage par sévérité
**Objectif**: Vérifier le filtrage des risques par sévérité
**Étapes**:
1. Naviguer vers la page Analyse des risques
2. Utiliser le filtre pour afficher uniquement les risques "CRITIQUE"
3. Vérifier que seuls les risques critiques s'affichent

**Résultat attendu**: Le filtrage fonctionne correctement

---

## 5. RecommendationsPage

### Scénarios de Test

#### Test 5.1: Workflow de validation
**Objectif**: Vérifier le workflow de validation des recommandations
**Étapes**:
1. Naviguer vers la page Recommandations IA
2. Sélectionner une recommandation avec le statut "EN_COURS"
3. Cliquer sur "Valider"
4. Vérifier que le statut passe à "VALIDEE"
5. Vérifier que la barre de progression est à 100%

**Résultat attendu**: Le workflow de validation fonctionne correctement

---

#### Test 5.2: Rejet d'une recommandation
**Objectif**: Vérifier le rejet d'une recommandation
**Étapes**:
1. Naviguer vers la page Recommandations IA
2. Sélectionner une recommandation
3. Cliquer sur "Rejeter"
4. Vérifier que le statut passe à "REJETEE"

**Résultat attendu**: Le rejet fonctionne correctement

---

#### Test 5.3: Mise à jour de la progression
**Objectif**: Vérifier la mise à jour de la progression
**Étapes**:
1. Naviguer vers la page Recommandations IA
2. Sélectionner une recommandation
3. Cliquer sur "En cours"
4. Vérifier que la barre de progression s'affiche

**Résultat attendu**: La progression s'affiche correctement

---

## 6. ReportsPage

### Scénarios de Test

#### Test 6.1: Génération d'un rapport
**Objectif**: Vérifier la génération d'un rapport
**Étapes**:
1. Naviguer vers la page Rapports
2. Sélectionner un type de rapport (ex: "INVENTAIRE")
3. Cliquer sur "Générer"
4. Attendre la génération
5. Vérifier que le rapport apparaît dans la liste

**Résultat attendu**: Le rapport est généré avec succès

---

#### Test 6.2: Export PDF
**Objectif**: Vérifier l'export en PDF
**Étapes**:
1. Naviguer vers la page Rapports
2. Sélectionner un rapport
3. Cliquer sur "Export PDF"
4. Vérifier que le fichier PDF est téléchargé
5. Ouvrir le fichier PDF et vérifier le contenu

**Résultat attendu**: Le fichier PDF est généré avec le contenu correct

---

#### Test 6.3: Export Excel
**Objectif**: Vérifier l'export en Excel
**Étapes**:
1. Naviguer vers la page Rapports
2. Cliquer sur "Export Excel"
3. Vérifier que le fichier Excel est téléchargé
4. Ouvrir le fichier Excel et vérifier le contenu

**Résultat attendu**: Le fichier Excel est généré avec le contenu correct

---

#### Test 6.4: Export Word
**Objectif**: Vérifier l'export en Word
**Étapes**:
1. Naviguer vers la page Rapports
2. Sélectionner un rapport
3. Cliquer sur "Export Word"
4. Vérifier que le fichier Word est téléchargé
5. Ouvrir le fichier Word et vérifier le contenu

**Résultat attendu**: Le fichier Word est généré avec le contenu correct

---

## 7. ReferentialsPage

### Scénarios de Test

#### Test 7.1: Affichage des référentiels
**Objectif**: Vérifier l'affichage des référentiels de sécurité
**Étapes**:
1. Naviguer vers la page Référentiels
2. Vérifier que le tableau des référentiels s'affiche
3. Vérifier les colonnes: Code, Nom, Catégorie, Objectif, Contrôles, Score, Version

**Résultat attendu**: Tous les référentiels s'affichent avec les bonnes informations

---

#### Test 7.2: Affichage du score de conformité
**Objectif**: Vérifier l'affichage du score de conformité
**Étapes**:
1. Naviguer vers la page Référentiels
2. Vérifier que la barre de progression du score s'affiche
3. Vérifier que le pourcentage est correct

**Résultat attendu**: Le score de conformité s'affiche correctement

---

## 8. AuditPage

### Scénarios de Test

#### Test 8.1: Affichage des logs d'audit
**Objectif**: Vérifier l'affichage des logs d'audit
**Étapes**:
1. Naviguer vers la page Journal d'audit
2. Vérifier que le tableau des logs s'affiche
3. Vérifier les colonnes: Date, Utilisateur, Action, Entité, Détails, IP, Navigateur, Durée, Succès

**Résultat attendu**: Tous les logs s'affichent avec les bonnes informations

---

#### Test 8.2: Export des logs
**Objectif**: Vérifier l'export des logs en Excel
**Étapes**:
1. Naviguer vers la page Journal d'audit
2. Cliquer sur "Export Excel"
3. Vérifier que le fichier Excel est téléchargé
4. Ouvrir le fichier Excel et vérifier le contenu

**Résultat attendu**: Le fichier Excel est généré avec toutes les informations

---

#### Test 8.3: Vérification de l'enregistrement des actions
**Objectif**: Vérifier que les actions sont enregistrées
**Étapes**:
1. Effectuer une action (ex: supprimer un document)
2. Naviguer vers la page Journal d'audit
3. Vérifier que l'action apparaît dans les logs
4. Vérifier les détails: utilisateur, action, entité, détails

**Résultat attendu**: L'action est enregistrée avec tous les détails corrects

---

## 9. CopilotPage

### Scénarios de Test

#### Test 9.1: Question au Copilote IA
**Objectif**: Vérifier l'envoi d'une question au Copilote IA
**Étapes**:
1. Naviguer vers la page Copilot IA
2. S'assurer que le mode "Mode IA" est activé
3. Entrer une question: "Quels sont les principaux risques détectés ?"
4. Cliquer sur "Envoyer"
5. Attendre la réponse
6. Vérifier que la réponse s'affiche

**Résultat attendu**: La réponse du Copilote IA s'affiche correctement

---

#### Test 9.2: Recherche dans la base de données
**Objectif**: Vérifier la recherche dans la base de données
**Étapes**:
1. Naviguer vers la page Copilot IA
2. Activer le mode "Recherche DB"
3. Entrer un terme de recherche: "contrat"
4. Cliquer sur "Rechercher"
5. Vérifier que les résultats s'affichent

**Résultat attendu**: Les résultats de la recherche s'affichent correctement

---

#### Test 9.3: Utilisation des suggestions
**Objectif**: Vérifier l'utilisation des suggestions
**Étapes**:
1. Naviguer vers la page Copilot IA
2. Cliquer sur une suggestion (ex: "Explique ISO 27001")
3. Attendre la réponse
4. Vérifier que la réponse s'affiche

**Résultat attendu**: La suggestion fonctionne correctement

---

## 10. NotificationsPage

### Scénarios de Test

#### Test 10.1: Affichage des notifications
**Objectif**: Vérifier l'affichage des notifications
**Étapes**:
1. Naviguer vers la page Notifications
2. Vérifier que les notifications s'affichent
3. Vérifier les notifications non lues (fond bleu clair)

**Résultat attendu**: Toutes les notifications s'affichent correctement

---

#### Test 10.2: Marquer comme lu
**Objectif**: Vérifier le marquage d'une notification comme lue
**Étapes**:
1. Naviguer vers la page Notifications
2. Cliquer sur une notification non lue
3. Vérifier que le fond devient blanc
4. Vérifier que le compteur de notifications non lues diminue

**Résultat attendu**: La notification est marquée comme lue

---

#### Test 10.3: Tout marquer comme lu
**Objectif**: Vérifier le marquage de toutes les notifications comme lues
**Étapes**:
1. Naviguer vers la page Notifications
2. Cliquer sur "Tout marquer comme lu"
3. Vérifier que toutes les notifications sont marquées comme lues
4. Vérifier que le compteur passe à 0

**Résultat attendu**: Toutes les notifications sont marquées comme lues

---

## 11. CompliancePage

### Scénarios de Test

#### Test 11.1: Affichage du tableau de conformité
**Objectif**: Vérifier l'affichage du tableau de conformité
**Étapes**:
1. Naviguer vers la page Tableau de conformité
2. Vérifier que les cartes de statistiques s'affichent
3. Vérifier le tableau des référentiels

**Résultat attendu**: Toutes les informations de conformité s'affichent

---

#### Test 11.2: Affichage du score global
**Objectif**: Vérifier l'affichage du score global
**Étapes**:
1. Naviguer vers la page Tableau de conformité
2. Vérifier que le score global s'affiche
3. Vérifier que le cercle de score a la bonne couleur

**Résultat attendu**: Le score global s'affiche correctement

---

## 12. HistoryPage

### Scénarios de Test

#### Test 12.1: Affichage de l'historique
**Objectif**: Vérifier l'affichage de l'historique IA
**Étapes**:
1. Naviguer vers la page Historique IA
2. Vérifier que les interactions s'affichent
3. Vérifier les détails: utilisateur, question, réponse, durée, tokens

**Résultat attendu**: Toutes les interactions s'affichent avec les bons détails

---

#### Test 12.2: Filtrage par utilisateur
**Objectif**: Vérifier le filtrage par utilisateur
**Étapes**:
1. Naviguer vers la page Historique IA
2. Sélectionner un utilisateur dans le filtre
3. Vérifier que seules les interactions de cet utilisateur s'affichent

**Résultat attendu**: Le filtrage par utilisateur fonctionne correctement

---

## 13. SecurityScorePage

### Scénarios de Test

#### Test 13.1: Affichage du score de sécurité
**Objectif**: Vérifier l'affichage du score de sécurité
**Étapes**:
1. Naviguer vers la page Score de sécurité
2. Vérifier que le cercle de score s'affiche
3. Vérifier que les scores par catégorie s'affichent

**Résultat attendu**: Tous les scores s'affichent correctement

---

#### Test 13.2: Affichage des recommandations
**Objectif**: Vérifier l'affichage des recommandations d'amélioration
**Étapes**:
1. Naviguer vers la page Score de sécurité
2. Vérifier que la liste des recommandations s'affiche
3. Vérifier que les recommandations sont pertinentes

**Résultat attendu**: Les recommandations s'affichent correctement

---

## 14. GlobalSearch

### Scénarios de Test

#### Test 14.1: Ouverture de la recherche globale
**Objectif**: Vérifier l'ouverture de la recherche globale
**Étapes**:
1. Appuyer sur Ctrl+K
2. Vérifier que la modale de recherche s'ouvre
3. Vérifier que le champ de saisie est focus

**Résultat attendu**: La modale de recherche s'ouvre correctement

---

#### Test 14.2: Recherche globale
**Objectif**: Vérifier la recherche globale
**Étapes**:
1. Ouvrir la recherche globale (Ctrl+K)
2. Entrer un terme de recherche: "risque"
3. Attendre les résultats
4. Vérifier que les résultats de différentes entités s'affichent

**Résultat attendu**: Les résultats de recherche s'affichent correctement

---

#### Test 14.3: Fermeture de la recherche
**Objectif**: Vérifier la fermeture de la recherche
**Étapes**:
1. Ouvrir la recherche globale
2. Appuyer sur Esc
3. Vérifier que la modale se ferme

**Résultat attendu**: La modale se ferme correctement

---

## Checklist de Test Général

### Pré-requis
- [ ] Backend démarré (port 8080)
- [ ] Frontend démarré (port 3000)
- [ ] Service IA Python démarré (port 8000)
- [ ] Base de données PostgreSQL démarrée
- [ ] Navigateur compatible (Chrome, Firefox, Edge)

### Tests d'intégration
- [ ] Test de connexion à l'API
- [ ] Test de chargement des données
- [ ] Test de création de données
- [ ] Test de modification de données
- [ ] Test de suppression de données
- [ ] Test de l'audit logging

### Tests de performance
- [ ] Test de chargement de page
- [ ] Test de réponse de l'API
- [ ] Test de rendu des graphiques
- [ ] Test de recherche

### Tests de sécurité
- [ ] Test d'authentification
- [ ] Test d'autorisation
- [ ] Test de validation des entrées
- [ ] Test de protection XSS

---

## Conclusion

Ce guide de test couvre tous les scénarios de test pour chaque page de l'application. Il est recommandé d'exécuter ces tests régulièrement pour assurer la qualité et la stabilité de l'application.
