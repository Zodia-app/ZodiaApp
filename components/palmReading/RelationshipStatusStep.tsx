import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserData } from '../../types/palmReading';

interface RelationshipStatusStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const RelationshipStatusStep: React.FC<RelationshipStatusStepProps> = ({ onNext, userData, setUserData }) => {
  const [status, setStatus] = useState(userData.relationshipStatus || '');
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'single', label: 'Single', emoji: '💫' },
    { value: 'relationship', label: 'In a relationship', emoji: '💕' },
    { value: 'married', label: 'Married', emoji: '💍' },
    { value: 'divorced', label: 'Divorced', emoji: '🌱' },
    { value: 'widowed', label: 'Widowed', emoji: '🕊️' },
    { value: 'complicated', label: "It's complicated", emoji: '🌊' },
  ];

  const handleSubmit = () => {
    if (!status) {
      setError('Please select your relationship status');
      return;
    }
    setUserData({ ...userData, relationshipStatus: status });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your relationship status?</Text>
      <Text style={styles.subtitle}>This helps us focus on relevant life aspects</Text>
      
      <View style={styles.optionsContainer}>
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              status === option.value && styles.selectedOption,
            ]}
            onPress={() => setStatus(option.value)}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[
              styles.optionText,
              status === option.value && styles.selectedText,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.button, !status && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={!status}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#6B46C1',
    backgroundColor: '#f3f0ff',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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