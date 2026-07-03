import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CommandesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Suivi des Commandes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F5' },
  text: { fontSize: 18, color: '#1E293B' }
});