import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserData } from '../../types/palmReading';

interface BirthDetailsStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const BirthDetailsStep: React.FC<BirthDetailsStepProps> = ({ onNext, userData, setUserData }) => {
  const [date, setDate] = useState(userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date());
  const [timeOfBirth, setTimeOfBirth] = useState(userData.timeOfBirth || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setUserData({ 
      ...userData, 
      dateOfBirth: date.toISOString().split('T')[0],
      timeOfBirth 
    });
    onNext();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When were you born?</Text>
      <Text style={styles.subtitle}>This helps us create your accurate palm reading</Text>
      
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Date of Birth: {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
      
      <TextInput
        style={styles.input}
        value={timeOfBirth}
        onChangeText={setTimeOfBirth}
        placeholder="Time of Birth (optional) - e.g., 14:30"
        placeholderTextColor="#999"
      />
      
      <Text style={styles.hint}>
        💡 Tip: Including time of birth provides more accurate readings
      </Text>
      
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
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