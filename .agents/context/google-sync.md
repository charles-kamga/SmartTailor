# Synchronisation Serverless Google Drive & Sheets — SmartTailor ☁️

Ce document décrit l'architecture, le protocole de communication et les règles de résilience du moteur de synchronisation cloud de SmartTailor (`src/services/syncService.ts`).

---

## 1. Philosophie & Sécurité des Données

SmartTailor applique une approche **Serverless Directe** : l'application mobile communique directement avec le compte Google personnel de l'artisan via les APIs REST officielles de Google.
* **Aucun serveur tiers** : Aucune donnée client ou mensuration ne transite par un serveur intermédiaire propriétaire.
* **Souveraineté des données** : L'artisan reste l'unique propriétaire de sa base de données et de son classeur de suivi.

### Scopes OAuth 2.0 Minimaux & Restrictifs
Configurés dans `App.tsx` via `GoogleSignin.configure()` :
1. `https://www.googleapis.com/auth/drive.file` :
   - **Périmètre strict** : Donne accès **exclusivement** aux fichiers créés par l'application SmartTailor elle-même.
   - **Protection de la vie privée** : L'application est techniquement incapable de lire ou modifier les autres documents, photos ou dossiers personnels présents sur le Google Drive de l'artisan.
2. `https://www.googleapis.com/auth/spreadsheets` :
   - Permet la création, l'écriture et l'ajout de lignes dans le classeur de suivi des commandes.

---

## 2. Déroulement du Flux de Synchronisation (`syncService.ts`)

La fonction `lancerSynchronisation()` exécute une séquence en 6 étapes strictement ordonnées :

```
[Étape 1 : Verrou d'Exclusion Mutuelle]
  └── Si isSyncing == true ──► Fin immédiate (évite les conflits concurrents)
  └── isSyncing = true

[Étape 2 : Obtention du Jeton d'Accès Google]
  └── GoogleSignin.getTokens() ──► Extraction de accessToken valide
  └── En cas d'échec ou d'absence de session ──► Arrêt propre

[Étape 3 : Requête Locale des Commandes en Attente]
  └── queries.recupererCommandesNonSynchro() (SELECT ... WHERE is_synced = 0)
  └── Si tableau vide ──► Fin du processus (rien à synchroniser)

[Étape 4 : Résolution du Classeur sur Google Drive]
  └── Vérification du cache mémoire (cachedSpreadsheetId)
  └── Si non présent en cache ──► Recherche REST Drive v3 :
        GET https://www.googleapis.com/drive/v3/files?q=name='SmartTailor_Commandes' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false
  └── Si fichier introuvable ──► Création POST /drive/v3/files puis initialisation des 9 en-têtes de colonnes

[Étape 5 : Formatage et Ajout des Lignes sur Google Sheets]
  └── Transformation des objets commandes en matrice 2D [ [ID, Client, ..., Date], ... ]
  └── POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED

[Étape 6 : Validation Locale & Libération du Verrou]
  └── Si appendResponse.ok ──► queries.marquerCommandesCommeSynchro(ids) (UPDATE is_synced = 1)
  └── Bloc finally { isSyncing = false; } ──► Libération systématique du verrou
```

---

## 3. Structure des Colonnes Google Sheets

Le classeur généré sur Google Drive s'intitule **`SmartTailor_Commandes`**.

### Ligne d'En-tête (Feuille `Sheet1`) :
1. `ID Commande` : Identifiant unique SQLite local.
2. `Nom Client` : Nom complet du client.
3. `Téléphone` : Numéro de téléphone au format normalisé.
4. `Type Vêtement` : Identifiant du modèle (`senator`, `kaba`, `boubou`, `suit`, etc.).
5. `Mesures (JSON)` : Chaîne JSON exhaustive des mensurations prises à la commande.
6. `Notes / Jargon` : Instructions d'atelier, finitions, détails tissu.
7. `Statut` : `'En attente'` | `'En cours'` | `'Prêt'` | `'Terminé'`.
8. `Date Réception` : Horodatage de création de la commande.
9. `Date Livraison Estimée` : Date calculée par l'algorithme d'atelier (ex: `"24 Oct"`).

---

## 4. Règles d'Or de Synchronisation 🛡️

### Règle 1 : Libération Inconditionnelle du Verrou dans `finally`
Le verrou global `isSyncing` protège l'application des doubles déclenchements (par exemple lorsqu'un retour réseau survient au moment où l'utilisateur clique sur le bouton manuel).
```typescript
let isSyncing = false;

export async function lancerSynchronisation(): Promise<void> {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Traitement complet de synchronisation...
  } catch (error) {
    console.error('Erreur lors du processus de synchronisation :', error);
  } finally {
    // OBLIGATOIRE : garantit que le verrou est relâché même en cas de crash réseau ou d'exception
    isSyncing = false;
  }
}
```

### Règle 2 : Priorité Locale & Séparation Temporelle
Aucune saisie de commande n'attend la fin d'une synchronisation réseau.
1. La commande est **d'abord** persistée dans SQLite avec `is_synced = 0`.
2. L'interface confirme instantanément la création à l'artisan.
3. La synchronisation s'exécute de façon asynchrone en arrière-plan.
4. La base locale n'est mise à jour avec `is_synced = 1` **qu'après** confirmation de l'API Google Sheets (`appendResponse.ok === true`).

### Règle 3 : Déclencheurs Multiples
1. **Écouteur Réseau Automatique (`NetInfo`)** :
   Dans `App.tsx`, l'écouteur surveille l'état de la connexion. Dès que `state.isConnected && state.isInternetReachable` passe à `true`, `lancerSynchronisation()` est appelé automatiquement.
2. **Bouton Manuel d'Atelier** :
   Dans `src/screens/DashboardScreen.tsx`, l'icône nuage permet à l'artisan de forcer la synchronisation et affiche un toast de confirmation ou d'erreur.

---

## 5. Gestion des Erreurs et Résilience Réseau

| Erreur / Contexte | Cause Probable | Comportement & Solution |
| :--- | :--- | :--- |
| **Zone blanche / Hors-ligne** | Pas de réseau cellulaire dans l'atelier | L'appel à `lancerSynchronisation()` échoue silencieusement ou `NetInfo` bloque. Les données restent saines dans SQLite avec `is_synced = 0`. |
| **HTTP 401 Unauthorized** | Le jeton d'accès Google OAuth a expiré (durée de vie 1h) | `GoogleSignin.getTokens()` renouvelle le jeton en tâche de fond. Si la session est perdue, rediriger vers `LoginScreen`. |
| **HTTP 403 Forbidden** | Scopes refusés lors de la première connexion | L'utilisateur doit se reconnecter et accepter les permissions Drive/Sheets. |
| **Coupure en plein vol (Fetch Aborted)** | L'artisan perd le réseau pendant le `POST` vers Sheets | Le bloc `catch` intercepte l'erreur, `is_synced` reste à `0`, et le bloc `finally` libère `isSyncing = false`. La synchronisation se réessaiera dès le prochain retour du réseau. |

---

## 6. Évolution Recommandée : Pattern "Indexation Read + BatchUpdate" (Anti-Doublons)

Actuellement, l'endpoint `append` ajoute une nouvelle ligne même lors d'une simple modification de statut. Pour atteindre une synchronisation **idempotente** sans risque de doublons tout en respectant le quota Google de **60 requêtes/minute** :

```
[1. Indexation en 1 requête GET]
  └── GET spreadsheets/{id}/values/Sheet1!A:A
  └── Construction de la table d'index en mémoire : Map<id_commande, rowIndex>

[2. Partitionnement Local]
  ├── commandesExistantes (IDs trouvés dans la feuille) ──► mise à jour ciblée
  └── commandesNouvelles   (IDs absents de la feuille) ──► ajout

[3. Exécution Groupée]
  ├── Pour les existantes : POST spreadsheets/{id}/values:batchUpdate
  └── Pour les nouvelles  : POST spreadsheets/{id}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED
```
