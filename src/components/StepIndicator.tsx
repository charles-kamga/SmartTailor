import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <React.Fragment key={label}>
            {/* Ligne d'interconnexion (sauf avant le 1er élément) */}
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  isCompleted || isActive ? styles.lineActive : styles.lineInactive,
                ]}
              />
            )}

            {/* Cercle numéroté/coché + Label */}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                  !isCompleted && !isActive && styles.circleInactive,
                ]}
              >
                {isCompleted ? (
                  <Icon name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      isActive && styles.circleTextActive,
                      !isActive && !isCompleted && styles.circleTextInactive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isCompleted && styles.labelCompleted,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  circleCompleted: {
    backgroundColor: '#10B981',
  },
  circleActive: {
    backgroundColor: '#E2583E',
    elevation: 2,
    shadowColor: '#E2583E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  circleInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  circleText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  circleTextActive: {
    color: '#FFFFFF',
  },
  circleTextInactive: {
    color: '#94A3B8',
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  labelActive: {
    color: '#E2583E',
    fontWeight: 'bold',
  },
  labelCompleted: {
    color: '#10B981',
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: -16, // Aligne la ligne avec le centre des cercles
    marginHorizontal: 4,
    zIndex: 1,
  },
  lineActive: {
    backgroundColor: '#10B981',
  },
  lineInactive: {
    backgroundColor: '#E2E8F0',
  },
});
