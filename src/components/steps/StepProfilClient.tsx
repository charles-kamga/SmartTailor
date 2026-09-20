import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProfileType } from '../../database/garmentTemplates';

type ClientInfo = {
  name: string;
  phone: string;
  profile: ProfileType | '';
};

type Props = {
  client: ClientInfo;
  onChange: (c: ClientInfo) => void;
  onNext?: () => void;
};

const PROFILES_LIST: { id: ProfileType; label: string; icon: string }[] = [
  { id: 'homme', label: 'Homme', icon: 'man-outline' },
  { id: 'femme', label: 'Femme', icon: 'woman-outline' },
  { id: 'enfant_garcon', label: 'Garçon', icon: 'body-outline' },
  { id: 'enfant_fille', label: 'Fille', icon: 'flower-outline' },
];

export default function StepProfilClient({ client, onChange }: Props) {
  const handleNameChange = (name: string) => {
    onChange({ ...client, name });
  };

  const handlePhoneChange = (phone: string) => {
    onChange({ ...client, phone });
  };

  const handleProfileSelect = (profile: ProfileType) => {
    onChange({ ...client, profile });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.label}>Nom complet du client *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Amadou Diallo"
          placeholderTextColor="#94A3B8"
          value={client.name}
          onChangeText={handleNameChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Numéro de téléphone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: +237 690 00 00 00"
          placeholderTextColor="#94A3B8"
          value={client.phone}
          keyboardType="phone-pad"
          onChangeText={handlePhoneChange}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Profil morphologique *</Text>
        <Text style={styles.sublabel}>
          Détermine les coupes et tenues adaptées dans le catalogue.
        </Text>

        <View style={styles.profileGrid}>
          {PROFILES_LIST.map((p) => {
            const isSelected = client.profile === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.profileCard, isSelected && styles.profileCardSelected]}
                onPress={() => handleProfileSelect(p.id)}
                activeOpacity={0.7}
              >
                <Icon
                  name={p.icon}
                  size={26}
                  color={isSelected ? '#FFFFFF' : '#1E293B'}
                  style={styles.profileIcon}
                />
                <Text style={[styles.profileLabel, isSelected && styles.profileLabelSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1E293B',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  profileCardSelected: {
    backgroundColor: '#E2583E',
    borderColor: '#E2583E',
    elevation: 3,
  },
  profileIcon: {
    marginBottom: 6,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  profileLabelSelected: {
    color: '#FFFFFF',
  },
});