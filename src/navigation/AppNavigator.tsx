import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import de la bibliothèque d'icônes
import Icon from 'react-native-vector-icons/Ionicons';

// Import des types et écrans
import { RootStackParamList, BottomTabParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import CommandesScreen from '../screens/CommandesScreen';
import NouvelleCommandeScreen from '../screens/NouvelleCommandeScreen';
import { checkIsLoggedIn } from '../services/authService';

function CataloguePlaceholder() {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Catalogue des Modèles</Text>
    </View>
  );
}

const renderAtelierIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="home-outline" size={size} color={color} />
);

const renderClientsIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="people-outline" size={size} color={color} />
);

const renderCatalogueIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="book-outline" size={size} color={color} />
);

const renderCommandesIcon = ({ color, size }: { color: string; size: number }) => (
  <Icon name="briefcase-outline" size={size} color={color} />
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E2583E', // Terracotta atelier
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Atelier"
        component={DashboardScreen}
        options={{ tabBarIcon: renderAtelierIcon }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{ tabBarIcon: renderClientsIcon }}
      />
      <Tab.Screen
        name="Catalogue"
        component={CataloguePlaceholder}
        options={{ tabBarIcon: renderCatalogueIcon }}
      />
      <Tab.Screen
        name="Commandes"
        component={CommandesScreen}
        options={{ tabBarIcon: renderCommandesIcon }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const loggedIn = await checkIsLoggedIn();
      setIsLoggedIn(loggedIn);
      setLoading(false);
    };
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E2583E" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? 'MainApp' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen name="NouvelleCommande" component={NouvelleCommandeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 5,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});