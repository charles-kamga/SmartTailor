# Charte Graphique & Design System Atelier — SmartTailor 🎨

Ce document constitue la référence absolue pour l'ergonomie, les styles visuels, les conventions de composants et la cohérence de l'interface utilisateur de **SmartTailor**. Il est conçu pour répondre aux contraintes physiques réelles d'un atelier de couture (forte luminosité, manipulation à une main, cibles tactiles larges, réactivité instantanée).

---

## 1. Palette Chromatique Officielle

L'identité visuelle de SmartTailor s'articule autour de **5 couleurs piliers**, complétées par des teintes fonctionnelles neutres.

| Nom | Échantillon | Hex | Rôle & Usage |
| :--- | :---: | :--- | :--- |
| **Terracotta Atelier (Primaire)** | 🟧 | `#E2583E` | **Couleur maîtresse d'accent** : Boutons d'action principaux, Floating Action Button (FAB), filtre ou onglet actif, touches validées, cercles actifs du stepper. |
| **Ardoise Profonde (Slate)** | ⬛ | `#1E293B` | **Couleur de structure & texte principal** : Fond des en-têtes d'atelier, titres d'écrans, libellés principaux, texte fort. |
| **Crème d'Atelier (Background)** | ⬜ | `#FAF8F5` | **Arrière-plan global de l'application** : Apporte une ambiance chaleureuse et repose les yeux par rapport à un blanc cru. |
| **Vert Émeraude (Succès & Validation)** | 🟩 | `#10B981` | **Validation & Statut positif** : Étapes terminées du stepper (`StepIndicator`), commandes livrées, icône de synchronisation Google Drive/Sheets réussie, boutons de confirmation finale. |
| **Gris Doux / Muted (Texte secondaire)** | 🔘 | `#64748B` | **Hiérarchie d'information secondaire** : Numéros de téléphone, sous-titres, dates, icônes inactives, libellés d'aides. |
| **Gris Bordure (Border)** | ◽ | `#E2E8F0` | **Séparateurs discrets** : Contours d'entrées de texte (`TextInput`), délimitations de cartes, séparateurs de listes. |
| **Fond Neutre / Inactif** | ▫️ | `#F1F5F9` | **Zones neutres** : Fond des filtres inactifs, fond des badges neutres, conteneur du pavé numérique. |
| **Blanc Pur (Card & Surface)** | 🔲 | `#FFFFFF` | **Surfaces en relief** : Fond des cartes de commandes/clients, fenêtres modales, barre d'onglets inférieure. |

> [!CAUTION]
> ### 🚫 Proscription Totale de `#A04000`
> La teinte sombre `#A04000` est un vestige obsolète strictement **proscrit** dans toute l'application. 
> Toute occurrence résiduelle de `#A04000` (ex: dans `NouvelleCommandeScreen.tsx` ou `ClientsScreen.tsx`) doit être immédiatement remplacée par le Terracotta officiel **`#E2583E`**.

---

## 2. Statuts des Commandes & Badges Associés

Les badges de statut permettent une identification visuelle instantanée en atelier. Les contrastes texte/fond doivent être rigoureusement respectés :

| Statut | Fond du Badge | Couleur du Texte | Usage & Signification |
| :--- | :--- | :--- | :--- |
| **En attente** | `#FEF3C7` (Jaune ambré clair) | `#D97706` | Commande enregistrée, coupe ou travail non encore démarré. |
| **En cours** | `#EFF6FF` (Bleu ciel pastel) | `#2563EB` | Tissu coupé, confection en cours à la machine. |
| **Prêt** | `#F3E8FF` (Violet pastel) | `#7C3AED` | Vêtement terminé, repassé, en attente d'essayage ou de retrait. |
| **Livré** | `#D1FAE5` (Vert menthe clair) | `#059669` | Commande remise au client avec solde réglé. |
| **Urgence / Échéance J-1** | `#E2583E` (Terracotta) | `#FFFFFF` | Commande à livrer le lendemain ou en retard (avec icône `time-outline` ou `alert-circle`). |

---

## 3. Ergonomie d'Atelier & Cibles Tactiles

Dans un atelier physique, le couturier tient souvent son mètre ruban ou une pièce de tissu d'une main et interagit avec le smartphone de l'autre main. L'interface doit être tolérante aux approximations tactiles.

### Dimensions Minimales des Cibles Tactiles
* **Touches du pavé numérique virtuel** : Minimum **48x48 dp**, idéalement **56x56 dp** (ou largeur 30% d'écran avec padding vertical suffisant) dans `StepMesuresSplit.tsx`. Les touches doivent permettre une frappe rapide et aveugle.
* **Bouton d'Action Flottant (FAB)** : Toujours **56x56 dp** avec forme "Squircle" (`borderRadius: 16`), positionné à `bottom: 20`, `right: 20`, couleur `#E2583E`, `elevation: 4`.
* **Boutons d'Action Principaux (Wizard, Enregistrement)** : Hauteur minimale de **48 dp à 52 dp** (`paddingVertical: 12-14`, `borderRadius: 8-12`).
* **Boutons d'En-tête & Icônes Interactives** : Surface tactile minimale effective de **48x48 dp** (utiliser un `padding: 10-12` autour de l'icône).
* **Filtres et Segments** : Hauteur minimale de **40-44 dp** avec marge interne confortable (`paddingVertical: 8`, `paddingHorizontal: 14`).

### Typographie & Échelle Hiérarchique
* **Titres d'en-tête atelier** : `fontSize: 18-20`, `fontWeight: 'bold'`, couleur `#FFFFFF` (sur en-tête ardoise `#1E293B`).
* **Titres de section / Titres d'écrans** : `fontSize: 18-22`, `fontWeight: 'bold'`, couleur `#1E293B`.
* **Noms de clients / Cartes** : `fontSize: 16`, `fontWeight: 'bold'`, couleur `#1E293B`.
* **Libellés de mesures / Sous-titres** : `fontSize: 14-16`, `fontWeight: '600'`, couleur `#1E293B` ou `#64748B`.
* **Valeurs saisies au pavé numérique** : `fontSize: 20-24`, `fontWeight: 'bold'`, couleur `#E2583E` (actif) ou `#1E293B`.
* **Textes de boutons** : `fontSize: 15-16`, `fontWeight: 'bold'` ou `'600'`, couleur `#FFFFFF`.
* **Badges et Métadonnées** : `fontSize: 11-13`, `fontWeight: '600'`.

### Ombres et Reliefs Android
Sur Android, détacher les cartes blanches du fond crème `#FAF8F5` via l'élévation native :
* Cartes standard : `elevation: 2`, `shadowColor: '#000000'`, `shadowOffset: { width: 0, height: 1 }`, `shadowOpacity: 0.05`, `shadowRadius: 2`.
* FAB et boutons d'action majeurs : `elevation: 4`, `shadowOpacity: 0.15`, `shadowRadius: 4`.

---

## 4. Règle Critique sur les Contrastes & Lisibilité Extérieure

> [!CAUTION]
> ### 👁️ Zéro Texte Blanc sur Fond Blanc ou Clair
> Les ateliers de confection sont souvent baignés de soleil ou situés en semi-extérieur. Les reflets réduisent considérablement la lisibilité.
> 
> **Règle absolue :**
> - **Tout texte sur fond blanc, crème `#FAF8F5` ou pastel (`#F1F5F9`) DOIT être en Ardoise Sombre (`#1E293B`) ou Gris Doux (`#64748B`).**
> - **Le texte blanc (`#FFFFFF`) est STRICTEMENT réservé aux fonds à fort contraste sombre ou vif : Terracotta (`#E2583E`), Ardoise Sombre (`#1E293B`) ou Vert Émeraude (`#10B981`).**

### Cas d'école : La barre de filtres (`CommandesScreen.tsx`)
* ❌ **Erreur historique** : Le style `filterText` était défini avec `{ color: '#FFFFFF' }` statique, rendant les filtres inactifs (fond blanc/transparent) totalement invisibles.
* ✅ **Implémentation correcte attendue** :
  ```typescript
  // Dans le composant :
  <TouchableOpacity
    key={option}
    style={[styles.filterButton, filter === option && styles.filterButtonActive]}
    onPress={() => setFilter(option)}
  >
    <Text style={[styles.filterText, filter === option ? styles.filterTextActive : styles.filterTextInactive]}>
      {option}
    </Text>
  </TouchableOpacity>

  // Dans StyleSheet.create() :
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9', // ou transparent
  },
  filterButtonActive: {
    backgroundColor: '#E2583E', // Terracotta atelier
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF', // Blanc sur fond Terracotta
  },
  filterTextInactive: {
    color: '#64748B', // Gris ardoise lisible sur fond clair
  },
  ```

---

## 5. Normes de Styling & Architecture CSS-in-JS

### Interdiction des Styles Inline
* **Règle** : Les styles déclarés directement en ligne (`style={{ margin: 10, color: 'red' }}`) sont **formellement proscrits**.
* **Exception unique autorisée** : Les dimensions dynamiques issues d'un calcul au runtime (ex: `{ height: topHeight }` dans `StepMesuresSplit.tsx`).
* **Bonne pratique** : Déclarer tous les styles via `StyleSheet.create()` regroupé en bas de fichier. Cela garantit une optimisation mémoire React Native, un code déclaratif et propre, et facilite la maintenance.

---

## 6. Responsive & Adaptabilité Multi-Écrans

Les smartphones d'atelier varient grandement en gamme et en format d'écran (écrans 5.5" à 6.8", ratios 16:9, 18:9, 19.5:9 et 20:9).

### Directives d'Adaptabilité
1. **Dimensions dynamiques de l'écran** :
   - Privilégier le hook réactif `useWindowDimensions()` de React Native (ou `Dimensions.get('window')`) pour adapter les hauteurs de fractionnement.
2. **Architecture Split Screen (Écran divisé de `StepMesuresSplit.tsx`)** :
   - Panneau supérieur (liste des mesures à prendre) : **55%** de la hauteur fenêtre (`Math.round(windowHeight * 0.55)`).
   - Panneau inférieur (pavé numérique tactile d'atelier) : **45%** restant (`windowHeight - topHeight`).
3. **Défilement Garanti (Anti-Coupure)** :
   - Toutes les listes et formulaires longs (`StepTypeVetement.tsx`, `StepProfilClient.tsx`, formulaires de commande) doivent être encapsulés dans un `ScrollView` ou `FlatList` avec `contentContainerStyle`.
   - Toujours ajouter un espace inférieur de sécurité (`paddingBottom: 80` à `100`) sur les listes afin que le Floating Action Button (FAB) ou la barre d'onglets inférieure ne masque aucun élément.
   - Utiliser `keyboardShouldPersistTaps="handled"` pour éviter que le clavier virtuel ne bloque les appuis sur les boutons de validation.

---

## 7. Concordance avec les Composants et Écrans Référents

| Fichier | Rôle & Composant | Règles Spécifiques UI SmartTailor |
| :--- | :--- | :--- |
| `src/components/StepIndicator.tsx` | Stepper 3 étapes | Cercles de 28x28 dp. Vert `#10B981` (validé avec coche), Terracotta `#E2583E` avec élévation (actif), Gris `#F1F5F9` avec bordure `#CBD5E1` (inactif). Ligne de liaison `#10B981` (active) / `#E2E8F0` (inactive). |
| `src/components/steps/StepProfilClient.tsx` | Étape 0 : Profil & Client | Champs `TextInput` avec bordure `#E2E8F0` et texte `#1E293B`. Grille de sélection de profil (`homme`, `femme`, `enfant_garcon`, `enfant_fille`) avec bordure `#E2583E` et fond terracotta quand sélectionné. |
| `src/components/steps/StepTypeVetement.tsx` | Étape 1 : Vêtement | Grille 2 colonnes (`width: '48%'`) encapsulée dans un `ScrollView`. Carte sélectionnée avec bordure `#E2583E` et fond translucide `#E2583E22`. Images locales ou placeholders sécurisés. |
| `src/components/steps/StepMesuresSplit.tsx` | Étape 2 : Prise de Mesures | Split screen 55/45. Lignes de mesures sélectionnables. Pavé numérique 3 colonnes (`width: '30%'`), touches d'au moins 48 dp, boutons retour arrière `⌫` et validation `✓`. Bouton final `#10B981` ou `#E2583E`. |
| `src/screens/DashboardScreen.tsx` | Écran d'accueil Atelier | En-tête Ardoise `#1E293B`, bannière de synthèse Indigo clair (`#E0E7FF`), bouton de synchronisation avec retour visuel d'état (`#10B981`), liste des urgences, FAB squircle `#E2583E`. |
| `src/screens/CommandesScreen.tsx` | Suivi des Commandes | Barre de filtres horizontale avec contraste strict (actif = fond `#E2583E`, texte `#FFFFFF` ; inactif = texte `#64748B`), cartes avec initiales ou photos, badges d'état colorés, fenêtre modale de changement d'état. |
| `src/screens/ClientsScreen.tsx` | Annuaire & Mensurations | En-tête Ardoise `#1E293B` avec barre de recherche blanche intégrée (`height: 44`, `borderRadius: 12`), cartes clients avec accordéon dépliable révélant la grille de mesures à 2 colonnes (`ABBR_LABELS`), FAB squircle `#E2583E`. |
| `src/screens/NouvelleCommandeScreen.tsx` | Orchestrateur Wizard | Barre d'en-tête ardoise avec retour en arrière, stepper d'avancement, conteneur dynamique d'étape, barre de pied de page fixe (`height: 64`, boutons avec cibles tactiles >= 48 dp, couleur primaire `#E2583E`). |
| `src/screens/LoginScreen.tsx` | Authentification Google | Fond crème `#FAF8F5`, logo SmartTailor dans conteneur ardoise, bouton de connexion Google blanc avec contour doux et icône officielle (`height: 52`). |

---

## 8. Bibliothèque d'Icônes & Conventions Visuelles

SmartTailor utilise exclusivement **`react-native-vector-icons/Ionicons`**.

### Tailles Recommandées
* **12 à 14 dp** : Badges d'urgence, coches du stepper (`checkmark`), flèches d'accordéon.
* **18 à 20 dp** : Icônes dans les boutons d'action (`arrow-back`, `chevron-forward-outline`).
* **24 dp** : Icônes de la barre d'onglets inférieure (`home-outline`, `people-outline`, `book-outline`, `briefcase-outline`), en-tête d'atelier (`cloud-done`), bouton FAB (`person-add-outline`).
* **32 à 48 dp** : Avatars neutres, états vides (`people-outline` pour liste vide).
