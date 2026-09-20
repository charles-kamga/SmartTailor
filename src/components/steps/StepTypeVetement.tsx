import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GARMENT_TEMPLATES, ProfileType, GarmentTemplate } from '../../database/garmentTemplates';

type VetementInfo = {
  garmentId: string;
  photoUri: string | null;
};

type Props = {
  vetement: VetementInfo;
  profile?: ProfileType | '';
  onChange: (v: VetementInfo) => void;
  onNext?: () => void;
};

export default function StepTypeVetement({ vetement, profile, onChange }: Props) {
  // Filtrage selon le profil sélectionné à l'étape 1
  const availableTemplates: GarmentTemplate[] = profile
    ? GARMENT_TEMPLATES.filter((t) => t.profiles.includes(profile as ProfileType))
    : GARMENT_TEMPLATES;

  const handleSelect = (template: GarmentTemplate) => {
    onChange({
      garmentId: template.id,
      photoUri: template.illustrationUrl || null,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Choisissez le vêtement à confectionner</Text>
      <Text style={styles.subtitle}>
        {availableTemplates.length} modèles adaptés à la silhouette sélectionnée
      </Text>

      <View style={styles.grid}>
        {availableTemplates.map((t) => {
          const isSelected = vetement.garmentId === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => handleSelect(t)}
              activeOpacity={0.7}
            >
              {t.illustrationUrl ? (
                <Image
                  source={{ uri: t.illustrationUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Icon name="shirt-outline" size={32} color="#64748B" />
                </View>
              )}
              <View style={styles.itemFooter}>
                <Text
                  style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
                  numberOfLines={2}
                >
                  {t.name}
                </Text>
                <Text style={styles.measurementCount}>
                  {t.measurements.length} mesures
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Icon name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
  },
  itemSelected: {
    borderColor: '#E2583E',
    backgroundColor: '#FFF7F5',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemFooter: {
    padding: 10,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemLabelSelected: {
    color: '#E2583E',
    fontWeight: 'bold',
  },
  measurementCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E2583E',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});