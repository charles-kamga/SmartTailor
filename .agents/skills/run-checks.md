# Compétence / Workflow : Vérification Complète du Projet — `run-checks` 🧪🚀

Ce workflow rassemble la suite de contrôles obligatoires à exécuter pour valider la conformité technique, stylistique et fonctionnelle de **SmartTailor**.

---

## 1. Suite de Contrôles Automatisés

### Étape 1 : Vérification TypeScript (Inviolable)
```bash
npx tsc --noEmit
```
* **Attendu** : Exit code `0` et aucune ligne d'erreur.
* **Tolérance** : 0 erreur acceptée. Aucun `@ts-ignore` ou contournement `any` abusif.

### Étape 2 : Analyse Statique & Linting
```bash
npx eslint .
```
* **Attendu** : Aucune erreur bloquante (les avertissements de style mineurs sont tolérés mais à corriger si possible).

### Étape 3 : Tests Unitaires Jest
```bash
npm test
```
* **Attendu** : Tous les tests unitaires doivent réussir (`PASS`).

### Étape 4 : Compilation de l'Application Android (Build de Contrôle)
```bash
npm run android
```
*(Nécessite un émulateur en marche ou un appareil Android connecté en USB avec le débogage activé).*
* **Attendu** : `BUILD SUCCESSFUL` via Gradle.

---

## 2. Checklist Manuelle Rapide (Parcours Utilisateur Clé)
1. **Démarrage & Session** : L'application s'ouvre sans planter, vérifie la session Google.
2. **Nouvelle Commande** :
   - Étape 0 : Saisie client sans blocage.
   - Étape 1 : Affichage des tenues sans dépassement d'écran.
   - Étape 2 : Le pavé numérique affecte bien les centimètres au champ sélectionné.
3. **Persistance** : La commande apparaît immédiatement dans la liste `CommandesScreen` et sur le `DashboardScreen`.
4. **Synchronisation** : Clic sur l'icône nuage ➔ la pastille de chargement s'active et la commande passe en synchronisée (`is_synced = 1`).
