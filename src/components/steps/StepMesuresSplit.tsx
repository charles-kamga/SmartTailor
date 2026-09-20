import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { GARMENT_TEMPLATES } from '../../database/garmentTemplates';

type Mesure = Record<string, string>;

type Props = {
  garmentId: string;
  mesures: Mesure;
  onChange: (m: Mesure) => void;
  onSubmit?: () => void;
};

export default function StepMesuresSplit({ garmentId, mesures, onChange }: Props) {
  const template = GARMENT_TEMPLATES.find((t) => t.id === garmentId);
  const measurements = template?.measurements || [];
  const mesureKeys = measurements.map((m) => m.key);

  const [localMesures, setLocalMesures] = useState<Mesure>(mesures);
  const [selectedKey, setSelectedKey] = useState<string>(mesureKeys[0] || '');
  const [inputValue, setInputValue] = useState<string>(mesures[mesureKeys[0]] || '');

  // Calcul responsive pour adapter l'écran aux smartphones d'atelier
  const windowHeight = Dimensions.get('window').height;
  const topHeight = Math.round(windowHeight * 0.48);
  const bottomHeight = Math.round(windowHeight * 0.38);

  const selectedMeasurement = measurements.find((m) => m.key === selectedKey);

  const handleSelectField = (key: string) => {
    setSelectedKey(key);
    setInputValue(localMesures[key] || '');
  };

  const handleKeyPress = (digit: string) => {
    if (!selectedKey) return;
    if (inputValue.length >= 3) return; // Limite raisonnable en cm (ex: max 999 cm)

    const nextVal = inputValue + digit;
    setInputValue(nextVal);

    const updated = { ...localMesures, [selectedKey]: nextVal };
    setLocalMesures(updated);
    onChange(updated);
  };

  const handleBackspace = () => {
    if (!selectedKey) return;
    const nextVal = inputValue.slice(0, -1);
    setInputValue(nextVal);

    const updated = { ...localMesures };
    if (nextVal) {
      updated[selectedKey] = nextVal;
    } else {
      delete updated[selectedKey];
    }
    setLocalMesures(updated);
    onChange(updated);
  };

  const handleValidateAndNext = () => {
    // Passer au champ suivant
    const currentIndex = mesureKeys.indexOf(selectedKey);
    if (currentIndex >= 0 && currentIndex < mesureKeys.length - 1) {
      const nextKey = mesureKeys[currentIndex + 1];
      setSelectedKey(nextKey);
      setInputValue(localMesures[nextKey] || '');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Panneau Supérieur : Liste des mesures à prendre */}
      <View style={[styles.topPane, { height: topHeight }]}>
        <View style={styles.activeHeader}>
          <Text style={styles.activeHeaderSubtitle}>Mesure sélectionnée :</Text>
          <Text style={styles.activeHeaderTitle}>
            {selectedMeasurement ? `${selectedMeasurement.label}` : 'Sélectionnez une mesure'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {measurements.map((m) => {
            const isSelected = m.key === selectedKey;
            const val = localMesures[m.key];

            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.row, isSelected && styles.rowSelected]}
                onPress={() => handleSelectField(m.key)}
                activeOpacity={0.7}
              >
                <View style={styles.fieldInfo}>
                  <View style={[styles.codeBadge, isSelected && styles.codeBadgeSelected]}>
                    <Text style={[styles.codeText, isSelected && styles.codeTextSelected]}>
                      {m.key}
                    </Text>
                  </View>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {m.label}
                  </Text>
                </View>

                <View style={styles.valueWrapper}>
                  <Text style={[styles.valueText, isSelected && styles.valueTextSelected]}>
                    {val || '—'}
                  </Text>
                  {val ? <Text style={styles.unitText}>cm</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Panneau Inférieur : Pavé numérique d'atelier */}
      <View style={[styles.bottomPane, { height: bottomHeight }]}>
        <View style={styles.keypadDisplay}>
          <Text style={styles.keypadDisplayLabel}>Valeur saisie :</Text>
          <Text style={styles.keypadDisplayValue}>
            {inputValue ? `${inputValue} cm` : '--'}
          </Text>
        </View>

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.key}
              onPress={() => handleKeyPress(String(n))}
              activeOpacity={0.6}
            >
              <Text style={styles.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}

          {/* Touche Retour arrière */}
          <TouchableOpacity
            style={[styles.key, styles.keySpecial]}
            onPress={handleBackspace}
            activeOpacity={0.6}
          >
            <Text style={styles.keySpecialText}>⌫</Text>
          </TouchableOpacity>

          {/* Touche 0 */}
          <TouchableOpacity
            style={styles.key}
            onPress={() => handleKeyPress('0')}
            activeOpacity={0.6}
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>

          {/* Touche Suivant / Validation */}
          <TouchableOpacity
            style={[styles.key, styles.keyValidate]}
            onPress={handleValidateAndNext}
            activeOpacity={0.6}
          >
            <Text style={styles.keyValidateText}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topPane: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  activeHeader: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  activeHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2583E',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  rowSelected: {
    backgroundColor: '#FFF7F5',
    borderWidth: 1.5,
    borderColor: '#E2583E',
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  codeBadgeSelected: {
    backgroundColor: '#E2583E',
  },
  codeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  codeTextSelected: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  labelSelected: {
    fontWeight: 'bold',
    color: '#E2583E',
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
  },
  valueTextSelected: {
    fontSize: 18,
    color: '#E2583E',
  },
  unitText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 3,
  },
  bottomPane: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  keypadDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  keypadDisplayLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  keypadDisplayValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2583E',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: '31%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  keyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  keySpecial: {
    backgroundColor: '#F1F5F9',
  },
  keySpecialText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
  },
  keyValidate: {
    backgroundColor: '#10B981',
  },
  keyValidateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});