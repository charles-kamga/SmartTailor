# Compétence / Workflow : Cadence de Commits & Points de Sauvegarde — `git-checkpoint` 🛡️💾

Ce workflow décrit le protocole de sécurisation Git à exécuter avant et après chaque intervention d'un développeur ou d'un agent IA sur le projet **SmartTailor**.

---

## 1. Pourquoi des Points de Sauvegarde (Checkpoints) ?
Les agents IA peuvent parfois halluciner, modifier un composant hors de leur périmètre ou casser le typage TypeScript. 
Pour ne jamais perdre de travail et pouvoir annuler une mauvaise manipulation en 2 secondes, **la règle est de créer un point de sauvegarde stable avant toute tâche délicate**.

---

## 2. Procédure Pas-à-Pas

### Étape 1 : Vérification de Stabilité Préalable
Avant de toucher au code, s'assurer que le projet actuel compile :
```bash
npx tsc --noEmit
```
Si le résultat est vert (exit code 0), procéder au commit de sécurité.

### Étape 2 : Créer le Commit de Sauvegarde Pré-Refonte
Enregistrer l'état sain dans Git avec un message en français naturel :
```bash
git add .
git commit -m "Sauvegarde : État stable avant refonte de [NomDuModuleOuComposant]"
```

### Étape 3 : Exécution du Travail
L'agent ou le développeur effectue les modifications demandées.

### Étape 4 : Validation Post-Modification
Une fois la tâche achevée :
```bash
npx tsc --noEmit
```

* ❌ **En cas d'échec ou d'impasse** :
  Si l'agent a cassé le code ou pris une fausse route :
  ```bash
  git reset --hard HEAD
  ```
  Le dépôt revient instantanément au point de sauvegarde propre sans aucun dommage !

* ✅ **En cas de succès** :
  Passer à l'Étape 5.

### Étape 5 : Micro-Commit Atomique
Enregistrer la modification validée avec un verbe d'action clair :
```bash
git add [FichiersModifiés]
git commit -m "[Action] : [Explication concise et professionnelle du bénéfice métier]"
```

*Exemples types :*
* `git commit -m "Correction : Résolution du bug de saisie des mesures dans StepMesuresSplit"`
* `git commit -m "Ajout : Détection automatique des retards dans le tableau de bord atelier"`
* `git commit -m "Amélioration : Espacement tactile des touches pour la saisie à une main"`

---

## 3. Règle du "Code Toujours Vert"
> [!IMPORTANT]
> Ne jamais pousser ou valider un commit si `npx tsc --noEmit` renvoie la moindre erreur. Chaque commit de l'historique doit être un état sain et déployable.
