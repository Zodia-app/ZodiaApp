import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PalmReadingData } from '../../types/palmReading';

interface AdditionalDetailsStepProps {
  onNext: () => void;
  palmData: Partial<PalmReadingData>;
  setPalmData: (data: Partial<PalmReadingData>) => void;
}

export const AdditionalDetailsStep: React.FC<AdditionalDetailsStepProps> = ({ onNext, palmData, setPalmData }) => {
  const [struggles, setStruggles] = useState(palmData.struggles || '');
  const [goals, setGoals] = useState(palmData.goals || '');

  const handleSubmit = () => {
    setPalmData({ 
      ...palmData, 
      struggles,
      goals
    });
    onNext();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Share more details (optional)</Text>
      <Text style={styles.subtitle}>Help us provide deeper insights</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current challenges or struggles</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={struggles}
          onChangeText={setStruggles}
          placeholder="What challenges are you facing right now?"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Goals and aspirations</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={goals}
          onChangeText={setGoals}
          placeholder="What do you hope to achieve?"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity style={styles.skipButton} onPress={handleSubmit}>
        <Text style={styles.skipText}>Skip this step</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Generate My Reading</Text>
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
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});