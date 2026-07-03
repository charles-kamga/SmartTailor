import { db } from './database';
import { estimerDateLivraison, formaterDateLivraison } from '../services/deliveryAlgorithm';

// Helper de conversion des lignes (traite le résultat une fois la promesse résolue)
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

export interface ClientDB {
  id: number;
  name: string;
  phone: string;
  mesures_actuelles: string;
  created_at: string;
}

export interface CommandeDB {
  id: number;
  clientName: string;
  garment_type_id: string;
  photo_commande: string | null;
  mesures_commande: string;
  notes: string | null;
  status: string;
  date_reception: string;
  date_livraison_estimee: string;
}

/**
 * 1. Compter les commandes récentes (7 derniers jours) - ASYNC
 */
export const compterCommandes7DerniersJours = async (): Promise<number> => {
  try {
    const result = await db.execute(`
      SELECT COUNT(*) as total 
      FROM commandes 
      WHERE created_at >= datetime('now', '-7 days');
    `);
    const rows = getRows(result);
    return rows.length > 0 ? (rows[0].total ?? 0) : 0;
  } catch (error) {
    console.error('Erreur lors du comptage des commandes récentes :', error);
    return 0;
  }
};

/**
 * 2. Enregistrer un nouveau client et sa commande - ASYNC & SÉCURISÉ
 */
export const enregistrerNouveauClientAvecCommande = async (
  name: string,
  phone: string,
  garmentTypeId: string,
  mesures: Record<string, string>,
  notes: string,
  photoCommande: string | null = null,
  catalogueId: number | null = null
): Promise<{ clientId: number; dateLivraison: string }> => {
  try {
    const mesuresJSON = JSON.stringify(mesures);
    const phoneStr = String(phone).trim();
    let clientId: number;

    // A. Tenter d'insérer le client. S'il existe déjà, SQLite l'ignore silencieusement.
    await db.execute(
      'INSERT OR IGNORE INTO clients (name, phone, mesures_actuelles) VALUES (?, ?, ?);',
      [name, phoneStr, mesuresJSON]
    );

    // B. Récupérer l'ID du client de manière garantie (qu'il vienne d'être créé ou existait déjà)
    const selectClient = await db.execute(
      'SELECT id FROM clients WHERE CAST(phone AS TEXT) = CAST(? AS TEXT) LIMIT 1;',
      [phoneStr]
    );
    const clientRows = getRows(selectClient);

    if (clientRows.length === 0) {
      throw new Error("Impossible d'obtenir l'ID du client après insertion.");
    }

    const clientIdFromDb = clientRows[0].id;
    clientId = clientIdFromDb;

    // C. Mettre à jour systématiquement les infos du client (garde le nom et les mesures à jour)
    await db.execute(
      'UPDATE clients SET name = ?, mesures_actuelles = ? WHERE id = ?;',
      [name, mesuresJSON, clientId]
    );

    // D. Appliquer l'algorithme d'estimation de date de livraison
    const commandesRecentes = await compterCommandes7DerniersJours();
    const dateEstimee = estimerDateLivraison(garmentTypeId, commandesRecentes);
    const dateLivraisonFormatee = formaterDateLivraison(dateEstimee);

    // E. Enregistrer la commande associée (clientId est garanti d'être non nul et valide)
    await db.execute(
      `INSERT INTO commandes (
        client_id,
        garment_type_id,
        catalogue_modele_id,
        photo_commande,
        mesures_commande,
        notes,
        date_livraison_estimee
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        clientId,
        garmentTypeId,
        catalogueId,
        photoCommande,
        mesuresJSON,
        notes,
        dateLivraisonFormatee,
      ]
    );

    return { clientId, dateLivraison: dateLivraisonFormatee };
  } catch (error) {
    console.error('Erreur lors de l’enregistrement de la commande :', error);
    throw error;
  }
};

/**
 * 3. Récupérer les commandes urgentes en cours pour le Dashboard - ASYNC
 */
export const recupererUrgencesSemaine = async (): Promise<CommandeDB[]> => {
  try {
    const query = `
      SELECT 
        com.id,
        cli.name AS clientName,
        com.garment_type_id AS garment_type_id,
        com.photo_commande AS fabricImageUri,
        com.mesures_commande AS mesures_commande,
        com.notes AS notes,
        com.status AS status,
        com.date_reception AS receivedDate,
        com.date_livraison_estimee AS dueDateLabel
      FROM commandes com
      JOIN clients cli ON com.client_id = cli.id
      WHERE com.status != 'Terminé'
      ORDER BY com.id ASC
      LIMIT 10;
    `;
    const result = await db.execute(query);
    const rows = getRows(result);
    
    console.log('=== DIAGNOSTIC 1: RAW SQL ROWS ===', JSON.stringify(rows, null, 2));
    return rows;
  } catch (error: any) {
    console.error('=== DIAGNOSTIC 2: SQL ERROR ===', error.message, error.stack);
    return [];
  }
};

/**
 * 4. Récupérer l'ensemble des clients - ASYNC
 */
export const recupererTousLesClients = async (): Promise<ClientDB[]> => {
  try {
    const result = await db.execute('SELECT * FROM clients ORDER BY name ASC;');
    return getRows(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients :', error);
    return [];
  }
};

/**
 * 5. Récupérer tous les modèles du catalogue
 */
export const recupererTousModelesCatalogue = async (): Promise<any[]> => {
  try {
    const result = await db.execute(`
      SELECT * FROM catalogue_modeles ORDER BY created_at DESC;
    `);
    return getRows(result);
  } catch (error) {
    console.error('Erreur lors de la récupération du catalogue :', error);
    return [];
  }
};

/**
 * 6. Récupérer les modèles du catalogue filtrés par type de vêtement
 */
export const recupererModelesCatalogueParType = async (garmentTypeId: string): Promise<any[]> => {
  try {
    const result = await db.execute(
      `SELECT * FROM catalogue_modeles WHERE garment_type_id = ? ORDER BY created_at DESC;`,
      [garmentTypeId]
    );
    return getRows(result);
  } catch (error) {
    console.error('Erreur lors du filtrage du catalogue :', error);
    return [];
  }
};

/**
 * 7. Insérer un nouveau modèle dans le catalogue
 */
export const insererModeleCatalogue = async (
  garmentTypeId: string,
  title: string,
  imagePath: string
): Promise<number | null> => {
  try {
    const result = await db.execute(
      `INSERT INTO catalogue_modeles (garment_type_id, title, image_path) VALUES (?, ?, ?);`,
      [garmentTypeId, title, imagePath]
    );
    return result.insertId ?? null;
  } catch (error) {
    console.error("Erreur lors de l'insertion du modèle au catalogue :", error);
    return null;
  }
};

/**
 * 8. Récupérer les commandes non synchronisées pour le service de Sync
 */
export const recupererCommandesNonSynchro = async (): Promise<any[]> => {
  try {
    const query = `
      SELECT 
        com.id,
        cli.name as clientName,
        cli.phone as clientPhone,
        com.garment_type_id,
        com.mesures_commande,
        com.notes,
        com.status,
        com.date_reception,
        com.date_livraison_estimee
      FROM commandes com
      JOIN clients cli ON com.client_id = cli.id
      WHERE com.is_synced = 0;
    `;
    const result = await db.execute(query);
    return getRows(result);
  } catch (error) {
    console.error('Erreur lors du chargement des commandes non synchronisées :', error);
    return [];
  }
};

/**
 * 6. Marquer des commandes comme synchronisées
 */
export const marquerCommandesCommeSynchro = async (ids: number[]): Promise<void> => {
  try {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await db.execute(
      `UPDATE commandes SET is_synced = 1 WHERE id IN (${placeholders});`,
      ids
    );
    console.log(`=== ${ids.length} COMMANDES MARQUÉES COMME SYNCHRONISÉES ===`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de synchro :', error);
  }
};