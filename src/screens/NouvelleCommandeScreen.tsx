import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import StepIndicator from '../components/StepIndicator';
import StepProfilClient from '../components/steps/StepProfilClient';
import StepTypeVetement from '../components/steps/StepTypeVetement';
import StepMesuresSplit from '../components/steps/StepMesuresSplit';
import { GARMENT_TEMPLATES, ProfileType, GarmentTemplate } from '../database/garmentTemplates';
import { enregistrerNouveauClientAvecCommande } from '../database/queries';

const STEPS = ['Profil Client', 'Type Vêtement', 'Prise Mesures'];

export default function NouvelleCommandeScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);

  // État partagé du formulaire multi-étapes
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [profile, setProfile] = useState<ProfileType | ''>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [valeursMesures, setValeursMesures] = useState<Record<string, string>>({});

  const availableTemplates = profile
    ? GARMENT_TEMPLATES.filter((t) => t.profiles.includes(profile as ProfileType))
    : GARMENT_TEMPLATES;

  const activeTemplate: GarmentTemplate =
    GARMENT_TEMPLATES.find((t) => t.id === selectedModelId) || availableTemplates[0] || GARMENT_TEMPLATES[0];

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!clientName.trim()) {
        Alert.alert('Champ requis', 'Veuillez saisir le nom du client.');
        return;
      }
      if (!clientPhone.trim()) {
        Alert.alert('Champ requis', 'Veuillez saisir le numéro de téléphone.');
        return;
      }
      if (!profile) {
        Alert.alert('Profil requis', 'Veuillez sélectionner un profil morphologique (Homme, Femme, etc.).');
        return;
      }
      const filtered = GARMENT_TEMPLATES.filter((t) => t.profiles.includes(profile as ProfileType));
      if (filtered.length > 0 && !filtered.some((t) => t.id === selectedModelId)) {
        setSelectedModelId(filtered[0].id);
      } else if (!selectedModelId) {
        setSelectedModelId(GARMENT_TEMPLATES[0].id);
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!selectedModelId) {
        Alert.alert('Modèle requis', 'Veuillez sélectionner un vêtement à confectionner.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleSaveOrder();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSaveOrder = async () => {
    const totalSaisies = Object.keys(valeursMesures).length;
    if (totalSaisies === 0) {
      Alert.alert('Mesures manquantes', 'Veuillez saisir au moins une mesure avant de valider.');
      return;
    }

    try {
      const result = await enregistrerNouveauClientAvecCommande(
        clientName,
        clientPhone,
        profile || 'homme',
        selectedModelId,
        valeursMesures,
        '', // notes
        null // photo
      );

      Alert.alert(
        'Commande enregistrée !',
        `Client : ${clientName}\nDate de livraison estimée : ${result.dateLivraison}`,
        [{ text: 'Super', onPress: () => navigation.navigate('MainApp') }]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error);
      Alert.alert('Erreur', 'Impossible d’enregistrer la commande dans la base locale.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handlePrevStep}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 0 && 'Informations Client'}
          {currentStep === 1 && 'Choix du Vêtement'}
          {currentStep === 2 && `Prise de Mesures (${activeTemplate.name})`}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <View style={styles.contentContainer}>
        {currentStep === 0 && (
          <StepProfilClient
            client={{ name: clientName, phone: clientPhone, profile }}
            onChange={(c) => {
              setClientName(c.name);
              setClientPhone(c.phone);
              setProfile(c.profile);
            }}
          />
        )}

        {currentStep === 1 && (
          <StepTypeVetement
            vetement={{ garmentId: selectedModelId, photoUri: activeTemplate.illustrationUrl || null }}
            profile={profile}
            onChange={(v) => setSelectedModelId(v.garmentId)}
          />
        )}

        {currentStep === 2 && (
          <StepMesuresSplit
            garmentId={selectedModelId}
            mesures={valeursMesures}
            onChange={setValeursMesures}
          />
        )}
      </View>

      <View style={styles.footer}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevStep}>
            <Icon name="arrow-back" size={18} color="#64748B" style={styles.prevButtonIcon} />
            <Text style={styles.prevButtonText}>Précédent</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyFooterSpacer} />
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextStep}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 2 ? 'Enregistrer la commande' : 'Suivant'}
          </Text>
          <Icon
            name={currentStep === 2 ? 'checkmark-circle-outline' : 'chevron-forward-outline'}
            size={20}
            color="#FFFFFF"
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    height: 56,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  contentContainer: {
    flex: 1,
  },
  footer: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  prevButtonIcon: {
    marginRight: 4,
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyFooterSpacer: {
    flex: 0.3,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2583E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#E2583E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  nextButtonIcon: {
    marginLeft: 6,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});