# Référentiel des Modèles de Vêtements & Mensurations — SmartTailor 👘

Ce document référence les 10 modèles de confection pris en charge dans `src/database/garmentTemplates.ts`, leurs profils anatomiques et les temps de confection de base déclarés dans `src/services/deliveryAlgorithm.ts`.

---

## 1. Table des Modèles du Catalogue

| ID Modèle (`garment_type_id`) | Nom Commercial | Profils Cibles (`profiles`) | Temps de Base | Codes des Mesures Requises |
| :--- | :--- | :--- | :--- | :--- |
| `senator` | Sénateur | `homme`, `enfant_garcon` | 5 jours | TC, EP, TP, TT, TB, LH, LM, TBr, TPoi, LP, MT, TCu, TG, TCh |
| `kaba` | Kaba Ngondo | `femme`, `enfant_fille` | 4 jours | TP, EcP, HP, TT, TB, CD, LC, LM, TBr, LT, LJ |
| `boubou` | Grand Boubou | `homme`, `femme`, `enfant_garcon`, `enfant_fille` | 5 jours | TC, EP, TP, LB, LgB, TT, TB, LP, TCh |
| `agbada` | Agbada / Gandoura | `homme`, `enfant_garcon` | 4 jours | EP, TP, LA, LgM, LBu, TT, TB, LP, TCh, TC |
| `caftan` | Caftan | `femme`, `homme`, `enfant_fille` | 4 jours | TP, TT, TB, EP, HP, LT, LM, TBr, TC |
| `suit` | Costume classique | `homme`, `femme`, `enfant_garcon` | 8 jours | TC, EP, TP, TT, TB, LV, LM, LP, MT, TCu, TG, TCh |
| `shirt` | Chemise | `homme`, `femme`, `enfant_garcon`, `enfant_fille` | 3 jours | TC, EP, TP, TT, LCh, LM, TPoi |
| `trousers` | Pantalon | `homme`, `femme`, `enfant_garcon`, `enfant_fille` | 3 jours | TT, TB, LP, MT, LE, TCu, TG, TCh |
| `mermaid_dress` | Robe Sirène / Fête | `femme`, `enfant_fille` | 6 jours | TP, EcP, HP, TT, TB, LTG, TG, LT |
| `skirt` | Jupe droite / Crayon | `femme`, `enfant_fille` | 3 jours | TT, TB, HH, LJ, TG, LF |

---

## 2. Dictionnaire des Abréviations de Mensurations Anatomiques

Les mesures sont saisies et stockées en centimètres (cm).

### Buste, Torse & Cou :
* `TC` : Tour de Cou
* `EP` : Épaules / Carrure
* `TP` : Tour de Poitrine
* `EcP` : Écart Poitrine
* `HP` : Hauteur de Poitrine
* `TT` : Tour de Taille
* `TB` : Tour de Bassin / Hanches
* `CD` : Carrure Dos
* `LC` : Longueur Corsage / Buste

### Bras & Manches :
* `LH` : Longueur du Haut / Tunique
* `LM` : Longueur de Manche
* `TBr` : Tour de Bras / Biceps
* `TPoi` : Tour de Poignet

### Bas du Corps & Jambes :
* `LP` : Longueur Pantalon
* `MT` : Montant Entrejambe / Enfourchure
* `LE` : Longueur Entrejambe
* `TCu` : Tour de Cuisse
* `TG` : Tour de Genou
* `TCh` : Tour de Cheville
* `LJ` : Longueur Jupe
* `LT` : Longueur Totale
* `HH` : Hauteur de Hanches
* `LTG` : Longueur Taille-Genou
* `LF` : Longueur de Fente

### Éléments Traditionnels & Vestes :
* `LB` : Longueur Boubou
* `LgB` : Largeur / Envergure Boubou
* `LA` : Longueur Agbada
* `LgM` : Largeur Manches-ailes
* `LBu` : Longueur Buba
* `LV` : Longueur Veste
* `LCh` : Longueur Chemise

---

## 3. Typage des Profils (`ProfileType`)

Dans `garmentTemplates.ts`, les profils sont strictement typés :
```typescript
export type ProfileType = 'homme' | 'femme' | 'enfant_garcon' | 'enfant_fille';
```

> [!WARNING]
> **Sensibilité à la casse** : Utiliser exclusivement les minuscules (`'homme'`, `'femme'`, `'enfant_garcon'`, `'enfant_fille'`). Toute majuscule ou variation orthographique empêchera le filtrage correct des modèles dans l'interface.
