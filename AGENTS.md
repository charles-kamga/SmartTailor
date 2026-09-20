# SmartTailor — Instructions pour Agents IA 🧵📱

Bienvenue sur le projet **SmartTailor**. Ce fichier constitue le point d'entrée principal pour tout agent d'intelligence artificielle ou développeur intervenant sur ce dépôt.

---

## 🎯 Identité du Projet
* **Objectif** : Remplacer le cahier de notes traditionnel des tailleurs et couturiers (Afrique subsaharienne et diaspora) par un assistant numérique d'atelier rapide, élégant et fiable.
* **Stack Technique** : React Native CLI 0.86, React 19, TypeScript 5.9, `@op-engineering/op-sqlite` (JSI).
* **Philosophie d'Architecture** :
  1. **Offline-First Absolu** : L'artisan peut être en zone blanche. Tout s'enregistre immédiatement en local dans SQLite. Aucune action utilisateur n'attend le réseau.
  2. **Serverless Transparent** : Aucun serveur ou base de données intermédiaire. Les sauvegardes et synchronisations se font directement sur le Google Drive / Google Sheets personnel de l'utilisateur.

---

## ⚡ Commandes Indispensables
* **Installation des dépendances** : `npm install`
* **Serveur de développement (Metro)** : `npx react-native start --reset-cache`
* **Lancement sur émulateur/appareil Android** : `npm run android`
* **Vérification du typage (OBLIGATOIRE avant tout commit)** : `npx tsc --noEmit`
* **Analyse de style (Linter)** : `npx eslint .`
* **Exécution des tests** : `npm test`

---

## 🛡️ Règles d'Or Inviolables
1. **Priorité Locale Absolue** : Toute donnée DOIT être persistée avec succès dans SQLite avant tout déclenchement de synchronisation réseau.
2. **Transactions SQL Atomiques** : Toute opération impliquant plusieurs tables (ex: création simultanée d'un client et d'une commande) doit impérativement être encapsulée dans un bloc `BEGIN TRANSACTION ... COMMIT ... ROLLBACK`.
3. **Zéro Régression TypeScript** : Le projet doit impérativement conserver 0 erreur TypeScript (`npx tsc --noEmit` avec exit code 0). Pas de `any` injustifié, pas de `@ts-ignore`.
4. **Langue du Code & Métier** : Les fonctions métiers, variables, commentaires et messages utilisateurs sont rédigés en **français** (ex: `enregistrerNouveauClientAvecCommande`, `lancerSynchronisation`).
5. **Cible Android Prioritaire** : Le projet vise les smartphones Android d'atelier. Le dossier `ios/` ne doit pas être modifié sauf demande explicite.
6. **Styles React Native** : Utiliser exclusivement `StyleSheet.create()` en bas de composant. Bannir les styles inline pour préserver les performances et la lisibilité.
7. **Palette Officielle** :
   - Terracotta (Accent principal) : `#E2583E` *(Bannir `#A04000`)*
   - Ardoise / Slate (Texte & Titres) : `#1E293B`
   - Crème d'Atelier (Arrière-plan) : `#FAF8F5`
   - Vert Émeraude (Succès & Validation) : `#10B981`
   - Gris Doux (Muted & Bordures) : `#64748B` / `#E2E8F0`

---

## ✍️ Conventions de Commits & Stratégie de Sauvegarde

### Format des Messages
Les commits doivent être rédigés en **français naturel**, professionnel et compréhensible sans jargon excessif :
`[Action] : [Explication claire de l'objectif fonctionnel ou métier]`

*Exemples types :*
* `Ajout : Nouveau formulaire de sélection de tenue avec visuel`
* `Correction : Contraste du texte des filtres de commandes`
* `Amélioration : Adaptation de la hauteur du clavier sur petits écrans`
* `Optimisation : Sécurisation de la commande par transaction SQLite`
* `Documentation : Guide d'architecture pour les agents IA`

### Cadence de Sauvegarde (Protection contre les Erreurs)
1. **Point de Sauvegarde Pré-Refonte** : Créer un commit de sécurité dès que le projet est stable (`npx tsc --noEmit` OK) avant de lancer une refactorisation lourde ou une instruction d'agent risquée.
2. **Micro-Commits Atomiques** : Un changement logique validé = un commit immédiat.
3. **Règle du "Code Toujours Vert"** : Interdiction de commiter un état qui ne compile pas.
4. **Rollback Facile** : En cas de fausse piste d'un agent, revenir instantanément avec `git reset --hard HEAD`.

---

## 📚 Navigation dans la Documentation Agent
Pour aller plus loin, consulte les modules spécialisés dans `.agents/` :

* **Contextes Détaillés** (`.agents/context/`) :
  - `architecture.md` : Flux de données, arborescence et composants.
  - `code-conventions.md` : Guide de style TypeScript, conventions et cadence Git.
  - `database-schema.md` : Tables SQLite, requêtes DAL et cycle de vie.
  - `google-sync.md` : Mécanique de synchronisation Drive/Sheets serverless.
  - `garment-models.md` : Référentiel des 10 tenues et mensurations.
  - `expert-insights.md` : Bonnes pratiques d'ateliers et retours d'expérience.
  - `known-issues.md` : Inventaire des bugs connus et correctifs attendus.
* **Sous-Agents Spécialisés** (`.agents/agents/`) :
  - `ui-developer.md` : Expert ergonomie atelier & React Native.
  - `database-engineer.md` : Expert persistance locale & intégrité SQL.
  - `sync-specialist.md` : Expert APIs Google & résilience offline.
* **Workflows & Compétences** (`.agents/skills/`) :
  - `new-screen.md` | `new-garment.md` | `debug-sync.md` | `git-checkpoint.md` | `run-checks.md`
