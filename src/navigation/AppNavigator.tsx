import React from 'react';
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
import NouveauClientScreen from '../screens/NouveauClientScreen';
import PriseMesuresScreen from '../screens/PriseMesuresScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import AjouterModeleScreen from '../screens/AjouterModeleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E2583E', // Orange/terracotta
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { backgroundColor: '#FFFFFF', paddingBottom: 5, height: 60 },
        // Configuration dynamique des icônes pour chaque onglet
        tabBarIcon: ({ color, size }) => {
          let iconName = 'alert-circle-outline';

          if (route.name === 'Atelier') {
            iconName = 'home-outline';
          } else if (route.name === 'Clients') {
            iconName = 'people-outline';
          } else if (route.name === 'Catalogue') {
            iconName = 'book-outline';
          } else if (route.name === 'Commandes') {
            iconName = 'briefcase-outline';
          }

          // Retourne le composant icône configuré
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Atelier" component={DashboardScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Catalogue" component={CatalogueScreen} />
      <Tab.Screen name="Commandes" component={CommandesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen name="NouveauClient" component={NouveauClientScreen} />
      <Stack.Screen name="PriseMesures" component={PriseMesuresScreen} />
      <Stack.Screen name="AjouterModele" component={AjouterModeleScreen} />
    </Stack.Navigator>
  );
}