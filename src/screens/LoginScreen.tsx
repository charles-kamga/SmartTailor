import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }: any) {
  
  const handleGoogleSignIn = async () => {
    try {
      // 1. Vérifie si les services Google Play sont disponibles sur l'émulateur
      await GoogleSignin.hasPlayServices();
      
      // 2. Lance la boîte de dialogue de connexion Google
      const response = await GoogleSignin.signIn();
      
      console.log('=== CONNEXION RÉUSSIE ===');
      // On affiche les données reçues dans les logs Metro pour vérification
      console.log('Détails de l’utilisateur :', JSON.stringify(response, null, 2));
      
      // 3. Récupère les jetons d'accès (Tokens) requis pour Google Drive/Sheets
      const tokens = await GoogleSignin.getTokens();
      console.log('Access Token récupéré avec succès !');
      // console.log('Token d’accès :', tokens.accessToken); // Utile pour les futurs appels API

      // 4. Redirige vers l'application principale
      navigation.navigate('MainApp');
    } catch (error: any) {
      console.log('=== ERREUR DE CONNEXION ===');
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('L’utilisateur a annulé le processus de connexion.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('La connexion est déjà en cours de traitement.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Les services Google Play ne sont pas disponibles sur cet appareil.');
      } else {
        // Affiche l'erreur brute et des conseils de diagnostic
        console.log('Détails de l’erreur :', error);
        console.log('Message d’erreur :', error.message);
        console.log('Code de l’erreur :', error.code);
        
        if (error.code === '10' || error.code === '12500') {
          console.log(
            '👉 Conseil de diagnostic : L’erreur 10 ou 12500 indique généralement un problème de signature SHA-1 dans la console Google Cloud, ou que votre webClientId est incorrect dans le fichier de code.'
          );
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      
      {/* 1. Zone Logo & En-tête */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Icon name="ruler-outline" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>SmartTailor</Text>
        <Text style={styles.subtitle}>Faciliter la gestion de vos commandes</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: -70 }}>
        {/* 2. Illustration centrale */}
        <View style={styles.illustrationSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1528570188006-440a558509b5?auto=format&fit=crop&w=600&q=80' }}
            style={styles.illustrationImage}
            resizeMode="cover"
          />
          <Text style={styles.caption}>
            Gérez votre atelier avec élégance et précision.
          </Text>
        </View>

        {/* 3. Zone d'actions (Bouton Google) */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Image source={require('../assets/google-logo.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>S'inscrire avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerLink} onPress={handleGoogleSignIn}>
            <Text style={styles.footerTextNormal}>Vous avez déjà un compte ? </Text>
            <Text style={styles.footerTextLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  illustrationImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  caption: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTextNormal: {
    fontSize: 14,
    color: '#64748B',
  },
  footerTextLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2583E',
    textDecorationLine: 'underline',
  },
}); 