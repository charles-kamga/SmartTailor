import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Import de l'architecture de navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import de l'initialisation de la DB locale
import { initDatabase } from './src/database/database';

// Import du service de synchronisation automatique
import { lancerSynchronisation } from './src/services/syncService';

export default function App() {
  
  useEffect(() => {
    // 1. Initialise la base de données locale au démarrage
    initDatabase();

    // 2. Configuration de Google Sign-In
    GoogleSignin.configure({
      webClientId: '360800159469-thg879nu29nib61rph822jtbjkol8ilf.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    // 3. Mettre en place l'écouteur de changements de connexion réseau
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('=== ÉTAT DU RÉSEAU MODIFIÉ ===', {
        type: state.type, // 'wifi', 'cellular', 'none'
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      // Si le téléphone repasse en ligne avec un accès internet fonctionnel
      if (state.isConnected && state.isInternetReachable) {
        console.log('Connexion internet fonctionnelle détectée. Lancement de la synchronisation...');
        lancerSynchronisation();
      }
    });

    // Nettoyage de l'écouteur lors de la fermeture de l'application
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
