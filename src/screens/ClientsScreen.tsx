import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import de la base de données locale
import { recupererTousLesClients, ClientDB } from '../database/queries';

// Dictionnaire des labels d'abréviations pour l'affichage en clair des mesures
const ABBR_LABELS: Record<string, string> = {
  C: 'Cou',
  EP: 'Épaules',
  P: 'Poitrine',
  LC: 'Long. Chemise',
  T: 'Taille',
  LP: 'Long. Pantalon',
  HP: 'H. Poitrine',
  EcP: 'Écart Poitrine',
  TB: 'Bassin / Hanches',
  CD: 'Carrure Dos',
  LM: 'Long. Manche',
  TBr: 'Tour de Bras',
  LT: 'Long. Totale',
  LJ: 'Long. Jupe',
};

// Fonction utilitaire pour extraire les initiales
const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export default function ClientsScreen({ navigation }: any) {
  const [clients, setClients] = useState<ClientDB[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);

  // Charger les clients de la base SQLite à chaque focus d'écran [2]
  useFocusEffect(
    useCallback(() => {
      const chargerClients = async () => {
        try {
          const tousLesClients = await recupererTousLesClients();
          setClients(tousLesClients);
        } catch (error) {
          console.error("Erreur de chargement des clients :", error);
        }
      };
      chargerClients();
    }, [])
  );

  // Filtrer la liste des clients selon la recherche (sur le nom ou le téléphone)
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  // Gérer l'ouverture/fermeture de l'accordéon
  const toggleExpand = (id: number) => {
    if (expandedClientId === id) {
      setExpandedClientId(null); // Replier si c'était déjà ouvert
    } else {
      setExpandedClientId(id); // Déplier la nouvelle carte
    }
  };

  // Composant de rendu pour chaque ligne de client
  const renderItem = ({ item }: { item: ClientDB }) => {
    const isExpanded = expandedClientId === item.id;
    
    // Parser les mesures stockées en chaîne JSON
    let mesuresObj: Record<string, string> = {};
    try {
      mesuresObj = JSON.parse(item.mesures_actuelles || '{}');
    } catch (e) {
      console.error('Erreur de parsing des mesures :', e);
    }

    const mesuresEntries = Object.entries(mesuresObj);

    return (
      <View style={styles.card}>
        {/* En-tête de la carte (Toujours visible) */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          {/* Avatar d'initiales à gauche */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.clientPhone}>{item.phone}</Text>
          </View>

          {/* Boutons d'action à droite */}
          <View style={styles.actionButtons}>
            {isExpanded ? (
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => setExpandedClientId(null)}
              >
                <Text style={styles.buttonText}>Réduire</Text>
                <Icon name="chevron-up" size={14} color="#64748B" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={styles.buttonText}>Détails</Text>
                <Icon name="chevron-down" size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Section dépliée (Mesures du client en grille 2 colonnes) */}
        {isExpanded && (
          <View style={styles.cardDropdown}>
            <View style={styles.divider} />
            <Text style={styles.measurementsTitle}>
              <Icon name="rulers" size={14} color="#E2583E" /> Mesures Actuelles (cm)
            </Text>

            {mesuresEntries.length > 0 ? (
              <View style={styles.gridContainer}>
                {mesuresEntries.map(([key, val]) => (
                  <View key={key} style={styles.gridItem}>
                    <Text style={styles.gridLabel}>
                      {ABBR_LABELS[key] || key} ({key})
                    </Text>
                    <Text style={styles.gridValue}>{val}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noMeasurementsText}>Aucune mesure enregistrée pour ce client.</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* 1. Barre de recherche de l'en-tête */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Liste des clients */}
      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={48} color="#CBD5E1" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client enregistré pour le moment.'}
            </Text>
          </View>
        }
      />

      {/* 3. Bouton flottant d'ajout client (Design "Squircle" terracotta assorti) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NouveauClient')}
        activeOpacity={0.8}
      >
        <Icon name="person-add-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  searchHeader: {
    height: 72,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    padding: 0, // Retire le padding interne sous Android
  },
  listContent: {
    padding: 16,
    paddingBottom: 88, // Laisse de la place au-dessus du bouton d'action flottant (FAB)
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0', // Couleur gris-bleu pastel neutre
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#FDBA74',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginRight: 4,
  },
  cardDropdown: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  measurementsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Grille propre en 2 colonnes
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  gridLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  noMeasurementsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16, // Forme "Squircle" moderne assortie
    backgroundColor: '#A04000', // Terracotta sombre
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});