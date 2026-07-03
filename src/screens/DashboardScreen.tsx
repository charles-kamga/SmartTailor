import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { recupererUrgencesSemaine } from '../database/queries';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';

const MOIS_ABREVIATIONS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
];

function formaterDate(date: Date): string {
  const jour = date.getDate();
  const mois = MOIS_ABREVIATIONS[date.getMonth()];
  return `${jour} ${mois}`;
}

function estDemain(dateStr: string): boolean {
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  return dateStr === formaterDate(demain);
}

export default function DashboardScreen({ navigation }: any) {
  const [commandes, setCommandes] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const chargerDonnees = async () => {
        const data = await recupererUrgencesSemaine();
        setCommandes(data);
        console.log("=== DIAGNOSTIC 3: DASHBOARD STATE ===", data.length, "items loaded.");
      };
      
      chargerDonnees();
    }, [])
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getGarmentName = (typeId: string): string => {
    const template = GARMENT_TEMPLATES.find((t) => t.id === typeId);
    return template ? template.name : typeId;
  };

  const renderItem = ({ item }: { item: any }) => {
    console.log("=== DIAGNOSTIC 4: RENDERING CARD ===", item.clientName, "with Model ID:", item.garment_type_id);
    const garmentName = GARMENT_TEMPLATES.find(t => t.id === item.garment_type_id)?.name || item.garment_type_id;
    const urgente = estDemain(item.dueDateLabel);

    return (
      <View style={styles.card}>
        {item.fabricImageUri ? (
          <Image source={{ uri: item.fabricImageUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.clientName)}</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.garmentType}>{garmentName}</Text>
          <Text style={styles.receivedDate}>Pris le {item.receivedDate?.split(' ')[0]}</Text>
        </View>

        <View style={[styles.badge, urgente ? styles.badgeUrgent : styles.badgeNormal]}>
          {urgente && <Icon name="time-outline" size={12} color="#FFFFFF" style={styles.badgeIcon} />}
          <Text style={[styles.badgeText, urgente ? styles.badgeTextUrgent : styles.badgeTextNormal]}>
            {item.dueDateLabel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Atelier</Text>
        <TouchableOpacity style={styles.syncButton} onPress={() => ToastAndroid.show('Toutes vos données sont synchronisées sur Google Drive !', ToastAndroid.SHORT)}>
          <Icon name="cloud-done" size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={commandes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.summaryBanner}>
              <Icon name="calendar-outline" size={24} color="#1E293B" style={styles.bannerIcon} />
              <Text style={styles.bannerText}>
                <Text style={styles.bannerHighlight}>{commandes.length}</Text> commandes à livrer cette semaine
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Urgences de la semaine</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Commandes')}>
                 <Text style={styles.seeAllText}>Voir tout</Text>
               </TouchableOpacity>
            </View>
          </>
        }
      />

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
  header: {
    height: 60,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  syncButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  bannerHighlight: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#E2583E',
    fontWeight: 'bold',
  },
   card: {
     flexDirection: 'row',
     backgroundColor: '#FFFFFF',
     borderRadius: 16,
     padding: 12,
     marginBottom: 12,
     alignItems: 'center',
     elevation: 2,
     shadowColor: '#000000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
   },
   avatar: {
     width: 50,
     height: 50,
     borderRadius: 25,
     backgroundColor: '#E2E8F0',
     justifyContent: 'center',
     alignItems: 'center',
     marginRight: 12,
   },
   avatarImage: {
     width: 50,
     height: 50,
     borderRadius: 25,
     marginRight: 12,
   },
   avatarText: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#475569',
   },
   cardContent: {
     flex: 1,
     justifyContent: 'center',
   },
   clientName: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#1E293B',
     marginBottom: 4,
   },
   garmentType: {
     fontSize: 14,
     color: '#64748B',
     marginBottom: 4,
   },
  receivedDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeUrgent: {
    backgroundColor: '#E2583E',
  },
  badgeNormal: {
    backgroundColor: '#F1F5F9',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextUrgent: {
    color: '#FFFFFF',
  },
  badgeTextNormal: {
    color: '#64748B',
  },
   fab: {
     position: 'absolute',
     bottom: 20,
     right: 20,
     width: 56,
     height: 56,
     borderRadius: 16,
     backgroundColor: '#E2583E',
     justifyContent: 'center',
     alignItems: 'center',
     elevation: 4,
     shadowColor: '#000000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 4,
   },
});