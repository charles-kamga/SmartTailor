# Architecture & Patterns Techniques — SmartTailor 📐

Ce document décrit l'architecture globale, les flux de données et les patterns de conception mis en œuvre dans **SmartTailor**.

---

## 1. Vue d'Ensemble des Dossiers

```text
SmartTailor/
├── src/
│   ├── assets/              # Fichiers graphiques locaux (logos, icônes)
│   ├── components/          # Composants réutilisables
│   │   ├── StepIndicator.tsx  # Stepper visuel à 3 étapes
│   │   └── steps/           # Sous-composants modulaires du wizard de commande
│   │       ├── StepProfilClient.tsx  # Étape 0 : Coordonnées et profil
│   │       ├── StepTypeVetement.tsx  # Étape 1 : Choix de la tenue
│   │       └── StepMesuresSplit.tsx  # Étape 2 : Saisie des mesures & pavé
│   ├── database/            # Couche de persistance locale SQLite
│   │   ├── database.ts      # Initialisation op-sqlite, création DDL des tables
│   │   ├── queries.ts       # Data Access Layer (DAL) : requêtes CRUD, transactions
│   │   └── garmentTemplates.ts # Catalogue statique des 10 tenues & mesures
│   ├── navigation/          # Système de routage React Navigation
│   │   ├── AppNavigator.tsx # NativeStack racine + BottomTabs
│   │   └── types.ts         # Types TypeScript des écrans et paramètres
│   ├── screens/             # Écrans fonctionnels de l'application
│   │   ├── LoginScreen.tsx          # Connexion Google Sign-In
│   │   ├── DashboardScreen.tsx      # Accueil "Mon Atelier", urgences, synchro
│   │   ├── NouvelleCommandeScreen.tsx # Wizard de création de commande
│   │   ├── CommandesScreen.tsx      # Gestion et suivi des statuts
│   │   └── ClientsScreen.tsx        # Répertoire clients & mensurations
│   └── services/            # Logique métier et passerelles externes
│       ├── authService.ts       # Gestion de session Google & AsyncStorage
│       ├── deliveryAlgorithm.ts # Calcul de prédiction de délai de livraison
│       └── syncService.ts       # Synchronisation Google Drive & Sheets REST
├── App.tsx                  # Point d'entrée de l'application & écouteur réseau
└── package.json             # Dépendances du projet
```

---

## 2. Flux de Données Unidirectionnel & Offline-First

L'architecture suit un principe strict de **Source Unique de Vérité Locale** :

```
[Utilisateur en Atelier]
       │ (Saisie tactile)
       ▼
[Composant UI / Wizard]
       │
       ▼
[Couche DAL (queries.ts)]
       │ (Transaction atomique BEGIN...COMMIT)
       ▼
[Base Locale SQLite (op-sqlite)] ──► is_synced = 0
       │
   (Événement NetInfo ou Clic Synchro)
       ▼
[syncService.ts]
       │
   (Appels REST Google Sheets API)
       ▼
[Google Sheets / Drive]
       │ (Succès 200 OK)
       ▼
[Marquage SQLite] ──► is_synced = 1
```

### Règle d'or :
L'interface utilisateur ne dépend **jamais** de la disponibilité du réseau. La commande est validée dès son écriture dans SQLite.

---

## 3. Système de Navigation

L'application combine un **Native Stack Navigator** et un **Bottom Tab Navigator** :

* **Pile Racine (`RootStackParamList`)** :
  - `Login` : Affiché si aucune session Google n'est détectée.
  - `MainApp` : Conteneur principal intégrant la barre d'onglets.
  - `NouvelleCommande` : Écran modal / plein écran pour le wizard de commande.
* **Barre d'Onglets (`BottomTabParamList`)** :
  - `Atelier` (`DashboardScreen`) : Vue d'ensemble, commandes urgentes de la semaine.
  - `Clients` (`ClientsScreen`) : Liste des clients, recherche instantanée et mesures.
  - `Catalogue` : Consultation des modèles (actuellement placeholder).
  - `Commandes` (`CommandesScreen`) : Suivi d'atelier et changement d'états.

---

## 4. Pattern du Wizard Multi-Étapes (`NouvelleCommandeScreen`)

La prise de commande est découpée en 3 étapes guidées par `currentStep` (`0`, `1`, `2`) :

1. **Étape 0 — Profil Client (`StepProfilClient`)** :
   - Saisie du nom et du numéro de téléphone unique.
   - Sélection du genre/profil (`homme`, `femme`, `enfant_garcon`, `enfant_fille`).
2. **Étape 1 — Sélection du Vêtement (`StepTypeVetement`)** :
   - Filtrage des modèles compatibles avec le profil choisi.
   - Aperçu de l'illustration et description du style.
3. **Étape 2 — Saisie des Mesures (`StepMesuresSplit`)** :
   - Vue divisée (Split Screen) : liste des mesures requises en haut, pavé numérique virtuel en bas.
   - Saisie rapide sans faire apparaître le clavier virtuel d'Android qui masquerait la vue.

---

## 5. Patterns Techniques Clés

* **Curseurs SQLite Robustes (`getRows`)** : Dans `queries.ts`, les résultats bruts d'`op-sqlite` sont normalisés via une fonction helper pour tolérer les variations de structure de retour (`rows`, `rows._array`, ou `rows.item()`).
* **Requêtes Paramétrées** : Toutes les requêtes SQL utilisent impérativement les jokers `?` pour prémunir le système contre toute injection SQL.
* **Exclusion Mutuelle de Synchronisation** : Un verrou mémoire `isSyncing` empêche deux synchronisations concurrentes de se télescoper.
* **Actualisation Réactive avec `useFocusEffect`** : Les écrans de consultation rechargent leurs données SQLite fraîches dès qu'ils reprennent le focus.
