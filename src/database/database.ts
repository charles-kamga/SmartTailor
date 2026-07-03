import { open } from '@op-engineering/op-sqlite';

// 1. Ouvrir ou créer la base de données locale
export const db = open({
  name: 'smart_tailor.db',
});

/**
 * Initialise le schéma de la base de données en créant les tables nécessaires.
 */
export const initDatabase = () => {
  try {
    db.execute('PRAGMA foreign_keys = ON;');

    // Table 1 : Les Clients
    db.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        mesures_actuelles TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table 2 : Le Catalogue de Modèles de Style
    db.execute(`
      CREATE TABLE IF NOT EXISTS catalogue_modeles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        garment_type_id TEXT NOT NULL,
        title TEXT NOT NULL,
        image_path TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Table 3 : Les Commandes
    db.execute(`
      CREATE TABLE IF NOT EXISTS commandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        garment_type_id TEXT NOT NULL,
        catalogue_modele_id INTEGER,
        photo_commande TEXT,
        mesures_commande TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'En attente',
        date_reception DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_livraison_estimee TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
        FOREIGN KEY (catalogue_modele_id) REFERENCES catalogue_modeles (id) ON DELETE SET NULL
      );
    `);

    console.log('=== BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS ===');
  } catch (error) {
    console.error('Erreur lors de l’initialisation de la base de données :', error);
  }
};