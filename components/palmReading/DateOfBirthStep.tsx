import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  TextInput
} from 'react-native';

interface DateOfBirthStepProps {
  onNext: () => void;
  userData: any;
  setUserData: (data: any) => void;
}

export const DateOfBirthStep: React.FC<DateOfBirthStepProps> = ({ 
  onNext, 
  userData, 
  setUserData 
}) => {
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState(userData.dateOfBirth ? new Date(userData.dateOfBirth).getDate().toString() : '');
  const [month, setMonth] = useState(userData.dateOfBirth ? (new Date(userData.dateOfBirth).getMonth() + 1).toString() : '');
  const [year, setYear] = useState(userData.dateOfBirth ? new Date(userData.dateOfBirth).getFullYear().toString() : '');
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSubmit = () => {
    // Validate inputs
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!day || !month || !year) {
      setError('Please fill in all fields');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError('Please enter a valid month');
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      setError('Please enter a valid day');
      return;
    }

    if (yearNum < 1900 || yearNum > currentYear) {
      setError('Please enter a valid year');
      return;
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    
    // Check if date is valid
    if (date.getDate() !== dayNum) {
      setError('Please enter a valid date');
      return;
    }

    const age = currentYear - yearNum;
    if (age > 120) {
      setError('Please enter a valid birth date');
      return;
    }
    
    setUserData({ ...userData, dateOfBirth: date });
    onNext();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>When were you born?</Text>
      <Text style={styles.subtitle}>
        We'll use this to calculate your astrological profile
      </Text>

      <View style={styles.dateContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Month</Text>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={setMonth}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Day</Text>
          <TextInput
            style={styles.input}
            value={day}
            onChangeText={setDay}
            placeholder="DD"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={[styles.input, styles.yearInput]}
            value={year}
            onChangeText={setYear}
            placeholder="YYYY"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </View>

      {month && parseInt(month) >= 1 && parseInt(month) <= 12 && (
        <Text style={styles.monthName}>
          {months[parseInt(month) - 1]}
        </Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.5,
  },
  monthName: {
    fontSize: 16,
    color: '#6B46C1',
    textAlign: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
  },
});