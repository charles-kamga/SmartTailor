import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { recupererToutesLesCommandes, mettreAJourStatutCommande } from '../database/queries';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  'En attente': { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' },
  'En cours': { bg: '#EFF6FF', text: '#2563EB', icon: 'construct-outline' },
  'Prêt': { bg: '#F3E8FF', text: '#7C3AED', icon: 'checkmark-done-outline' },
  'Livré': { bg: '#D1FAE5', text: '#059669', icon: 'gift-outline' },
};

const STATUS_OPTIONS = ['En attente', 'En cours', 'Prêt', 'Livré'];
const FILTER_OPTIONS = ['Toutes', ...STATUS_OPTIONS];

type Commande = {
  id: number;
  clientName: string;
  clientPhone: string;
  profile: string;
  garment_type_id: string;
  catalogue_modele_id: number | null;
  photo_commande: string | null;
  mesures_commande: string;
  notes: string | null;
  status: string;
  date_reception: string;
  date_livraison_estimee: string;
};

export default function CommandesScreen() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('Toutes');
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const data = await recupererToutesLesCommandes();
      setCommandes(data);
    } catch (e) {
      console.error('Erreur lors du chargement des commandes', e);
      Alert.alert('Erreur', 'Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCommandes();
    }, [])
  );

  const filteredCommandes =
    filter === 'Toutes' ? commandes : commandes.filter((c) => c.status === filter);

  const openStatusModal = (commande: Commande) => {
    setSelectedCommande(commande);
    setModalVisible(true);
  };

  const changeStatus = async (newStatus: string) => {
    if (!selectedCommande) return;
    setUpdating(true);
    try {
      await mettreAJourStatutCommande(selectedCommande.id, newStatus);
      await loadCommandes();
      setModalVisible(false);
    } catch (e) {
      console.error('Erreur mise à jour statut', e);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    } finally {
      setUpdating(false);
    }
  };

  const renderItem = ({ item }: { item: Commande }) => {
    const garmentName =
      GARMENT_TEMPLATES.find((t) => t.id === item.garment_type_id)?.name || item.garment_type_id;
    const config = STATUS_CONFIG[item.status] || {
      bg: '#F1F5F9',
      text: '#64748B',
      icon: 'information-circle-outline',
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openStatusModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.clientName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.garment}>{garmentName}</Text>
          <Text style={styles.phone}>{item.clientPhone}</Text>
          <Text style={styles.dateLivraison}>Échéance : {item.date_livraison_estimee}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Icon name={config.icon} size={13} color={config.text} style={styles.badgeIcon} />
          <Text style={[styles.badgeText, { color: config.text }]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Barre de filtres horizontale */}
      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = filter === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.filterButton, isActive ? styles.filterButtonActive : styles.filterButtonInactive]}
              onPress={() => setFilter(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Liste ou Indicateur de chargement */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#E2583E" />
        </View>
      ) : (
        <FlatList
          data={filteredCommandes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="briefcase-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'Toutes'
                  ? 'Aucune commande enregistrée pour le moment.'
                  : `Aucune commande avec le statut "${filter}".`}
              </Text>
            </View>
          }
        />
      )}

      {/* 3. Modal de changement de statut */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier l'avancement</Text>
            <Text style={styles.modalSubtitle}>
              Client : {selectedCommande?.clientName}
            </Text>

            {STATUS_OPTIONS.map((opt) => {
              const isCurrent = selectedCommande?.status === opt;
              const config = STATUS_CONFIG[opt];

              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.modalOption, isCurrent && styles.modalOptionCurrent]}
                  onPress={() => changeStatus(opt)}
                  disabled={updating}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalOptionRow}>
                    <View style={[styles.modalStatusDot, { backgroundColor: config.text }]} />
                    <Text style={[styles.modalOptionText, isCurrent && styles.modalOptionTextCurrent]}>
                      {opt}
                    </Text>
                  </View>
                  {isCurrent && <Icon name="checkmark-circle" size={20} color="#10B981" />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
              disabled={updating}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: '#E2583E',
  },
  filterButtonInactive: {
    backgroundColor: '#F1F5F9',
  },
  filterText: {
    fontSize: 12,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterTextInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
  loadingWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardContent: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  garment: {
    fontSize: 13,
    color: '#E2583E',
    fontWeight: '600',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  dateLivraison: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  modalOptionCurrent: {
    backgroundColor: '#FFF7F5',
    borderWidth: 1,
    borderColor: '#E2583E',
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalOptionTextCurrent: {
    color: '#E2583E',
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});