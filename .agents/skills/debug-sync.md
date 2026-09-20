# Compétence / Workflow : Diagnostiquer la Synchronisation Google — `debug-sync` 🔍☁️

Ce workflow permet d'isoler et de résoudre méthodiquement tout incident de synchronisation entre l'application SQLite locale et Google Drive / Sheets.

---

## 1. Arbre de Diagnostic Rapide

```
[Incident de Synchronisation Déclaré]
       │
       ▼
1. Le smartphone a-t-il une connexion internet active ?
   ├── NON ──► Comportement normal : l'application est Offline-First. Les commandes restent en attente locale.
   └── OUI
       │
       ▼
2. La session Google Sign-In est-elle active avec token valide ?
   ├── NON ──► Rediriger l'artisan vers LoginScreen ou renouveler la session.
   └── OUI
       │
       ▼
3. Y a-t-il des commandes avec is_synced = 0 dans SQLite ?
   ├── NON ──► Rien à exporter, la base locale est déjà à 100% synchronisée.
   └── OUI
       │
       ▼
4. Le verrou isSyncing est-il bloqué à true ?
   ├── OUI ──► Vérifier la présence du bloc "finally { isSyncing = false; }".
   └── NON
       │
       ▼
5. L'appel Google Drive / Sheets renvoie-t-il HTTP 200 OK ?
   ├── NON (401) ──► Jeton d'accès expiré : renouveler via GoogleSignin.getTokens().
   ├── NON (403) ──► Scopes drive.file ou spreadsheets non accordés.
   └── OUI ──► Vérifier que marquerCommandesCommeSynchro a bien positionné is_synced = 1.
```

---

## 2. Procédure de Test Manuel Pas-à-Pas

### Étape 1 : Vérifier la détection réseau (`NetInfo`)
Observer la sortie console Metro (`npx react-native start`) :
```text
=== ÉTAT DU RÉSEAU MODIFIÉ === {
  type: 'wifi', // ou 'cellular'
  isConnected: true,
  isInternetReachable: true
}
```
> [!IMPORTANT]
> `isConnected: true` ne suffit pas. Si `isInternetReachable` est à `false` (ex: réseau Wi-Fi sans accès internet ou portail captif d'atelier), l'envoi vers Google échouera.

### Étape 2 : Vérifier les tokens OAuth dans `syncService.ts`
Vérifier l'obtention du token :
```typescript
const tokens = await GoogleSignin.getTokens();
console.log('Access Token présent :', !!tokens.accessToken);
```
Si une exception survient, vérifier que l'artisan est connecté via `authService.checkIsLoggedIn()`.

### Étape 3 : Inspecter la base SQLite locale
Vérifier les commandes locales en attente d'exportation avec la bonne colonne SQL (`garment_type_id`) :
```sql
SELECT id, garment_type_id, status, is_synced, created_at 
FROM commandes 
WHERE is_synced = 0;
```
Vérifier que la fonction `recupererCommandesNonSynchro()` dans `queries.ts` retourne bien ces enregistrements avec le nom et le téléphone du client associés.

### Étape 4 : Tester la recherche ou création du fichier Drive
La recherche du classeur effectue :
```text
GET https://www.googleapis.com/drive/v3/files?q=name%3D'SmartTailor_Commandes'%20and%20mimeType%3D'application%2Fvnd.google-apps.spreadsheet'%20and%20trashed%3Dfalse
```
Si le fichier n'existe pas encore sur le Drive de l'artisan, `creerSpreadsheet()` doit créer le fichier et insérer la ligne d'en-tête (9 colonnes).

### Étape 5 : Déclencher manuellement la synchronisation
Dans `src/screens/DashboardScreen.tsx`, cliquer sur l'icône nuage (`handleManualSync`).
* Vérifier dans les logs l'apparition de :
  ```text
  === DEBUT DE SYNCHRONISATION : X COMMANDES EN ATTENTE ===
  === SYNCHRONISATION CLOUD TERMINÉE AVEC SUCCÈS ===
  === X COMMANDES MARQUÉES COMME SYNCHRONISÉES ===
  ```

---

## 3. Matrice des Erreurs Fréquentes & Résolutions

| Code / Symptôme | Cause Identifiée | Résolution Immédiate |
| :--- | :--- | :--- |
| **Erreur 10 ou 12500** | Problème de signature SHA-1 Android ou mauvais `webClientId` | Vérifier le SHA-1 de debug/release dans Google Cloud Console et la clé `webClientId` dans `App.tsx`. |
| **HTTP 401 Unauthorized** | Le jeton d'accès Google a expiré (durée standard : 60 min) | Réexécuter `await GoogleSignin.getTokens()` pour obtenir un token rafraîchi avant l'appel API. |
| **HTTP 403 Forbidden** | Scopes manquants ou non autorisés | S'assurer que `App.tsx` contient bien `scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/spreadsheets']`. Déconnecter puis reconnecter l'utilisateur. |
| **`no such column: model_id`** | Requête SQL obsolète cherchant `model_id` au lieu de `garment_type_id` | Utiliser impérativement `garment_type_id` dans toutes les requêtes SQL de la table `commandes`. |
| **Blocage infini de la synchronisation** | Le flag `isSyncing` est resté à `true` suite à une exception non capturée | Vérifier que `isSyncing = false;` se trouve impérativement dans le bloc `finally` de `lancerSynchronisation()`. |
| **Commandes réémises en boucle** | Échec de `marquerCommandesCommeSynchro` | Vérifier la transaction de mise à jour SQLite et s'assurer que `ids` contient bien un tableau d'identifiants numériques valides. |
