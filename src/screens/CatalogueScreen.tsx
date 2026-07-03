import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { recupererTousModelesCatalogue } from '../database/queries';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Catégories de filtres : "Tous" + les 10 modèles
const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  ...GARMENT_TEMPLATES.map((t) => ({ id: t.id, label: t.name })),
];

interface CatalogueItem {
  id: number;
  garment_type_id: string;
  title: string;
  image_path: string;
  created_at: string;
}

export default function CatalogueScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [modeles, setModeles] = useState<CatalogueItem[]>([]);
  const [filtreActif, setFiltreActif] = useState('all');
  const [chargement, setChargement] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chargerModeles = useCallback(async () => {
    try {
      const data = await recupererTousModelesCatalogue();
      setModeles(data);
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
    } finally {
      setChargement(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    chargerModeles();
  }, [chargerModeles]);

  // Recharger au retour de l'écran d'ajout
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      chargerModeles();
    });
    return unsubscribe;
  }, [navigation, chargerModeles]);

  const modelesFiltres = filtreActif === 'all'
    ? modeles
    : modeles.filter((m) => m.garment_type_id === filtreActif);

  const onRefresh = () => {
    setRefreshing(true);
    chargerModeles();
  };

  const renderCarte = ({ item }: { item: CatalogueItem }) => (
    <View style={styles.carte}>
      <Image
        source={{ uri: item.image_path }}
        style={styles.carteImage}
        resizeMode="cover"
      />
      <View style={styles.carteOverlay}>
        <Text style={styles.carteTitre} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.carteCategorie}>
          {GARMENT_TEMPLATES.find((t) => t.id === item.garment_type_id)?.name ?? item.garment_type_id}
        </Text>
      </View>
    </View>
  );

  const renderEtatVide = () => (
    <View style={styles.etatVide}>
      <Icon name="images-outline" size={64} color="#CBD5E1" />
      <Text style={styles.etatVideTitre}>Catalogue vide</Text>
      <Text style={styles.etatVideSousTitre}>
        Ajoutez vos premiers modèles{'\n'}pour constituer votre catalogue
      </Text>
      <TouchableOpacity
        style={styles.boutonAjoutPrimaire}
        onPress={() => navigation.navigate('AjouterModele' as any)}
      >
        <Icon name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.boutonAjoutPrimaireTexte}>Ajouter un modèle</Text>
      </TouchableOpacity>
    </View>
  );

  if (chargement) {
    return (
      <View style={styles.centreur}>
        <ActivityIndicator size="large" color="#E2583E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitre}>Catalogue</Text>
        <TouchableOpacity
          style={styles.boutonSquircle}
          onPress={() => navigation.navigate('AjouterModele' as any)}
        >
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Barre de filtres horizontale */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresConteneur}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filtrePillule,
              filtreActif === item.id && styles.filtrePilluleActif,
            ]}
            onPress={() => setFiltreActif(item.id)}
          >
            <Text
              style={[
                styles.filtreTexte,
                filtreActif === item.id && styles.filtreTexteActif,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Grille de modèles ou état vide */}
      {modelesFiltres.length === 0 ? (
        renderEtatVide()
      ) : (
        <FlatList
          data={modelesFiltres}
          renderItem={renderCarte}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grille}
          columnWrapperStyle={styles.grilleRangee}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E2583E" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centreur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitre: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  boutonSquircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2583E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#E2583E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filtresConteneur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filtrePillule: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filtrePilluleActif: {
    backgroundColor: '#E2583E',
  },
  filtreTexte: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filtreTexteActif: {
    color: '#FFFFFF',
  },
  grille: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  grilleRangee: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  carte: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  carteImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    backgroundColor: '#E2E8F0',
  },
  carteOverlay: {
    padding: 12,
  },
  carteTitre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  carteCategorie: {
    fontSize: 12,
    fontWeight: '400',
    color: '#94A3B8',
  },
  etatVide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  etatVideTitre: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  etatVideSousTitre: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  boutonAjoutPrimaire: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2583E',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  },
  boutonAjoutPrimaireTexte: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
