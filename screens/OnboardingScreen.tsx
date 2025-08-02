import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { supabase } from '../lib/supabase';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate zodiac sign based on birth date
  const calculateZodiacSign = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiacDates = [
      { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
      { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
      { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
      { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
      { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
      { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
      { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
      { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
      { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
      { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
      { sign: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
      { sign: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
    ];

    for (const zodiac of zodiacDates) {
      if (
        (month === zodiac.startMonth && day >= zodiac.startDay) ||
        (month === zodiac.endMonth && day <= zodiac.endDay)
      ) {
        return zodiac.sign;
      }
    }

    return 'Capricorn'; // Default for edge case
  };

  const saveUserData = async () => {
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Calculate zodiac sign
      const zodiacSign = calculateZodiacSign(birthDate);

      // Save user profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          birth_date: birthDate,
          gender,
          birth_city: birthCity,
          relationship_status: relationshipStatus,
          zodiac_sign: zodiacSign,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw profileError;
      }

      // Navigate to Dashboard with user data
      const userData = {
        name,
        birthDate,
        gender,
        birthCity,
        relationshipStatus,
        zodiacSign
      };
      
      navigation.navigate('Dashboard', { userData });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to save profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validation for required fields
    if (currentStep === 1 && !name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (currentStep === 2 && !birthDate) {
      Alert.alert('Required', 'Please enter your birth date');
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data and navigate
      saveUserData();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What is your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              value={birthDate}
              onChangeText={setBirthDate}
            />
            <Text style={styles.hint}>
              This helps us calculate your zodiac sign
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Gender</Text>
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  gender === option && styles.selectedOption
                ]}
                onPress={() => setGender(option)}
              >
                <Text style={[
                  styles.optionText,
                  gender === option && styles.selectedOptionText
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Place of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="City, Country"
              placeholderTextColor="#888"
              value={birthCity}
              onChangeText={setBirthCity}
            />
            <Text style={styles.hint}>
              This helps with astrological calculations
            </Text>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Relationship Status</Text>
            {['Single', 'In a relationship', 'Married', 'It\'s complicated'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  relationshipStatus === option && styles.selectedOption
                ]}
                onPress={() => setRelationshipStatus(option)}
              >
                <Text style={[
                  styles.optionText,
                  relationshipStatus === option && styles.selectedOptionText
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.stepIndicator}>Step {currentStep} of 5</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${(currentStep / 5) * 100}%` }]} />
      </View>

      {renderStep()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={nextStep}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {currentStep === 5 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <FullScreenLoader 
        visible={isLoading} 
        message="Creating your cosmic profile..." 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#9d4edd',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2d2d44',
    marginHorizontal: 24,
    marginBottom: 30,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#9d4edd',
    borderRadius: 2,
  },
  stepContainer: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#2d2d44',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: -8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#2d2d44',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: '#9d4edd',
    borderColor: '#9d4edd',
  },
  optionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#9d4edd',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});