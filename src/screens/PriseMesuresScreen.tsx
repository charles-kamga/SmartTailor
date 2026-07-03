import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';
import { enregistrerNouveauClientAvecCommande } from '../database/queries';
import { db } from '../database/database';

// Génération des chiffres de 10 à 90 et de 100 à 190 avec un pas de 5
const TRANCHE_BASSE = Array.from({ length: (90 - 10) / 5 + 1 }, (_, i) => 10 + i * 5);
const TRANCHE_HAUTE = Array.from({ length: (190 - 100) / 5 + 1 }, (_, i) => 100 + i * 5);

export default function PriseMesuresScreen({ route, navigation }: any) {
  // Safely destructure all potential parameter names from route.params
  const { 
    clientName, 
    name, 
    clientPhone, 
    phone, 
    selectedModel, 
    selectedModelId,
    modelId 
  } = route.params || {};

  // Resolve the correct values dynamically
  const finalName = clientName || name || 'Client Inconnu';
  const finalPhone = clientPhone || phone || '';
  const finalModelId = selectedModelId || selectedModel || modelId || 'senator';

  const template = GARMENT_TEMPLATES.find((t) => t.id === finalModelId) || GARMENT_TEMPLATES[0];

  const [activeKey, setActiveKey] = useState<string>(template.measurements[0].key);
  const [valeursMesures, setValeursMesures] = useState<Record<string, string>>({});
  const [activeRange, setActiveRange] = useState<'low' | 'high'>('low');
  const [notes, setNotes] = useState('');
  const [photoCommande, setPhotoCommande] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const activeField = template.measurements.find((f) => f.key === activeKey);

  const handleSelectNumber = (value: number) => {
    setValeursMesures((prev) => ({
      ...prev,
      [activeKey]: value.toString(),
    }));

    const currentIndex = template.measurements.findIndex((f) => f.key === activeKey);
    if (currentIndex < template.measurements.length - 1) {
      setActiveKey(template.measurements[currentIndex + 1].key);
    }
  };

  const handleSaveClient = async () => {
    try {
      const totalSaisies = Object.keys(valeursMesures).length;
      if (totalSaisies === 0) {
        Alert.alert('Mesures manquantes', 'Veuillez saisir au moins une mesure avant de valider.');
        return;
      }


      const result = await enregistrerNouveauClientAvecCommande(
        finalName,
        finalPhone,
        finalModelId,
        valeursMesures,
        notes,
        photoCommande,
        null
      );

      Alert.alert(
        'Commande enregistrée !',
        `Le client ${finalName} a bien été enregistré. Date de livraison estimée : ${result.dateLivraison}`,
        [{ text: 'Super', onPress: () => navigation.navigate('MainApp') }]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error);
      Alert.alert('Erreur de sauvegarde', 'Impossible d’enregistrer la commande dans la base de données locale.');
    }
  };

  const numbersToDisplay = activeRange === 'low' ? TRANCHE_BASSE : TRANCHE_HAUTE;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* 1. En-tête personnalisé */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{finalName}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 2. Scrollable Display Section */}
      <ScrollView
        style={styles.displaySection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.infoText}>
          Saisie : <Text style={styles.boldText}>{template.name}</Text> (Tapez sur un élément pour le modifier)
        </Text>

        <View style={styles.chipsContainer}>
          {template.measurements.map((field) => {
            const isActive = field.key === activeKey;
            const valeur = valeursMesures[field.key] || '--';
            return (
              <TouchableOpacity
                key={field.key}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                onPress={() => {
                  setActiveKey(field.key);
                  setIsKeyboardOpen(true);
                }}
              >
                <Text style={[styles.chipLabel, isActive ? styles.chipLabelActive : styles.chipLabelInactive]}>{field.key}</Text>
                <Text style={[styles.chipValue, isActive ? styles.chipValueActive : styles.chipValueInactive]}>
                  {valeur} <Text style={styles.unitText}>cm</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeField && (
          <View style={styles.activeFieldHelper}>
            <Icon name="pencil" size={16} color="#E2583E" style={styles.helperIcon} />
            <Text style={styles.helperText}>Saisie : {activeField.label}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.footerSaveButton} onPress={handleSaveClient}>
          <Text style={styles.footerSaveButtonText}>Enregistrer la commande</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. Sliding Keyboard Sheet */}
      {isKeyboardOpen && (
        <View style={styles.keyboardSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Saisie : {activeField?.label}</Text>
            <TouchableOpacity onPress={() => setIsKeyboardOpen(false)} style={styles.closeButton}>
              <Icon name="close-circle" size={28} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.keyboardSection}>
            <View style={styles.rangeSelector}>
              <TouchableOpacity
                style={[styles.rangeTab, activeRange === 'low' ? styles.rangeTabActive : styles.rangeTabInactive]}
                onPress={() => setActiveRange('low')}
              >
                <Text style={[styles.rangeTabText, activeRange === 'low' ? styles.rangeTabTextActive : styles.rangeTabTextInactive]}>10 - 90 cm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rangeTab, activeRange === 'high' ? styles.rangeTabActive : styles.rangeTabInactive]}
                onPress={() => setActiveRange('high')}
              >
                <Text style={[styles.rangeTabText, activeRange === 'high' ? styles.rangeTabTextActive : styles.rangeTabTextInactive]}>100 - 190 cm</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.gridScrollContent}>
              <View style={styles.numbersGrid}>
                {numbersToDisplay.map((num) => {
                  const isSelectedValue = valeursMesures[activeKey] === num.toString();
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.gridButton, isSelectedValue ? styles.gridButtonSelected : styles.gridButtonNormal]}
                      onPress={() => handleSelectNumber(num)}
                    >
                      <Text style={[styles.gridButtonText, isSelectedValue ? styles.gridButtonTextSelected : styles.gridButtonTextNormal]}>{num}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  header: { height: 60, backgroundColor: '#1E293B', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  displaySection: { flex: 1, padding: 16 },
  infoText: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  boldText: { fontWeight: 'bold', color: '#1E293B' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 24 },
  chip: { width: '30%', height: 64, justifyContent: 'center',   alignItems: 'center', margin: '1.5%', borderWidth: 5,   borderColor: '#0057ca', elevation: 1 },
  chipActive: { borderColor: '#E2583E' },
  chipInactive: { borderColor: '#E2E8F0' },
  chipLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  chipLabelActive: { color: '#E2583E' },
  chipLabelInactive: { color: '#94A3B8' },
  chipValue: { fontSize: 16, fontWeight: 'bold' },
  chipValueActive: { color: '#E2583E' },
  chipValueInactive: { color: '#475569' },
  unitText: { fontSize: 10, fontWeight: 'normal', color: '#94A3B8' },
  activeFieldHelper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7F5', borderRadius: 8, padding: 10, alignSelf: 'center', borderWidth: 0.5, borderColor: '#FDBA74' },
  helperIcon: { marginRight: 6 },
  helperText: { fontSize: 14, fontWeight: '600', color: '#C2410C' },
  notesSection: { marginTop: 24, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B', letterSpacing: 1, marginBottom: 12 },
  annotationsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  annotationChip: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  annotationText: { fontSize: 12, color: '#475569' },
  notesInput: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, height: 80, fontSize: 14, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', textAlignVertical: 'top' },
  footerSaveButton: { height: 52, backgroundColor: '#A04000', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 24, elevation: 3 },
  footerSaveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  keyboardSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20, paddingBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  closeButton: { padding: 4 },
  keyboardSection: { paddingTop: 16 },
  rangeSelector: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  rangeTab: { flex: 1, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  rangeTabActive: { backgroundColor: '#FFF7F5', borderColor: '#E2583E' },
  rangeTabInactive: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  rangeTabText: { fontSize: 14, fontWeight: 'bold' },
  rangeTabTextActive: { color: '#E2583E' },
  rangeTabTextInactive: { color: '#64748B' },
  gridScrollContent: { paddingHorizontal: 12, paddingBottom: 24 },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  gridButton: { width: '22%', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: '1.5%', borderWidth: 1 },
  gridButtonSelected: { backgroundColor: '#E2583E', borderColor: '#E2583E' },
  gridButtonNormal: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  gridButtonText: { fontSize: 16, fontWeight: 'bold' },
  gridButtonTextSelected: { color: '#FFFFFF' },
  gridButtonTextNormal: { color: '#334155' },
});