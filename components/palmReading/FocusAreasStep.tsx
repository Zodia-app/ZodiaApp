import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PalmReadingData } from '../../types/palmReading';

interface FocusAreasStepProps {
  onNext: () => void;
  palmData: Partial<PalmReadingData>;
  setPalmData: (data: Partial<PalmReadingData>) => void;
}

export const FocusAreasStep: React.FC<FocusAreasStepProps> = ({ onNext, palmData, setPalmData }) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(palmData.focusAreas || []);
  const [error, setError] = useState('');

  const focusOptions = [
    { value: 'love', label: 'Love & Relationships', icon: 'heart', color: '#e74c3c' },
    { value: 'career', label: 'Career & Success', icon: 'briefcase', color: '#3498db' },
    { value: 'health', label: 'Health & Wellness', icon: 'fitness', color: '#2ecc71' },
    { value: 'spirituality', label: 'Spiritual Growth', icon: 'moon', color: '#9b59b6' },
    { value: 'finance', label: 'Finance & Abundance', icon: 'cash', color: '#f39c12' },
  ];

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleSubmit = () => {
    if (selectedAreas.length === 0) {
      setError('Please select at least one focus area');
      return;
    }
    setPalmData({ ...palmData, focusAreas: selectedAreas });
    onNext();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>What areas interest you?</Text>
      <Text style={styles.subtitle}>Select all that apply - we'll focus on these in your reading</Text>
      
      <View style={styles.optionsContainer}>
        {focusOptions.map((option) => {
          const isSelected = selectedAreas.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, isSelected && styles.selectedCard]}
              onPress={() => toggleArea(option.value)}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={isSelected ? option.color : '#666'} 
                />
              </View>
              <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#6B46C1" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.button, selectedAreas.length === 0 && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={selectedAreas.length === 0}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedCard: {
    borderColor: '#6B46C1',
    backgroundColor: '#f3f0ff',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedLabel: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginBottom: 10,
  },
});