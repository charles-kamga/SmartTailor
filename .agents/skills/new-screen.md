# Compétence / Workflow : Créer un Nouvel Écran d'Atelier — `new-screen` 📱✨

Ce workflow guide pas-à-pas la création, le stylage ergonomique et l'intégration d'un nouvel écran dans l'application **SmartTailor**. Il garantit le respect rigoureux de la charte graphique atelier, des règles d'or UI et des normes de navigation React Native CLI.

---

## 1. Structure Canonique d'un Écran SmartTailor

Chaque écran de l'application doit respecter l'architecture visuelle standard :
1. **Conteneur Racine** : `<SafeAreaView style={styles.container}>` avec fond Crème d'Atelier (`#FAF8F5`).
2. **Barre d'État Android** : `<StatusBar barStyle="light-content" backgroundColor="#1E293B" />`.
3. **En-tête d'Atelier** :
   - Bandeau Ardoise Sombre (`#1E293B`), hauteur 56 à 60 dp.
   - Bouton retour tactile (zone cliquable >= 48x48 dp) si écran empilé dans la Stack.
   - Titre centré ou aligné à gauche en blanc pur (`#FFFFFF`), `fontSize: 18-20`, `fontWeight: 'bold'`.
4. **Contenu Défilable Garanti** :
   - Encapsulation dans `<ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">` ou `<FlatList>`.
   - Espace inférieur de sécurité (`paddingBottom: 80-100`) pour éviter tout masquage par un bouton flottant (FAB) ou la barre d'onglets.
5. **Cibles Tactiles Larges** :
   - Boutons d'action principaux : hauteur 48 à 52 dp (`paddingVertical: 12-14`, couleur Terracotta `#E2583E` ou Vert Émeraude `#10B981`).
   - Bouton d'Action Flottant (FAB optionnel) : 56x56 dp, forme squircle (`borderRadius: 16`), couleur `#E2583E`, `elevation: 4`.
6. **Zéro Style Inline** : 100% des styles déclarés dans `StyleSheet.create()` en fin de fichier.
7. **Palette Officielle Stricte** :
   - Terracotta : `#E2583E` *(Bannir `#A04000`)*
   - Ardoise : `#1E293B`
   - Crème d'Atelier : `#FAF8F5`
   - Vert Émeraude : `#10B981`
   - Gris Doux : `#64748B` / `#E2E8F0`

---

## 2. Modèle de Code d'Écran Type

Créer le fichier dans `src/screens/MonNouvelEcranScreen.tsx` :

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

// Typage des props de navigation pour l'écran
type Props = NativeStackScreenProps<RootStackParamList, 'MonNouvelEcran'>;

export default function MonNouvelEcranScreen({ navigation }: Props) {
  const [chargement, setChargement] = useState(false);

  const handleActionPrincipale = () => {
    // Action métier...
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* 1. En-tête d'Atelier Standard */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Mon Nouvel Écran
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 2. Contenu Défilable Sécurisé */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Carte d'information / Formulaire en relief */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Détails de l'Atelier</Text>
          <Text style={styles.cardDescription}>
            Renseignez les informations avec des cibles tactiles confortables adaptées à l'artisan.
          </Text>
        </View>

        {/* 3. Bouton d'Action Principal (Hauteur >= 48 dp) */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleActionPrincipale}
          activeOpacity={0.8}
        >
          <Icon name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.mainButtonText}>Valider l'opération</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5', // Crème atelier
  },
  header: {
    height: 56,
    backgroundColor: '#1E293B', // Ardoise foncée
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center', // Cible tactile >= 48x48 dp
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 48, // Équilibre le bouton retour pour centrer le titre
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 88, // Marge inférieure de sécurité
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B', // Gris doux
    lineHeight: 20,
  },
  mainButton: {
    height: 50, // Cible tactile >= 48 dp
    backgroundColor: '#E2583E', // Terracotta officiel (jamais #A04000)
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  mainButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
```

---

## 3. Déclaration du Routage (`src/navigation/types.ts`)

Ajouter la nouvelle route dans le fichier de typage TypeScript.

### Cas A : Écran Stack Plein Écran (modal ou navigation successive)
Ajouter dans `RootStackParamList` :

```typescript
export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
  NouvelleCommande: undefined;
  MonNouvelEcran: undefined; // ◄ Ajouter ici (ou avec paramètres : { commandeId: number })
};
```

### Cas B : Nouvel Onglet de la Barre Inférieure
Ajouter dans `BottomTabParamList` :

```typescript
export type BottomTabParamList = {
  Atelier: undefined;
  Clients: undefined;
  Catalogue: undefined;
  Commandes: undefined;
  NouvelOnglet: undefined; // ◄ Ajouter ici
};
```

---

## 4. Enregistrement dans le Navigateur (`src/navigation/AppNavigator.tsx`)

### Si Cas A (Écran Stack) :
Importer l'écran et ajouter la balise `<Stack.Screen>` dans `AppNavigator()` :

```typescript
import MonNouvelEcranScreen from '../screens/MonNouvelEcranScreen';

// Dans AppNavigator() :
<Stack.Screen 
  name="MonNouvelEcran" 
  component={MonNouvelEcranScreen} 
  options={{ headerShown: false }} 
/>
```

### Si Cas B (Onglet Bottom Tab) :
1. Importer l'écran.
2. Ajouter l'icône dans la configuration dynamique de `BottomTabNavigator` :
```typescript
else if (route.name === 'NouvelOnglet') {
  iconName = 'sparkles-outline'; // Choisir une icône Ionicons adaptée
}
```
3. Déclarer l'écran dans `<Tab.Navigator>` :
```typescript
<Tab.Screen name="NouvelOnglet" component={MonNouvelOngletScreen} />
```

---

## 5. Checklist de Validation Obligatoire

Avant de valider l'écran créé, vérifier chaque point :
- [ ] **Palette** : Utilisation exclusive de `#E2583E`, `#1E293B`, `#FAF8F5`, `#10B981`, `#64748B`. Aucune présence de `#A04000`.
- [ ] **Cibles tactiles** : Boutons et icônes d'au moins 48x48 dp.
- [ ] **Contraste** : Zéro texte blanc sur fond clair.
- [ ] **Défilement** : Présence de `ScrollView` ou `FlatList` avec marge inférieure suffisante (`paddingBottom >= 80`).
- [ ] **Zéro style inline** : Tout est dans `StyleSheet.create()`.
- [ ] **TypeScript** : Compilation sans faute via `npx tsc --noEmit` (exit code 0 attendu).
- [ ] **Commit Git** : `git commit -m "Ajout : Écran MonNouvelEcran avec ergonomie atelier"`
