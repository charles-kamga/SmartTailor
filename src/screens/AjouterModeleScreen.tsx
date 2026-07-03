import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { GARMENT_TEMPLATES } from '../database/garmentTemplates';
import { insererModeleCatalogue } from '../database/queries';

/**
 * Copie physiquement un fichier temporaire (photo) vers le dossier permanent
 * privé de l'application, puis retourne le chemin permanent.
 *
 * Android supprime les fichiers temporaires du cache régulièrement.
 * Sans cette copie, les photos disparaîtraient après quelques jours.
 */
const copierPhotoVersStockagePermanent = async (uri: string): Promise<string> => {
  const dossierCatalogue = `${RNFS.ExternalDirectoryPath}/Catalogue`;

  // 1. Créer le dossier s'il n'existe pas
  const dossierExiste = await RNFS.exists(dossierCatalogue);
  if (!dossierExiste) {
    await RNFS.mkdir(dossierCatalogue);
  }

  // 2. Déterminer l'extension et le nom de fichier unique
  const extension = uri.toLowerCase().endsWith('.png') ? '.png' : '.jpg';
  const timestamp = Date.now();
  const nomFichier = `modele_${timestamp}${extension}`;
  const cheminFinal = `${dossierCatalogue}/${nomFichier}`;

  // 3. Copier le fichier selon le type d'URI
  if (uri.startsWith('content://')) {
    // URI de la Galerie (Android 10+) — lecture via ContentResolver brute
    const contenuBase64 = await RNFS.readFile(uri, 'base64');
    await RNFS.writeFile(cheminFinal, contenuBase64, 'base64');
  } else {
    // URI de l'appareil photo (file://) — copie directe
    const cheminSource = uri.replace('file://', '');
    await RNFS.copyFile(cheminSource, cheminFinal);
  }

  console.log('=== PHOTO COPIÉE VERS PERMANENT ===', cheminFinal);
  return cheminFinal;
};

export default function AjouterModeleScreen() {
  const navigation = useNavigation();
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState(GARMENT_TEMPLATES[0]?.id ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  const ouvrirCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erreur', `Impossible d'ouvrir l'appareil photo : ${response.errorMessage}`);
          return;
        }
        if (response.assets?.[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const ouvrirGalerie = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erreur', `Impossible d'ouvrir la galerie : ${response.errorMessage}`);
          return;
        }
        if (response.assets?.[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const choisirImage = () => {
    Alert.alert('Ajouter une photo', 'Choisissez une source', [
      { text: '📷 Appareil photo', onPress: ouvrirCamera },
      { text: '🖼️ Galerie', onPress: ouvrirGalerie },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const valider = async () => {
    if (!titre.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un titre pour le modèle.');
      return;
    }
    if (!imageUri) {
      Alert.alert('Photo requise', 'Veuillez prendre ou choisir une photo.');
      return;
    }

    setSauvegardeEnCours(true);
    try {
      // Étape critique : copier la photo du cache temporaire vers le dossier permanent
      const cheminPermanent = await copierPhotoVersStockagePermanent(imageUri);

      // Étape finale : sauvegarder le chemin permanent dans SQLite
      const insertId = await insererModeleCatalogue(categorie, titre.trim(), cheminPermanent);

      if (insertId !== null) {
        Alert.alert('✅ Succès', `"${titre.trim()}" ajouté au catalogue !`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erreur', "Impossible d'enregistrer le modèle en base de données.");
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du modèle :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSauvegardeEnCours(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenu}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitre}>Nouveau modèle</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Titre du modèle */}
      <Text style={styles.label}>Titre du modèle</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Sénateur broderie or"
        placeholderTextColor="#94A3B8"
        value={titre}
        onChangeText={setTitre}
      />

      {/* Catégorie */}
      <Text style={styles.label}>Catégorie de vêtement</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesConteneur}
      >
        {GARMENT_TEMPLATES.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.categoriePillule, categorie === t.id && styles.categoriePilluleActif]}
            onPress={() => setCategorie(t.id)}
          >
            <Text
              style={[styles.categorieTexte, categorie === t.id && styles.categorieTexteActif]}
            >
              {t.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Zone photo cliquable */}
      <Text style={styles.label}>Photo du modèle fini</Text>
      <TouchableOpacity style={styles.zonePhoto} onPress={choisirImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photoApercu} resizeMode="cover" />
        ) : (
          <View style={styles.zonePhotoPlaceholder}>
            <Icon name="camera-outline" size={52} color="#94A3B8" />
            <Text style={styles.zonePhotoTexte}>
              Appuyez pour prendre une photo{'\n'}ou choisir depuis la galerie
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Bouton de validation */}
      <TouchableOpacity
        style={[styles.boutonValider, (!titre.trim() || !imageUri) && styles.boutonValiderDesactive]}
        onPress={valider}
        disabled={!titre.trim() || !imageUri || sauvegardeEnCours}
      >
        {sauvegardeEnCours ? (
          <View style={styles.chargeur}>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.boutonValiderTexte}>  Sauvegarde en cours…</Text>
          </View>
        ) : (
          <Text style={styles.boutonValiderTexte}>Enregistrer le modèle</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contenu: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  boutonRetour: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  categoriesConteneur: {
    gap: 8,
    marginBottom: 20,
  },
  categoriePillule: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoriePilluleActif: {
    backgroundColor: '#E2583E',
  },
  categorieTexte: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  categorieTexteActif: {
    color: '#FFFFFF',
  },
  zonePhoto: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 32,
  },
  zonePhotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zonePhotoTexte: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  photoApercu: {
    width: '100%',
    height: '100%',
  },
  boutonValider: {
    backgroundColor: '#E2583E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  boutonValiderDesactive: {
    opacity: 0.5,
  },
  boutonValiderTexte: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chargeur: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
