# Inventaire des Anomalies Connues & Dette Technique — SmartTailor ⚠️

Ce document recense les points d'attention critiques et les anomalies identifiées lors de l'audit approfondi du code. Tout agent intervenant sur le projet doit en avoir connaissance afin d'éviter de les aggraver et de prioriser leur résolution.

---

## 🔴 Anomalies Critiques (Priorité P0 — Bloquant)

### 1. `StepMesuresSplit.tsx` — Saisie et Affectation des Mesures Défaillante
* **Constat** : Dans la fonction `handleSave()`, la variable `activeKey` est utilisée simultanément pour accumuler les chiffres tapés au pavé ET comme clé dans l'objet de mesures !
* **Conséquence** : Si l'utilisateur tape `4` puis `2`, l'objet enregistré devient `{ "42": "42" }` au lieu d'affecter la valeur `42` à la mesure sélectionnée (ex: `TC`). De plus, les lignes de mesures du haut ne sont pas sélectionnables.
* **Correction attendue** :
  - Découpler l'état du champ sélectionné (`selectedField: string | null`, ex: `'TC'`) et la valeur en cours de saisie (`currentValue: string`, ex: `'42'`).
  - Rendre chaque ligne de mesure cliquable pour activer la saisie.

### 2. `NouvelleCommandeScreen.tsx` & `StepProfilClient.tsx` — Désynchronisation d'État
* **Constat** : `StepProfilClient` conserve les champs `nom`, `téléphone` et `profil` dans son propre état local sans propager les changements à son parent en direct. L'événement `onChange` n'est émis que lors du clic sur son propre bouton interne.
* **Conséquence** : Si le tailleur clique sur le bouton "Suivant" du bandeau inférieur principal (`NouvelleCommandeScreen`), l'état parent est vide et une alerte de validation bloque l'utilisateur.
* **Correction attendue** :
  - Soit `StepProfilClient` propage chaque modification immédiatement au parent via `onChange({ ...client, [field]: val })`.
  - Supprimer le double bouton "Suivant" interne pour ne garder que la barre d'action du wizard.

---

## 🟠 Anomalies Majeures (Priorité P1 — Visuel & Données)

### 3. `CommandesScreen.tsx` — Filtres Inactifs avec Texte Blanc sur Fond Blanc
* **Constat** : `filterText` a la propriété `color: '#FFFFFF'`. Les boutons de filtres inactifs ont un fond transparent sur la barre blanche.
* **Conséquence** : Les libellés des filtres ("Tous", "En attente", "En cours", etc.) sont invisibles tant qu'ils ne sont pas sélectionnés.
* **Correction attendue** :
  - Appliquer `color: activeFilter === f ? '#FFFFFF' : '#64748B'`.

### 4. `StepProfilClient.tsx` & `garmentTemplates.ts` — Casse du Profil Incohérente
* **Constat** : `StepProfilClient` propose `['Homme', 'Femme', 'Enfant']` (avec majuscule), alors que `ProfileType` dans `garmentTemplates.ts` exige `'homme' | 'femme' | 'enfant_garcon' | 'enfant_fille'`.
* **Conséquence** : Le filtrage des modèles de vêtements ne fait correspondre aucun modèle si une comparaison directe est effectuée.
* **Correction attendue** : Harmoniser sur les valeurs normalisées en minuscules.

### 5. `StepTypeVetement.tsx` — Dépassement d'Écran (Absence de ScrollView)
* **Constat** : La liste des 10 modèles de tenues est encapsulée dans un simple conteneur `<View>`.
* **Conséquence** : Sur smartphone Android de taille moyenne, les derniers vêtements sont coupés et inaccessibles.
* **Correction attendue** : Encapsuler la grille dans un `ScrollView` avec `contentContainerStyle`.

---

## 🟡 Dette Technique & Améliorations (Priorité P2)

### 6. `deliveryAlgorithm.ts` & Suite de Tests
* **Constat** : L'algorithme de calcul des délais d'atelier (exclusion des dimanches, charge cumulée sur 7 jours) est une fonction pure essentielle mais ne dispose d'aucun test unitaire dans `__tests__/`.
* **Action** : Créer un fichier de test Jest `__tests__/deliveryAlgorithm.test.ts`.

### 7. `DashboardScreen.tsx` — Calcul de la Date d'Urgence
* **Constat** : La fonction `estDemain()` compare des chaînes au format `"15 Oct"`. Une commande dont l'échéance est aujourd'hui ou déjà en retard n'est pas signalée comme urgente.
* **Action** : Comparer des timestamps ou des objets `Date` réels.

### 8. Utilisation Obsolète de `#A04000`
* **Constat** : Plusieurs boutons et composants utilisent encore `#A04000` au lieu de la couleur officielle du Design System `#E2583E`.
* **Action** : Remplacer systématiquement par `#E2583E`.
