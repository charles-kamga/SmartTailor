export interface Measurement {
  key: string;
  label: string;
}

export interface GarmentTemplate {
  id: string;
  name: string;
  measurements: Measurement[];
  annotations: string[];
  illustrationUrl: string;
  description: string;
}

export const GARMENT_TEMPLATES: GarmentTemplate[] = [
  {
    id: 'senator',
    name: 'Sénateur',
    measurements: [
      { key: 'TC', label: 'Tour de Cou (TC)' },
      { key: 'EP', label: 'Épaules / Carrure (EP)' },
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin / Hanches (TB)' },
      { key: 'LH', label: 'Longueur du Haut / Tunique (LH)' },
      { key: 'LM', label: 'Longueur de Manche (LM)' },
      { key: 'TBr', label: 'Tour de Bras / Biceps (TBr)' },
      { key: 'TPoi', label: 'Tour de Poignet (TPoi)' },
      { key: 'LP', label: 'Longueur Pantalon (LP)' },
      { key: 'MT', label: 'Montant Entrejambe (MT)' },
      { key: 'TCu', label: 'Tour de Cuisse (TCu)' },
      { key: 'TG', label: 'Tour de Genou (TG)' },
      { key: 'TCh', label: 'Tour de Cheville (TCh)' }
    ],
    annotations: ['Col officier rigide', 'Broderie poitrine', 'Poches cachées', 'Boutons cachés', 'Fente latérale', 'Coupe slim', 'Gilet brodé'],
    illustrationUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    description: 'Ensemble tunique brodé et pantalon ajusté. Coupe moderne inspirée du style nigérian.'
  },
  {
    id: 'kaba',
    name: 'Kaba Ngondo',
    measurements: [
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'EcP', label: 'Écart Poitrine (EcP)' },
      { key: 'HP', label: 'Hauteur de Poitrine (HP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'CD', label: 'Carrure Dos (CD)' },
      { key: 'LC', label: 'Longueur Corsage / Buste (LC)' },
      { key: 'LM', label: 'Longueur de Manche (LM)' },
      { key: 'TBr', label: 'Tour de Bras (TBr)' },
      { key: 'LT', label: 'Longueur Totale (LT)' },
      { key: 'LJ', label: 'Longueur Jupe (LJ)' }
    ],
    annotations: ['Queue / Traîne', 'Col bateau', 'Manches bouffantes', 'Fronces à la taille', 'Doublure complète', 'Empiècement brodé', 'Dentelle col'],
    illustrationUrl: 'https://images.unsplash.com/photo-1528570188006-440a558509b5?auto=format&fit=crop&w=400&q=80',
    description: 'Robe traditionnelle froncée emblématique du Littoral camerounais. Ample et élégante.'
  },
  {
    id: 'boubou',
    name: 'Grand Boubou',
    measurements: [
      { key: 'TC', label: 'Tour de Cou (TC)' },
      { key: 'EP', label: 'Épaules (EP)' },
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'LB', label: 'Longueur Boubou (LB)' },
      { key: 'LgB', label: 'Largeur / Envergure (LgB)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'LP', label: 'Longueur Pantalon (LP)' },
      { key: 'TCh', label: 'Tour de Cheville (TCh)' }
    ],
    annotations: ['Broderie riche bazin', 'Col en V brodé', 'Poches latérales', 'Manches très amples', 'Fente latérale', 'Cordon laçage', 'Glaçage bazin'],
    illustrationUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=400&q=80',
    description: 'Boubou traditionnel d’apparat 3 pièces en tissu Bazin damassé richement brodé.'
  },
  {
    id: 'agbada',
    name: 'Agbada / Gandoura',
    measurements: [
      { key: 'EP', label: 'Épaules (EP)' },
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'LA', label: 'Longueur Agbada (LA)' },
      { key: 'LgM', label: 'Largeur Manches-ailes (LgM)' },
      { key: 'LBu', label: 'Longueur Buba (LBu)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'LP', label: 'Longueur Pantalon (LP)' },
      { key: 'TCh', label: 'Tour de Cheville (TCh)' },
      { key: 'TC', label: 'Tour de Cou (TC)' }
    ],
    annotations: ['Manches ailes', 'Broderie cravate', 'Poche poitrine brodée', 'Coupe royale', 'Bordure brodée', 'Fente latérale'],
    illustrationUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    description: 'Grand vêtement d’apparat yoruba à manches amples ailes drapées.'
  },
  {
    id: 'caftan',
    name: 'Caftan',
    measurements: [
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'EP', label: 'Épaules (EP)' },
      { key: 'HP', label: 'Hauteur de Poitrine (HP)' },
      { key: 'LT', label: 'Longueur Caftan (LT)' },
      { key: 'LM', label: 'Longueur de Manche (LM)' },
      { key: 'TBr', label: 'Tour de Bras (TBr)' },
      { key: 'TC', label: 'Tour de Cou (TC)' }
    ],
    annotations: ['Galon sfifa', 'Boutons tunisiens', 'Coupe évasée', 'Manches cloche', 'Fente latérale', 'Ceinture tissée'],
    illustrationUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
    description: 'Robe longue et évasée d’inspiration nord-africaine à boutons tunisiens et galon sfifa.'
  },
  {
    id: 'suit',
    name: 'Costume classique',
    measurements: [
      { key: 'TC', label: 'Tour de Cou (TC)' },
      { key: 'EP', label: 'Épaules (EP)' },
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'LV', label: 'Longueur Veste (LV)' },
      { key: 'LM', label: 'Longueur de Manche (LM)' },
      { key: 'LP', label: 'Longueur Pantalon (LP)' },
      { key: 'MT', label: 'Montant Entrejambe (MT)' },
      { key: 'TCu', label: 'Tour de Cuisse (TCu)' },
      { key: 'TG', label: 'Tour de Genou (TG)' },
      { key: 'TCh', label: 'Tour de Cheville (TCh)' }
    ],
    annotations: ['Revers cranté', 'Revers châle', 'Boutonnage croisé', 'Poches rabat', 'Fente double dos', 'Gilet 3 pièces', 'Revers bas'],
    illustrationUrl: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=400&q=80',
    description: 'Costume classique occidental 2 ou 3 pièces, ajusté sur-mesure de style tailleur.'
  },
  {
    id: 'shirt',
    name: 'Chemise',
    measurements: [
      { key: 'TC', label: 'Tour de Cou (TC)' },
      { key: 'EP', label: 'Épaules (EP)' },
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'LCh', label: 'Longueur Chemise (LCh)' },
      { key: 'LM', label: 'Longueur de Manche (LM)' },
      { key: 'TPoi', label: 'Tour de Poignet (TPoi)' }
    ],
    annotations: ['Col italien', 'Col mao', 'Poignet mousquetaire', 'Patte cachée', 'Coupe slim', 'Plastron devant'],
    illustrationUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    description: 'Chemise classique ajustée à col et poignets montés sur-mesure.'
  },
  {
    id: 'trousers',
    name: 'Pantalon',
    measurements: [
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'LP', label: 'Longueur Pantalon (LP)' },
      { key: 'MT', label: 'Montant Entrejambe (MT)' },
      { key: 'LE', label: 'Longueur Entrejambe (LE)' },
      { key: 'TCu', label: 'Tour de Cuisse (TCu)' },
      { key: 'TG', label: 'Tour de Genou (TG)' },
      { key: 'TCh', label: 'Tour de Cheville (TCh)' }
    ],
    annotations: ['Pince simple', 'Pince double', 'Revers bas', 'Poches italiennes', 'Poches passepoilées', 'Braguette zip'],
    illustrationUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
    description: 'Pantalon classique de ville à pinces, hauteur de montant ajustée.'
  },
  {
    id: 'mermaid_dress',
    name: 'Robe Sirène / Fête',
    measurements: [
      { key: 'TP', label: 'Tour de Poitrine (TP)' },
      { key: 'EcP', label: 'Écart Poitrine (EcP)' },
      { key: 'HP', label: 'Hauteur de Poitrine (HP)' },
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'LTG', label: 'Longueur Taille-Genou (LTG)' },
      { key: 'TG', label: 'Tour de Genou (TG)' },
      { key: 'LT', label: 'Longueur Totale (LT)' }
    ],
    annotations: ['Bustier baleiné', 'Volant sirène', 'Dos nu drapé', 'Décolleté cœur', 'Traîne courte', 'Fermeture invisible'],
    illustrationUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
    description: 'Robe de soirée sirène cintrée au bustier baleiné et évasement bas fluide.'
  },
  {
    id: 'skirt',
    name: 'Jupe droite / Crayon',
    measurements: [
      { key: 'TT', label: 'Tour de Taille (TT)' },
      { key: 'TB', label: 'Tour de Bassin (TB)' },
      { key: 'HH', label: 'Hauteur de Hanches (HH)' },
      { key: 'LJ', label: 'Longueur Jupe (LJ)' },
      { key: 'TG', label: 'Tour de Genou (TG)' },
      { key: 'LF', label: 'Longueur de Fente (LF)' }
    ],
    annotations: ['Coupe crayon', 'Pinces de taille', 'Fermeture invisible', 'Fente arrière', 'Taille haute', 'Doublure complète'],
    illustrationUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff48b?auto=format&fit=crop&w=400&q=80',
    description: 'Jupe crayon droite classique ajustée à pinces de taille et fente arrière.'
  }
];
