import {
  estimerDateLivraison,
  formaterDateLivraison,
} from '../src/services/deliveryAlgorithm';

describe('Algorithme de livraison — deliveryAlgorithm', () => {
  beforeEach(() => {
    // Figer la date pour des tests déterministes : Mardi 15 Septembre 2026
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 15, 10, 0, 0)); // 2026-09-15 est un mardi
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Calcul des délais avec charge faible (<= 2 commandes)', () => {
    it('calcule correctement pour une chemise (3j base + 2j sécurité = 5 jours ouvrés)', () => {
      // Mardi 15 Septembre + 5 jours ouvrés (Mer 16, Jeu 17, Ven 18, Sam 19, Lun 21 - Dim 20 sauté)
      const dateLivraison = estimerDateLivraison('shirt', 1);
      expect(dateLivraison.getDate()).toBe(21);
      expect(dateLivraison.getMonth()).toBe(8); // Septembre (0-indexed)
      expect(formaterDateLivraison(dateLivraison)).toBe('21 Sept');
    });

    it('calcule correctement pour un costume (8j base + 2j sécurité = 10 jours ouvrés)', () => {
      // Mardi 15 Septembre + 10 jours ouvrés
      // Jours : Mer 16 (1), Jeu 17 (2), Ven 18 (3), Sam 19 (4), Dimanche sauté,
      // Lun 21 (5), Mar 22 (6), Mer 23 (7), Jeu 24 (8), Ven 25 (9), Sam 26 (10)
      const dateLivraison = estimerDateLivraison('suit', 2);
      expect(dateLivraison.getDate()).toBe(26);
      expect(formaterDateLivraison(dateLivraison)).toBe('26 Sept');
    });

    it('applique le délai par défaut de 2 jours pour un modèle inconnu', () => {
      // 2j base + 2j sécurité = 4 jours ouvrés
      // Mer 16 (1), Jeu 17 (2), Ven 18 (3), Sam 19 (4)
      const dateLivraison = estimerDateLivraison('modele_inconnu', 0);
      expect(dateLivraison.getDate()).toBe(19);
      expect(formaterDateLivraison(dateLivraison)).toBe('19 Sept');
    });
  });

  describe("Impact de la charge de l'atelier sur les délais", () => {
    it('ajoute 3 jours de délai d attente si entre 3 et 5 commandes en cours', () => {
      // Pour une chemise (3j + 3j attente + 2j marge = 8 jours ouvrés)
      // Mer 16 (1), Jeu 17 (2), Ven 18 (3), Sam 19 (4), Dim 20 sauté,
      // Lun 21 (5), Mar 22 (6), Mer 23 (7), Jeu 24 (8)
      const dateLivraison = estimerDateLivraison('shirt', 4);
      expect(dateLivraison.getDate()).toBe(24);
      expect(formaterDateLivraison(dateLivraison)).toBe('24 Sept');
    });

    it('ajoute 5 jours de délai d attente si entre 6 et 9 commandes en cours', () => {
      // Pour une chemise (3j + 5j attente + 2j marge = 10 jours ouvrés)
      // Résultat : Samedi 26 Septembre
      const dateLivraison = estimerDateLivraison('shirt', 7);
      expect(dateLivraison.getDate()).toBe(26);
      expect(formaterDateLivraison(dateLivraison)).toBe('26 Sept');
    });

    it('ajoute 8 jours de délai d attente si plus de 9 commandes en cours', () => {
      // Pour une chemise (3j + 8j attente + 2j marge = 13 jours ouvrés)
      // Mer 16 (1) -> Sam 19 (4), Dim 20 sauté,
      // Lun 21 (5) -> Sam 26 (10), Dim 27 sauté,
      // Lun 28 (11), Mar 29 (12), Mer 30 (13)
      const dateLivraison = estimerDateLivraison('shirt', 12);
      expect(dateLivraison.getDate()).toBe(30);
      expect(formaterDateLivraison(dateLivraison)).toBe('30 Sept');
    });
  });

  describe('Exclusion absolue des dimanches', () => {
    it('ne livre jamais un dimanche', () => {
      const modeles = ['senator', 'kaba', 'boubou', 'agbada', 'caftan', 'suit', 'shirt', 'trousers', 'mermaid_dress', 'skirt'];
      for (const modele of modeles) {
        for (let charge = 0; charge <= 15; charge += 3) {
          const dateLivraison = estimerDateLivraison(modele, charge);
          expect(dateLivraison.getDay()).not.toBe(0); // 0 = Dimanche
        }
      }
    });
  });

  describe('Formatage de la date de livraison', () => {
    it('formate correctement les dates avec l abréviation du mois en français', () => {
      expect(formaterDateLivraison(new Date(2026, 0, 5))).toBe('5 Jan');
      expect(formaterDateLivraison(new Date(2026, 4, 12))).toBe('12 Mai');
      expect(formaterDateLivraison(new Date(2026, 9, 15))).toBe('15 Oct');
      expect(formaterDateLivraison(new Date(2026, 11, 25))).toBe('25 Déc');
    });
  });
});
