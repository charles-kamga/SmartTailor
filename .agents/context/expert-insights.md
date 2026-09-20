# Retours d'Expérience d'Experts & Bonnes Pratiques Métier — SmartTailor 💡

Ce document synthétise les retours d'expérience tirés de l'analyse d'applications de couture et de confection sur-mesure de référence (*BoutiqManager*, *TailorFit*, *SewTrack*, etc.) et d'architectures mobiles *Offline-First* pour environnements professionnels exigeants.

---

## 1. Ergonomie d'Atelier Physique : Le "Monde Réel" du Tailleur

Dans un atelier de couture en Afrique subsaharienne ou en périphérie urbaine, les conditions de travail imposent des contraintes physiques très spécifiques :

### A. Saisie à une main et gestuelle contrainte
* **Le contexte** : Le couturier tient son mètre ruban d'une main autour du cou ou de la taille du client, et manipule le smartphone de l'autre main.
* **La règle d'or** : L'interface ne doit jamais forcer l'usage des deux mains. Le pavé numérique virtuel doit être situé en bas de l'écran, directement accessible par le pouce.
* **Taille des touches** : Minimum 50x50 dp pour éviter les fautes de frappe avec des doigts potentiellement rugueux ou couverts de poussière de tissu.

### B. Ordre anatomique naturel de la prise de mesure
* Dans les carnets papier traditionnels, les mesures sont prises **de haut en bas** :
  1. Tête & Cou (`TC`)
  2. Épaules & Carrure (`EP`)
  3. Poitrine & Buste (`TP`, `EcP`, `HP`)
  4. Taille & Ventre (`TT`)
  5. Bassin & Hanches (`TB`)
  6. Membres (Bras `LH`, `LM` puis Jambes `LP`, `TCu`, `TG`, `TCh`)
* **Impact UI** : L'écran de mesures doit ordonner les champs selon cette logique anatomique pour que le tailleur n'ait pas à chercher le champ suivant sur son écran.

### C. Éclairage et environnement lumineux
* Les ateliers sont souvent ouverts sur la rue ou très ensoleillés. Les écrans subissent de forts reflets.
* **Impact UI** : Les contrastes doux ou les textes gris clair sur fond blanc sont illisibles au soleil. Les contrastes doivent être stricts (norme WCAG AA minimum).

### D. Rassurer l'artisan : L'UX de Sérénité ("Trust UX")
* La peur numéro 1 du tailleur abandonnant son cahier papier est : *"Et si le téléphone plante ou se décharge, est-ce que je perds les mensurations de mes clients ?"*
* **Impact UI** : Chaque écran doit donner un signal visuel rassurant immédiat :
  - Dès qu'une valeur est entrée : petite coche verte instantanée.
  - En haut d'écran : pastille *"Enregistré sur l'appareil"* ou *"Synchronisé sur votre Google Drive"*.

---

## 2. Robustesse Back-End & Synchronisation Offline-First

### A. La Base Locale SQLite comme Source Unique de Vérité
* Tout passe par le stockage local. Aucun appel réseau ne bloque l'interaction utilisateur.
* Si le tailleur valide une commande au fond de son atelier sans connexion, la commande est enregistrée avec succès en moins de 50 millisecondes.

### B. Synchronisation Idempotente (Anti-Doublons)
* Dans une approche naïve avec Google Sheets via l'API `append`, un renvoi après coupure réseau crée un doublon de commande.
* **Recommandation d'expert** :
  - Chaque commande possède un identifiant unique immuable (`id` SQLite ou UUID).
  - Dans Google Sheets, la première colonne contient cet ID unique.
  - Avant d'insérer, le service vérifie si l'ID existe déjà dans la feuille pour mettre à jour la ligne (*Upsert*) au lieu d'en créer une deuxième.

### C. Pattern Outbox (File d'attente de synchronisation)
* Plutôt que de synchroniser sauvagement au fil de l'eau, maintenir une liste d'opérations en attente :
  - `is_synced = 0` (ou table `sync_queue`).
  - Déclenchement automatique par NetInfo avec délai de stabilisation (debounce 2 secondes après reconnexion).
  - En cas d'erreur API (quota dépassé ou serveur Google indisponible), réessai exponentiel (Exponential Backoff).

### D. Autonomie hors-ligne pour les médias (Images locales)
* L'utilisation de liens distants (ex: Unsplash) pour les croquis de vêtements casse l'expérience utilisateur dès que l'artisan est hors-ligne.
* **Recommandation** : Les illustrations de base des 10 modèles doivent être des assets locaux (images locales ou icônes vectorielles embarquées dans l'APK).
