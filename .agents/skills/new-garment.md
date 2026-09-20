# Compétence / Workflow : Ajouter un Modèle de Vêtement — `new-garment` 👘✂️

Ce workflow décrit la procédure exacte pour intégrer un nouveau modèle de tenue traditionnelle ou moderne dans le catalogue de **SmartTailor**, de sa modélisation TypeScript jusqu'à la persistance SQLite et la synchronisation cloud.

---

## 1. Définition du Modèle dans `src/database/garmentTemplates.ts`

Le modèle doit respecter scrupuleusement les interfaces déclarées dans `garmentTemplates.ts` :

```typescript
export type ProfileType = 'homme' | 'femme' | 'enfant_garcon' | 'enfant_fille';

export interface Measurement {
  key: string;   // Code court de la mesure (ex: 'TC', 'EP', 'TP')
  label: string; // Libellé atelier complet (ex: 'Tour de Cou (TC)')
}

export interface GarmentTemplate {
  id: string;                  // Identifiant unique normalisé (ex: 'gandoura')
  name: string;                // Nom commercial affiché (ex: 'Gandoura Brodée')
  profiles: ProfileType[];     // Profils anatomiques compatibles
  measurements: Measurement[]; // Liste ordonnée des mesures nécessaires
  annotations: string[];       // Options de coupe ou finitions d'atelier
  illustrationUrl: string;     // Image d'illustration haute qualité
  description: string;         // Brève description du style et du vêtement
}
```

### Exemple Conforme à Ajouter dans `GARMENT_TEMPLATES` :
```typescript
{
  id: 'gandoura',
  name: 'Gandoura Brodée',
  profiles: ['homme', 'enfant_garcon'],
  measurements: [
    { key: 'TC', label: 'Tour de Cou (TC)' },
    { key: 'EP', label: 'Épaules / Carrure (EP)' },
    { key: 'TP', label: 'Tour de Poitrine (TP)' },
    { key: 'TT', label: 'Tour de Taille (TT)' },
    { key: 'LH', label: 'Longueur du Haut (LH)' },
    { key: 'LM', label: 'Longueur de Manche (LM)' }
  ],
  annotations: ['Col V brodé main', 'Plastron brodé', 'Poche plaquée côté droit', 'Fente latérale'],
  illustrationUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
  description: 'Tunique ample traditionnelle avec broderies raffinées au col et plastron.'
},
```

---

## 2. Déclaration du Délai dans `src/services/deliveryAlgorithm.ts`

Pour que l'estimation automatique de la date de livraison fonctionne, ajouter l'identifiant du modèle dans la table des temps de confection de base :

```typescript
const TEMPS_CONFECTION_BASE: Record<string, number> = {
  senator: 5,
  kaba: 4,
  boubou: 5,
  agbada: 4,
  caftan: 4,
  suit: 8,
  shirt: 3,
  trousers: 3,
  mermaid_dress: 6,
  skirt: 3,
  gandoura: 4, // ◄ Temps de travail de base (en jours ouvrés)
};
```

### Comment l'Algorithme Traite ce Délai :
1. Récupère le temps de base (ici 4 jours).
2. Interroge SQLite via `compterCommandes7DerniersJours()` pour évaluer l'encombrement de l'atelier (`calculerDelaiAttente` : +3j, +5j, ou +8j).
3. Ajoute une marge de sécurité de 2 jours.
4. Calcule la date calendaire finale en sautant systématiquement tous les dimanches (`ajouterJoursOuvres`).

---

## 3. Impact BDD SQLite & Synchronisation Google Sheets

* **Champ `garment_type_id`** : L'ID défini (ex: `'gandoura'`) sera stocké tel quel dans la colonne `garment_type_id` de la table `commandes`.
* **Mensurations** : L'écran de commande saisira les clés définies dans `measurements` et les enregistrera sous forme de JSON sérialisé (`Record<string, string>`) dans `mesures_commande`.
* **Google Sheets** : Lors de la synchronisation par `syncService.ts`, le vêtement sera consigné avec son identifiant dans la colonne *Type Vêtement* et les mesures complètes dans la colonne *Mesures (JSON)*.

---

## 4. Vérification & Validation

1. **Contrôle TypeScript** (Tolérance zéro régression) :
   ```bash
   npx tsc --noEmit
   ```
2. **Contrôle Visuel & Ergonomique** :
   - Ouvrir l'écran de nouvelle commande (`StepTypeVetement.tsx`).
   - Vérifier que le modèle apparaît lorsque le profil `'homme'` est sélectionné.
   - Sélectionner le modèle et vérifier que l'écran de saisie des mesures (`StepMesures.tsx`) liste bien l'ensemble des champs anatomiques configurés.
3. **Commit Conventionnel** :
   ```bash
   git commit -m "Ajout : Modèle Gandoura Brodée dans le catalogue et calcul de livraison"
   ```
