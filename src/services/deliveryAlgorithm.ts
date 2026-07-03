// Dictionnaire des temps de confection de base par vêtement (en jours travaillés)
const TEMPS_CONFECTION_BASE: Record<string, number> = {
  senator: 5,        // Sénateur : 5 jours
  kaba: 4,           // Kaba : 4 jours
  boubou: 5,         // Grand Boubou : 5 jours
  agbada: 4,         // Agbada : 4 jours
  caftan: 4,         // Caftan : 4 jours
  suit: 8,           // Costume classique : 8 jours
  shirt: 3,          // Chemise : 3 jours
  trousers: 3,       // Pantalon classique : 3 jours
  mermaid_dress: 6,  // Robe Sirène : 6 jours
  skirt: 3,          // Jupe droite : 3 jours
};

/**
 * Calcule le délai d'attente supplémentaire (en jours) basé sur la charge de travail
 * des 7 derniers jours dans l'atelier.
 * 
 * @param ordersCount Nombre total de commandes enregistrées ces 7 derniers jours
 */
function calculerDelaiAttente(ordersCount: number): number {
  if (ordersCount > 2 && ordersCount <= 5) {
    return 3; // Entre 3 et 5 commandes en cours : +3 jours d'attente
  } else if (ordersCount > 5 && ordersCount <= 9) {
    return 5; // Entre 6 et 9 commandes en cours : +5 jours d'attente
  } else if (ordersCount > 9) {
    return 8; // 10 commandes ou plus : +8 jours d'attente
  }
  return 0; // 2 commandes ou moins : pas d'attente
}

/**
 * Calcule une date de livraison en ajoutant un nombre de jours de travail,
 * en sautant systématiquement les dimanches.
 * 
 * @param dateDepart Date de début (généralement aujourd'hui)
 * @param joursTravailles Nombre de jours de travail à ajouter
 */
function ajouterJoursOuvres(dateDepart: Date, joursTravailles: number): Date {
  const dateResultat = new Date(dateDepart);
  let joursAjoutes = 0;

  while (joursAjoutes < joursTravailles) {
    dateResultat.setDate(dateResultat.getDate() + 1);
    
    // En JavaScript, 0 correspond au Dimanche (getDay())
    if (dateResultat.getDay() !== 0) {
      joursAjoutes++;
    }
  }

  return dateResultat;
}

/**
 * Fonction principale de l'algorithme d'estimation de la date de livraison.
 * 
 * @param modelId Identifiant du modèle choisi (ex: 'senator', 'kaba')
 * @param commandes7DerniersJours Nombre total de commandes enregistrées ces 7 derniers jours
 * @returns La date de livraison estimée
 */
export function estimerDateLivraison(
  modelId: string,
  commandes7DerniersJours: number
): Date {
  const aujourdhui = new Date();

  // 1. Récupérer le temps de confection de base pour ce vêtement (défaut : 2 jours)
  const tempsBase = TEMPS_CONFECTION_BASE[modelId] || 2;

  // 2. Calculer le délai d'attente lié à l'encombrement de l'atelier
  const delaiAttente = calculerDelaiAttente(commandes7DerniersJours);

  // 3. Calculer le nombre total de jours ouvrés nécessaires + marge de sécurité
  const MARGE_SECURITE = 2;
  const totalJoursNecessaires = tempsBase + delaiAttente + MARGE_SECURITE;

  // 4. Calculer la date finale réelle en sautant les dimanches
  return ajouterJoursOuvres(aujourdhui, totalJoursNecessaires);
}

// Fonction utilitaire pour formater joliment la date pour l'affichage (ex: "15 Oct")
export function formaterDateLivraison(date: Date): string {
  const moisSelectionnes = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
  ];
  const jour = date.getDate();
  const mois = moisSelectionnes[date.getMonth()];
  return `${jour} ${mois}`;
}