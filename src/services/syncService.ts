import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { recupererCommandesNonSynchro, marquerCommandesCommeSynchro } from '../database/queries';

// Variable de cache globale pour éviter de chercher le fichier sur Drive à chaque synchronisation
let cachedSpreadsheetId: string | null = null;
let isSyncing = false; // Verrou pour éviter les exécutions simultanées

/**
 * Recherche si le fichier Google Sheets "SmartTailor_Commandes" existe déjà sur le Drive.
 * 
 * @param accessToken Jeton d'accès Google de l'utilisateur
 * @returns L'identifiant unique du classeur ou null
 */
async function trouverSpreadsheetId(accessToken: string): Promise<string | null> {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;

  try {
    const query = encodeURIComponent("name='SmartTailor_Commandes' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      cachedSpreadsheetId = data.files[0].id;
      return cachedSpreadsheetId;
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du fichier Sheets sur Google Drive :', error);
  }
  return null;
}

/**
 * Crée un nouveau classeur Google Sheets nommé "SmartTailor_Commandes" sur le Drive
 * et y ajoute la ligne d'en-tête par défaut.
 * 
 * @param accessToken Jeton d'accès Google de l'utilisateur
 * @returns L'identifiant du classeur créé
 */
async function creerSpreadsheet(accessToken: string): Promise<string> {
  try {
    // 1. Création du fichier vide sur Drive
    const fileResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'SmartTailor_Commandes',
        mimeType: 'application/vnd.google-apps.spreadsheet',
      }),
    });

    const fileData = await fileResponse.json();
    const newSpreadsheetId = fileData.id;

    if (!newSpreadsheetId) {
      throw new Error('Échec de la création du fichier Google Sheets.');
    }

    // 2. Initialisation de la ligne d'en-tête (ID, Client, Téléphone...)
    const headers = [
      ['ID Commande', 'Nom Client', 'Téléphone', 'Type Vêtement', 'Mesures (JSON)', 'Notes / Jargon', 'Statut', 'Date Réception', 'Date Livraison Estimée']
    ];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Sheet1!A1',
          majorDimension: 'ROWS',
          values: headers,
        }),
      }
    );

    console.log('=== NOUVEAU CLASSEUR GOOGLE SHEETS CRÉÉ AVEC SUCCÈS ===');
    cachedSpreadsheetId = newSpreadsheetId;
    return newSpreadsheetId;
  } catch (error) {
    console.error('Erreur lors de la création du classeur Google Sheets :', error);
    throw error;
  }
}

/**
 * Fonction principale de synchronisation.
 * Récupère les commandes non synchronisées en local et les envoie sur Google Sheets.
 */
export async function lancerSynchronisation(): Promise<void> {
  if (isSyncing) {
    console.log('Synchronisation déjà en cours... ignorance de la demande.');
    return;
  }

  isSyncing = true;
  try {
    // A. Obtenir le jeton d'accès Google valide (si l'utilisateur n'est pas connecté, cela lèvera une erreur)
    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens.accessToken;

    if (!accessToken) {
      throw new Error('Impossible de récupérer le jeton d’accès Google.');
    }

    // B. Récupérer les commandes locales non synchronisées (is_synced = 0)
    const commandesAEnvoyer = await recupererCommandesNonSynchro();
    if (commandesAEnvoyer.length === 0) {
      console.log('Synchronisation : Aucune nouvelle commande locale à envoyer.');
      return;
    }

    console.log(`=== DEBUT DE SYNCHRONISATION : ${commandesAEnvoyer.length} COMMANDES EN ATTENTE ===`);

    // C. Trouver ou créer le classeur Google Sheets
    let spreadsheetId = await trouverSpreadsheetId(accessToken);
    if (!spreadsheetId) {
      spreadsheetId = await creerSpreadsheet(accessToken);
    }

    // D. Préparer les données sous forme de lignes de tableau
    const lignes = commandesAEnvoyer.map((com) => [
      com.id.toString(),
      com.clientName,
      com.clientPhone,
      com.garment_type_id,
      com.mesures_commande, // Chaîne JSON des mesures
      com.notes || '',
      com.status,
      com.date_reception,
      com.date_livraison_estimee,
    ]);

    // E. Envoyer les lignes sur Google Sheets (Append)
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Sheet1!A1',
          majorDimension: 'ROWS',
          values: lignes,
        }),
      }
    );

    if (appendResponse.ok) {
      // F. Si Google confirme la réception, on marque les commandes comme synchronisées localement
      const idsSynchronises = commandesAEnvoyer.map((com) => com.id);
      await marquerCommandesCommeSynchro(idsSynchronises);
      console.log('=== SYNCHRONISATION CLOUD TERMINÉE AVEC SUCCÈS ===');
    } else {
      const errorData = await appendResponse.json();
      console.error('Échec de l’envoi des lignes sur Google Sheets :', errorData);
    }
  } catch (error) {
    console.error('Erreur lors du processus de synchronisation :', error);
  } finally {
    isSyncing = false;
  }
}