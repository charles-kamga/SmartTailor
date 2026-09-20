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
 * 2. Enregistrer un nouveau client et sa commande - ASYNC & SÉCURISÉ (Transaction SQL)
 */
export const enregistrerNouveauClientAvecCommande = async (
  name: string,
  phone: string,
  profile: string,
  garmentTypeId: string,
  mesures: Record<string, string>,
  notes: string,
  photoCommande: string | null = null,
  catalogueId: number | null = null
): Promise<{ clientId: number; dateLivraison: string }> => {
  const mesuresJSON = JSON.stringify(mesures);
  const phoneStr = String(phone).trim();

  try {
    // 1. Début de la transaction atomique
    await db.execute('BEGIN TRANSACTION;');

    // A. Insertion / Ignore Client
    await db.execute(
      'INSERT OR IGNORE INTO clients (name, phone, mesures_actuelles) VALUES (?, ?, ?);',
      [name, phoneStr, mesuresJSON]
    );

    // B. Récupération ID Client
    const selectClient = await db.execute(
      'SELECT id FROM clients WHERE CAST(phone AS TEXT) = CAST(? AS TEXT) LIMIT 1;',
      [phoneStr]
    );
    const clientRows = getRows(selectClient);
    if (clientRows.length === 0) {
      throw new Error("Impossible d'obtenir l'ID du client.");
    }
    const clientId = clientRows[0].id;

    // C. Mise à jour infos client
    await db.execute(
      'UPDATE clients SET name = ?, mesures_actuelles = ? WHERE id = ?;',
      [name, mesuresJSON, clientId]
    );

    // D. Calcul Date de Livraison
    const commandesRecentes = await compterCommandes7DerniersJours();
    const dateEstimee = estimerDateLivraison(garmentTypeId, commandesRecentes);
    const dateLivraisonFormatee = formaterDateLivraison(dateEstimee);

    // E. Insertion Commande
    await db.execute(
      `INSERT INTO commandes (
        client_id, profile, garment_type_id, catalogue_modele_id,
        photo_commande, mesures_commande, notes, date_livraison_estimee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [clientId, profile, garmentTypeId, catalogueId, photoCommande, mesuresJSON, notes, dateLivraisonFormatee]
    );

    // 2. Validation de la transaction
    await db.execute('COMMIT;');

    return { clientId, dateLivraison: dateLivraisonFormatee };
  } catch (error) {
    // 3. Rollback automatique en cas d'erreur
    await db.execute('ROLLBACK;').catch(() => {});
    console.error('Échec de la transaction SQL (Rollback exécuté) :', error);
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
 * 4. Récupérer l'ensemble des clients - ASYNC (Mesures pré-parsées)
 */
export const recupererTousLesClients = async (): Promise<ClientDB[]> => {
  try {
    const result = await db.execute('SELECT * FROM clients ORDER BY name ASC;');
    const rows = getRows(result);
    return rows.map((client) => {
      let parsedMesures = {};
      if (typeof client.mesures_actuelles === 'string') {
        try {
          parsedMesures = JSON.parse(client.mesures_actuelles);
        } catch {
          parsedMesures = {};
        }
      } else if (client.mesures_actuelles && typeof client.mesures_actuelles === 'object') {
        parsedMesures = client.mesures_actuelles;
      }
      return {
        ...client,
        mesures_actuelles: parsedMesures,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients :', error);
    return [];
  }
};

/**
 * 5. Récupérer les commandes non synchronisées pour le service de Sync
 */
export const recupererCommandesNonSynchro = async (): Promise<any[]> => {
  try {
    const query = `
      SELECT 
        com.id,
        cli.name as clientName,
        cli.phone as clientPhone,
        com.profile,
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

/**
 * 7. Récupérer toutes les commandes avec infos client
 */
export const recupererToutesLesCommandes = async (): Promise<CommandeDB[]> => {
  try {
    const query = `
      SELECT 
        com.id,
        cli.name AS clientName,
        cli.phone AS clientPhone,
        com.profile,
        com.garment_type_id,
        com.catalogue_modele_id,
        com.photo_commande,
        com.mesures_commande,
        com.notes,
        com.status,
        com.date_reception,
        com.date_livraison_estimee
      FROM commandes com
      JOIN clients cli ON com.client_id = cli.id
      ORDER BY com.date_reception DESC;
    `;
    const result = await db.execute(query);
    return getRows(result);
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les commandes :', error);
    return [];
  }
};

/**
 * 8. Mettre à jour le statut d'une commande (et reset is_synced pour forcer la synchro)
 */
export const mettreAJourStatutCommande = async (commandeId: number, nouveauStatut: string): Promise<void> => {
  try {
    await db.execute(
      'UPDATE commandes SET status = ?, is_synced = 0 WHERE id = ?;',
      [nouveauStatut, commandeId]
    );
    console.log(`=== COMMANDE ${commandeId} : STATUT MIS À JOUR VERS "${nouveauStatut}" (is_synced=0) ===`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la commande :', error);
    throw error;
  }
};