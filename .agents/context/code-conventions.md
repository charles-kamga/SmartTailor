# Conventions de Code & Cadence Git — SmartTailor 📜

Ce document formalise les règles de codage, de style TypeScript/React Native et la stratégie de commits pour garantir la pérennité et la sécurité du projet.

---

## 1. Conventions de Commits Git

### Style & Philosophie
* **Langue** : Français naturel, professionnel, orienté métier.
* **Vocabulaire** : Éviter le jargon cryptique de compilateur. Privilégier la clarté pour qu'un artisan ou un chef de projet comprenne l'utilité du changement.
* **Structure** : `[Action] : [Explication claire et précise]`

### Matrice des Verbes d'Action Recommandés

| Action | Cas d'utilisation | Exemple concret |
| :--- | :--- | :--- |
| **Ajout** | Nouvelle fonctionnalité, nouvel écran ou composant | `Ajout : Écran de prévisualisation des tenues du catalogue` |
| **Correction** | Résolution d'un bug ou d'une anomalie | `Correction : Contraste invisible des filtres inactifs sur CommandesScreen` |
| **Amélioration** | Amélioration d'ergonomie, de style ou d'UX sans changer la logique | `Amélioration : Hauteur dynamique du clavier numérique pour petits écrans` |
| **Optimisation** | Gain de performance, transaction SQL, fiabilisation | `Optimisation : Sécurisation atomique de la création de commande en SQLite` |
| **Refonte** | Restructuration de code sans modification fonctionnelle | `Refonte : Découpage du wizard de commande en sous-composants autonomes` |
| **Sauvegarde** | Point de sécurité avant tâche complexe ou refactorisation | `Sauvegarde : Point stable avant réorganisation du schéma de base` |
| **Documentation** | Mise à jour de guides, commentaires ou fichiers agents | `Documentation : Ajout des règles d'atelier dans expert-insights.md` |

---

## 2. Cadence de Commits & "Stratégie du Point de Sauvegarde"

Pour éviter les régressions, les pertes de travail ou les dérives lors de sessions de codage assisté par IA :

```
[État Actuel Stable] ──► npx tsc --noEmit (0 erreur)
       │
       ▼ (1) COMMIT DE SAUVEGARDE PRÉALABLE : "Sauvegarde : État stable avant..."
       │
[Travail en cours / Refactoring par l'Agent]
       │
   ├──► En cas d'erreur bloquante ou fausse piste :
   │      git reset --hard HEAD (Retour immédiat au point de sauvegarde !)
   │
   └──► En cas de réussite :
          (2) Validation TypeScript : npx tsc --noEmit
          (3) MICRO-COMMIT ATOMIQUE : "Ajout/Correction : ..."
```

### Règles d'or :
1. **Un commit par tâche logique** : Ne jamais regrouper une refonte BDD et un changement de style UI dans un même commit.
2. **Ne jamais commiter sur du code rouge** : Chaque commit doit laisser le dépôt dans un état vérifié (`npx tsc --noEmit` avec exit code 0).
3. **Commit avant toute instruction risquée** : Si l'utilisateur ou l'agent s'apprête à modifier un gros fichier (`NouvelleCommandeScreen.tsx`, `queries.ts`), faire un commit de sauvegarde immédiat.

---

## 3. Normes de Développement React Native & TypeScript

### Ordre des Imports
Organiser les imports au sommet de chaque fichier dans cet ordre précis, séparés par un saut de ligne :
```typescript
// 1. React & React Native core
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// 2. Bibliothèques tierces (Navigation, Icônes, NetInfo)
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// 3. Composants applicatifs
import StepIndicator from '../components/StepIndicator';

// 4. Services métiers
import { lancerSynchronisation } from '../services/syncService';

// 5. Couche de données (SQLite, requêtes)
import { db } from '../database/database';
import { enregistrerNouveauClientAvecCommande } from '../database/queries';

// 6. Types TypeScript
import type { CommandeDB, ClientDB } from '../database/queries';
import type { GarmentTemplate } from '../database/garmentTemplates';
```

### Typage TypeScript Strict
* Interdiction d'utiliser `any` sur de nouveaux développements.
* Toujours typer les props des composants avec une interface ou un type explicite (`interface Props { ... }`).
* Typer le retour des fonctions asynchrones (`Promise<Type>`).
* Pas de cast abusif avec `as any` ou d'omission d'erreur via `@ts-ignore`.

### Gestion des Styles & Design System
* **StyleSheet obligatoire** : Toujours utiliser `StyleSheet.create()` placé en bas du fichier de composant.
* **Palette de couleurs centralisée** : Référencer les couleurs du Design System officiel :
  ```typescript
  const COLORS = {
    primary: '#E2583E',     // Terracotta atelier
    dark: '#1E293B',        // Ardoise texte principal
    background: '#FAF8F5',  // Fond crème atelier
    success: '#10B981',     // Vert émeraude validation
    muted: '#64748B',       // Gris ardoise secondaire
    border: '#E2E8F0',      // Séparateurs
    card: '#FFFFFF',        // Fond des cartes blanches
  };
  ```
* Ne jamais réintroduire la couleur `#A04000` (terracotta foncé obsolète).

### Gestion d'Erreurs & Robustesse
* Encapsuler systématiquement les opérations asynchrones (SQLite, Google API, NetInfo) dans des blocs `try { ... } catch (error) { ... }`.
* Ne jamais laisser un bloc `catch` vide : toujours logger l'erreur et informer l'utilisateur via une alerte ou un message explicite.
* Supprimer ou conditionner les `console.log('=== DIAGNOSTIC ...')` en production via `if (__DEV__)`.
