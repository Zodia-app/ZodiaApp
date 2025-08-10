import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { UserData } from '../../types/palmReading';

interface PlaceOfBirthStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const PlaceOfBirthStep: React.FC<PlaceOfBirthStepProps> = ({ onNext, userData, setUserData }) => {
  const [city, setCity] = useState(userData.placeOfBirth?.city || '');
  const [state, setState] = useState(userData.placeOfBirth?.state || '');
  const [country, setCountry] = useState(userData.placeOfBirth?.country || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!city.trim() || !country.trim()) {
      setError('City and country are required');
      return;
    }
    setUserData({ 
      ...userData, 
      placeOfBirth: { 
        city: city.trim(), 
        state: state.trim(), 
        country: country.trim() 
      }
    });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where were you born?</Text>
      <Text style={styles.subtitle}>This helps us align your reading with cosmic energies</Text>
      
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="City *"
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        value={state}
        onChangeText={setState}
        placeholder="State/Province (optional)"
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Country *"
        placeholderTextColor="#999"
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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