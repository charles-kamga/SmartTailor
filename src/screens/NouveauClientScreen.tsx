import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';
import { recupererModelesCatalogueParType } from '../database/queries';

const MODELES = GARMENT_TEMPLATES;

interface CatalogueItem {
  id: number;
  garment_type_id: string;
  title: string;
  image_path: string;
}

export default function NouveauClientScreen({ navigation }: any) {
  const [nomComplet, setNomComplet] = useState('');
  const [telephone, setTelephone] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(GARMENT_TEMPLATES[0].id);
  const [catalogueModeles, setCatalogueModeles] = useState<CatalogueItem[]>([]);
  const [catalogueSelectionneId, setCatalogueSelectionneId] = useState<number | null>(null);

  const activeTemplate = GARMENT_TEMPLATES.find(t => t.id === selectedModelId);

  // Charger les modèles du catalogue pour le type sélectionné
  const chargerModelesCatalogue = useCallback(async (typeId: string) => {
    try {
      const modeles = await recupererModelesCatalogueParType(typeId);
      setCatalogueModeles(modeles);
      // Réinitialiser la sélection si le type change
      setCatalogueSelectionneId(null);
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
      setCatalogueModeles([]);
    }
  }, []);

  useEffect(() => {
    chargerModelesCatalogue(selectedModelId);
  }, [selectedModelId, chargerModelesCatalogue]);

  const handleProceedToMeasurements = () => {
    // Validation simple avant de continuer
    if (!nomComplet.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le nom complet du client.');
      return;
    }
    if (!telephone.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir le numéro de téléphone.');
      return;
    }

    // Navigation vers l'écran de prise de mesures en lui transmettant les données
    navigation.navigate('PriseMesures', {
      clientName: nomComplet,
      clientPhone: telephone,
      selectedModel: selectedModelId,
      catalogueModeleId: catalogueSelectionneId,
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      
      {/* 1. En-tête personnalisé */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Client</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 2. Section Informations Générales */}
          <Text style={styles.sectionLabel}>INFORMATIONS GÉNÉRALES</Text>
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor="#94A3B8"
              value={nomComplet}
              onChangeText={setNomComplet}
            />

            <Text style={[styles.inputLabel, styles.marginTopInput]}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+237 6 12 34 56 78"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={telephone}
              onChangeText={setTelephone}
            />
          </View>

          {/* 3. Section Modèle à Confectionner */}
          <Text style={styles.sectionLabel}>MODÈLE À CONFECTIONNER</Text>
          <Text style={styles.subSectionLabel}>Type de vêtement</Text>
            <ScrollView 
              horizontal={true} 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.matrixContainer}
            >
              {MODELES.map((template) => {
                const isActive = selectedModelId === template.id;
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.modelTab, isActive ? styles.modelTabActive : styles.modelTabInactive]}
                    onPress={() => setSelectedModelId(template.id)}
                  >
                    <Text style={[styles.modelTabText, isActive ? styles.modelTabTextActive : styles.modelTabTextInactive]}>
                      {template.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Carrousel des modèles du catalogue pour le type sélectionné */}
            {catalogueModeles.length > 0 && (
              <View style={styles.catalogueSection}>
                <Text style={styles.catalogueSectionLabel}>MES MODÈLES</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catalogueCarrousel}
                >
                  {catalogueModeles.map((modele) => {
                    const estSelectionne = catalogueSelectionneId === modele.id;
                    return (
                      <TouchableOpacity
                        key={modele.id}
                        style={[
                          styles.carteCatalogue,
                          estSelectionne && styles.carteCatalogueActif,
                        ]}
                        onPress={() =>
                          setCatalogueSelectionneId(
                            estSelectionne ? null : modele.id
                          )
                        }
                      >
                        <Image
                          source={{ uri: modele.image_path }}
                          style={styles.carteCatalogueImage}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            styles.carteCatalogueTitre,
                            estSelectionne && styles.carteCatalogueTitreActif,
                          ]}
                          numberOfLines={1}
                        >
                          {modele.title}
                        </Text>
                        {estSelectionne && (
                          <View style={styles.carteCheckBadge}>
                            <Icon name="checkmark-circle" size={24} color="#E2583E" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {activeTemplate && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Aperçu du style : {activeTemplate.name}</Text>
                <Image 
                  source={{
                    uri:
                      catalogueSelectionneId !== null
                        ? (catalogueModeles.find(
                            (m) => m.id === catalogueSelectionneId
                          )?.image_path ?? activeTemplate.illustrationUrl)
                        : activeTemplate.illustrationUrl,
                  }}
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
                <Text style={styles.previewDescription}>
                  {activeTemplate.description}
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

      {/* 4. Bouton d'action principal en bas */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleProceedToMeasurements}
          activeOpacity={0.8}
        >
          <Icon name="chevron-forward-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Prendre les mesures</Text>
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
    height: 60,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRightPlaceholder: {
    width: 32, // Permet de centrer parfaitement le titre
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  marginTopInput: {
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FCFDFD',
  },
  subSectionLabel: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 12,
  },
   matrixContainer: {
     height: 170,
     flexDirection: 'column',
     flexWrap: 'wrap',
   },
   modelTab: {
     width: 140,
     height: 50,
     borderRadius: 12,
     justifyContent: 'center',
     alignItems: 'center',
     margin: 4,
     borderWidth: 1,
   },
  modelTabActive: {
    backgroundColor: '#FDF2F0', // Orange très clair
    borderColor: '#E2583E', // Bordure terracotta
  },
  modelTabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  modelTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modelTabTextActive: {
    color: '#E2583E',
  },
   modelTabTextInactive: {
     color: '#64748B',
   },
   previewCard: {
     backgroundColor: '#FFFFFF',
     borderRadius: 16,
     padding: 16,
     marginTop: 24,
     elevation: 2,
     shadowColor: '#000000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
   },
   previewTitle: {
     fontSize: 15,
     fontWeight: 'bold',
     color: '#1E293B',
     marginBottom: 12,
     textAlign: 'center',
   },
   previewImage: {
     width: '100%',
     height: 140,
     borderRadius: 12,
     marginBottom: 12,
   },
   previewDescription: {
     fontSize: 13,
     color: '#475569',
     fontStyle: 'italic',
     textAlign: 'center',
     lineHeight: 18,
   },
   footer: {
     padding: 16,

    backgroundColor: '#FAF8F5',
  },
  actionButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#A04000', // Terracotta sombre
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  catalogueSection: {
    marginTop: 16,
  },
  catalogueSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  catalogueCarrousel: {
    gap: 10,
    paddingRight: 16,
  },
  carteCatalogue: {
    width: 110,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  carteCatalogueActif: {
    borderColor: '#E2583E',
  },
  carteCatalogueImage: {
    width: '100%',
    height: 90,
    backgroundColor: '#F1F5F9',
  },
  carteCatalogueTitre: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
  },
  carteCatalogueTitreActif: {
    color: '#E2583E',
    fontWeight: '600',
  },
  carteCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});