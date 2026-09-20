# Schéma de Base de Données & Couche DAL — SmartTailor 💾

Ce document constitue la référence absolue pour le modèle relationnel SQLite géré via `@op-engineering/op-sqlite` (JSI), la Data Access Layer (`src/database/queries.ts`), et les règles d'intégrité transactionnelle.

---

## 1. Schéma Relationnel SQLite (`src/database/database.ts`)

La base de données locale est stockée dans le fichier `smart_tailor.db`. Les clés étrangères sont systématiquement activées avec `PRAGMA foreign_keys = ON;`.

```sql
-- Table 1 : Les Clients de l'atelier
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  mesures_actuelles TEXT,  -- JSON sérialisé des mensurations les plus récentes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 2 : Le Catalogue de Modèles de Style (personnalisations atelier & croquis)
CREATE TABLE IF NOT EXISTS catalogue_modeles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  garment_type_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 3 : Les Commandes confectionnées
CREATE TABLE IF NOT EXISTS commandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  profile TEXT NOT NULL DEFAULT 'homme', -- 'homme' | 'femme' | 'enfant_garcon' | 'enfant_fille'
  garment_type_id TEXT NOT NULL,         -- Ex: 'senator', 'kaba', 'boubou', 'suit', etc.
  catalogue_modele_id INTEGER,           -- Référence optionnelle au catalogue d'atelier
  photo_commande TEXT,                   -- URI local de la photo du tissu ou croquis
  mesures_commande TEXT NOT NULL,        -- Instantané figé JSON des mesures à la commande
  notes TEXT,                            -- Instructions spéciales, choix tissus, jargon d'atelier
  status TEXT DEFAULT 'En attente',      -- 'En attente' | 'En cours' | 'Prêt' | 'Terminé'
  date_reception DATETIME DEFAULT CURRENT_TIMESTAMP,
  date_livraison_estimee TEXT NOT NULL,  -- Calculé par deliveryAlgorithm.ts (ex: "15 Oct")
  is_synced INTEGER DEFAULT 0,           -- 0 = À synchroniser sur Sheets, 1 = Synchronisé
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (catalogue_modele_id) REFERENCES catalogue_modeles (id) ON DELETE SET NULL
);
```

### Mécanisme de Migration Incrémentale
Afin de ne jamais corrompre ni écraser les bases SQLite des artisans lors des mises à jour applicatives, les évolutions de schéma utilisent des blocs DDL protégés :
```typescript
try {
  db.execute("ALTER TABLE commandes ADD COLUMN profile TEXT NOT NULL DEFAULT 'homme';");
  console.log('Migration: colonne profile ajoutée à la table commandes.');
} catch (migrationError) {
  // Ignorer gracieusement si la colonne existe déjà
}
```

---

## 2. Règles d'Or Back-End & Persistance 🛡️

### Règle 1 : Transactions SQL Atomiques Obligatoires
Toute opération touchant plusieurs tables ou requérant plusieurs étapes dépendantes (ex: vérification/insertion client + calcul de livraison + insertion commande) **DOIT IMPÉRATIVEMENT** être encapsulée dans une transaction :
```typescript
try {
  await db.execute('BEGIN TRANSACTION;');
  // ... opérations SQL successives ...
  await db.execute('COMMIT;');
} catch (error) {
  await db.execute('ROLLBACK;').catch(() => {});
  throw error;
}
```
*Pourquoi ?* Si l'artisan reçoit un appel ou si la batterie s'éteint au milieu de l'opération, la base ne doit jamais se retrouver dans un état orphelin ou corrompu.

### Règle 2 : Requêtes Paramétrées avec '?' Anti-Injection
Il est strictement interdit de concaténer des variables utilisateur dans les chaînes SQL :
```typescript
// ❌ INTERDIT (Vulnérabilité critique)
await db.execute(`SELECT * FROM clients WHERE phone = '${phone}';`);

// ✅ OBLIGATOIRE (Requête paramétrée sécurisée)
await db.execute('SELECT * FROM clients WHERE phone = ?;', [phoneStr]);
```

### Règle 3 : Le Helper `getRows()` pour Curseurs JSI `op-sqlite`
L'implémentation JSI C++ de `@op-engineering/op-sqlite` peut renvoyer les données sous forme de tableau natif (`result.rows`), de tableau enveloppé (`result.rows._array`), ou d'objet curseur avec méthodes SQLite classiques (`result.rows.item(i)` et `result.rows.length`).
Le helper `getRows()` garantit une extraction sûre et normalisée vers un tableau JavaScript :
```typescript
const getRows = (result: any): any[] => {
  if (!result || !result.rows) return [];
  if (Array.isArray(result.rows)) return result.rows;
  if (result.rows._array && Array.isArray(result.rows._array)) return result.rows._array;
  if (typeof result.rows.item === 'function' && typeof result.rows.length === 'number') {
    const arr = [];
    for (let i = 0; i < result.rows.length; i++) {
      arr.push(result.rows.item(i));
    }
    return arr;
  }
  return [];
};
```
> **Obligation** : Tout résultat de `await db.execute(...)` doit être passé à `getRows(result)` avant d'accéder aux colonnes.

### Règle 4 : Gestion Stricte du Flag `is_synced`
Le champ `is_synced` est le garant de la réplication serverless Google Sheets :
* **`0`** = **À synchroniser** (Nouvelle commande créée ou statut modifié en local, pas encore répliqué).
* **`1`** = **Synchronisé** (Google Sheets a validé l'écriture avec succès).
* **Principe de réactivation** : Dès qu'une commande est mise à jour (ex: passage de `'En cours'` à `'Prêt'` via `mettreAJourStatutCommande`), `is_synced` est remis à `0`.

---

## 3. Data Access Layer (`src/database/queries.ts`)

Toutes les requêtes SQL sont regroupées dans `queries.ts`. Les composants UI ne doivent **jamais** exécuter de requêtes SQL brutes.

### Répertoire des Fonctions Exportées :

| Fonction | Description & Comportement | Signature |
| :--- | :--- | :--- |
| `compterCommandes7DerniersJours` | Compte les commandes reçues sur les 7 derniers jours pour estimer la charge atelier. | `(): Promise<number>` |
| `enregistrerNouveauClientAvecCommande` | **Transaction atomique** : Crée/met à jour le client, calcule la date de livraison, insère la commande avec `is_synced = 0`. | `(name, phone, profile, garmentTypeId, mesures, notes, photoCommande?, catalogueId?): Promise<{ clientId: number; dateLivraison: string }>` |
| `recupererUrgencesSemaine` | Récupère jusqu'à 10 commandes non terminées (`status != 'Terminé'`) avec les détails client pour le Dashboard. | `(): Promise<CommandeDB[]>` |
| `recupererTousLesClients` | Liste alphabétique des clients avec désérialisation sécurisée du JSON `mesures_actuelles`. | `(): Promise<ClientDB[]>` |
| `recupererCommandesNonSynchro` | Extrait toutes les commandes en attente (`WHERE is_synced = 0`) avec nom et téléphone du client pour le service de synchro. | `(): Promise<any[]>` |
| `marquerCommandesCommeSynchro` | Passe `is_synced = 1` pour une liste d'IDs après validation Google Sheets HTTP 200. | `(ids: number[]): Promise<void>` |
| `recupererToutesLesCommandes` | Liste complète de toutes les commandes avec jointure client, triées par date de réception décroissante. | `(): Promise<CommandeDB[]>` |
| `mettreAJourStatutCommande` | Met à jour le statut d'une commande et **réinitialise systématiquement `is_synced = 0`**. | `(commandeId: number, nouveauStatut: string): Promise<void>` |

---

## 4. Interfaces TypeScript

```typescript
export interface ClientDB {
  id: number;
  name: string;
  phone: string;
  mesures_actuelles: Record<string, string> | string;
  created_at: string;
}

export interface CommandeDB {
  id: number;
  clientName: string;
  clientPhone: string;
  profile: string;
  garment_type_id: string;
  catalogue_modele_id: number | null;
  photo_commande: string | null;
  mesures_commande: string;
  notes: string | null;
  status: string;
  date_reception: string;
  date_livraison_estimee: string;
}
```

---

## 5. Index Recommandés pour la Performance Atelier

Pour fluidifier la navigation lorsque l'atelier dépasse plusieurs centaines de commandes :
```sql
CREATE INDEX IF NOT EXISTS idx_commandes_status ON commandes(status);
CREATE INDEX IF NOT EXISTS idx_commandes_is_synced ON commandes(is_synced);
CREATE INDEX IF NOT EXISTS idx_commandes_client_id ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
```
