import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const AUTH_USER_KEY = '@smart_tailor_user';

export const checkIsLoggedIn = async (): Promise<boolean> => {
  try {
    const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (!userJson) {
      return false;
    }

    // Essayer de rafraîchir silencieusement la session Google si possible
    try {
      await GoogleSignin.signInSilently();
    } catch {
      // Ignorer l'erreur réseau en mode hors ligne (Offline-First Absolu)
    }

    return true;
  } catch {
    return false;
  }
};

export const saveUserSession = async (userInfo: unknown): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session :', error);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Erreur lors de la déconnexion Google :', error);
  }
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression de la session :', error);
  }
};
