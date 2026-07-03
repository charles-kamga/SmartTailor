# SmartTailor 🧵📱

> **Projet de fin d'études — Incubateur Te-Sea**  
> *Gérer votre atelier de couture avec élégance et précision.*

**SmartTailor** est une application Android développée en **React Native CLI (TypeScript)** conçue pour aider les tailleurs et couturiers (traditionnels et occidentaux) à professionnaliser et simplifier la gestion de leurs commandes, en remplaçant définitivement le cahier de notes papier traditionnel.

L'application repose sur une philosophie **Offline-First** (stockage local complet) et une architecture **Serverless** (les données sont synchronisées sur le Google Drive et Google Sheets personnels de l'utilisateur connecté).

---

## 🚀 Fonctionnalités Clés

*   **Saisie ultra-rapide des mesures (Zéro Friction) :** Un pavé numérique customisé (de 10 à 190 cm avec un pas de 5) sous forme de panneau coulissant (Bottom Sheet) pour éviter l'ouverture du clavier système et éliminer l'obstruction visuelle.
*   **Référentiel de vêtements dynamique (10 modèles) :** Gestion de fiches de mesures spécifiques selon le type de vêtement choisi (Sénateur/Ministre, Kaba Ngondo, Grand Boubou, Agbada, Caftan, Costume classique, etc.).
*   **Aperçu du style & Croquis :** Affichage d'un croquis de mode et d'une description du style lors de la sélection du vêtement pour aider le tailleur et son client.
*   **Tableau de bord intelligent (Atelier) :** Affichage des livraisons urgentes de la semaine avec des avatars d'initiales clients et des indicateurs visuels de priorité.
*   **Algorithme d'anticipation des livraisons :** Calcule automatiquement la date d'échéance ("À RENDRE LE") en fonction du temps de confection du vêtement choisi, de la charge de travail de l'atelier sur les 7 derniers jours, et en sautant systématiquement les dimanches.
*   **Mode Offline / Online & Synchro Google :** L'application fonctionne de manière autonome sans connexion. Dès qu'une connexion internet (Wi-Fi ou données) est détectée, un service de tâche de fond synchronise silencieusement les nouvelles commandes vers un classeur Google Sheets créé automatiquement sur le Drive de l'utilisateur.

---

## 🛠️ Pile Technique (Tech Stack)

*   **Framework :** React Native CLI (TypeScript)
*   **Navigation :** `@react-navigation/native` (Bottom Tabs + Native Stack)
*   **Base de données locale :** `@op-engineering/op-sqlite` (Moteur SQLite hautes performances basé sur JSI)
*   **Authentification Google :** `@react-native-google-signin/google-signin` (Authentification directe avec scopes Drive & Sheets)
*   **Détection réseau :** `@react-native-community/netinfo`
*   **Icônes :** `react-native-vector-icons` (Ionicons)

---

## 📂 Architecture des Dossiers

```text
SmartTailor/
├── src/
│   ├── assets/             # Fichiers images, logos, polices de caractères
│   ├── components/         # Composants réutilisables (Grille de chiffres, cartes, boutons)
│   ├── database/           # Stockage local SQL
│   │   ├── database.ts     # Initialisation de la DB op-sqlite
│   │   ├── queries.ts      # Requêtes SQL de lecture/écriture
│   │   └── garmentTemplates.ts # Base de données des 10 modèles de vêtements
│   ├── navigation/         # Configuration des écrans (types, onglets, piles)
│   ├── screens/            # Écrans de l'application (Login, Atelier, Clients, Nouveau Client...)
│   └── services/           # Services métiers
│       ├── deliveryAlgorithm.ts # Algorithme de calcul d'échéance
│       └── syncService.ts       # Synchronisation vers l'API Google Sheets/Drive
├── App.tsx                 # Racine de l'application (Écouteur réseau)
└── package.json            # Dépendances du projet
```

---

## 💻 Installation et Lancement (Environnement Linux/Android)

### 1. Prérequis
Assurez-vous d'avoir configuré votre environnement de développement Android sur votre machine.

### 2. Cloner et installer les dépendances
```bash
cd SmartTailor
npm install
```

### 3. Configurer les polices d'icônes (Android)
Copiez les fichiers de polices nécessaires dans les ressources Android :
```bash
mkdir -p android/app/src/main/assets/fonts
cp node_modules/react-native-vector-icons/Fonts/*.ttf android/app/src/main/assets/fonts/
```

### 4. Lancer le projet
1.  **Démarrer le serveur de développement (Metro Bundler) :**
    ```bash
    npx react-native start --reset-cache
    ```
2.  **Compiler et installer l'application sur l'émulateur ou un téléphone physique connecté (SM-A047F) :**
    Dans un autre terminal :
    ```bash
    npm run android
    ```

---

## 📁 Fonctionnement de la Synchronisation Google Sheets

L'application communique directement avec les services Google de l'utilisateur connecté sans passer par un serveur intermédiaire tiers (Serverless).

1.  Lors de la connexion (Login), l'application demande l'accès aux permissions `drive.file` et `spreadsheets`.
2.  Le service récupère le jeton d'accès (`accessToken`).
3.  Il effectue des requêtes REST vers Google Drive pour rechercher ou créer un fichier nommé `SmartTailor_Commandes`.
4.  Les commandes non synchronisées (`is_synced = 0` dans SQLite) sont envoyées à la suite du tableau Google Sheets via l'API Sheets Append.
5.  Une fois la confirmation obtenue, les lignes locales sont marquées comme synchronisées (`is_synced = 1`) en local.

