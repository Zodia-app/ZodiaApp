import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserData } from '../../types/palmReading';
import { DateOfBirthPicker } from '../shared/DateOfBirthPicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


interface BirthDetailsStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const BirthDetailsStep: React.FC<BirthDetailsStepProps> = ({ onNext, userData, setUserData }) => {
  const handleDateChange = (dateString: string, age: number, zodiacSign: string) => {
    setUserData({ 
      ...userData, 
      dateOfBirth: dateString,
      age,
      zodiacSign
    });
  };

  const handleSubmit = () => {
    if (!userData.dateOfBirth) {
      return;
    }
    onNext();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.emoji}>🎂</Text>
              <Text style={styles.title}>When were you born?</Text>
              <Text style={styles.subtitle}>We'll use your zodiac sign for context</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <DateOfBirthPicker
                value={userData.dateOfBirth}
                onDateChange={handleDateChange}
                theme="gradient"
                required={true}
                showZodiac={true}
                showAge={false}
                placeholder="Select your date of birth"
              />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={['#F59E0B', '#EAB308', '#FCD34D']}
              style={styles.button}
            >
              <TouchableOpacity 
                style={[styles.buttonInner, !userData.dateOfBirth && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={!userData.dateOfBirth}
              >
                <Text style={[styles.buttonText, !userData.dateOfBirth && styles.buttonTextDisabled]}>
                  Continue ✨
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  buttonContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: screenHeight < 700 ? 40 : 60,
  },
  emoji: {
    fontSize: screenHeight < 700 ? 50 : 60,
    marginBottom: screenHeight < 700 ? 16 : 20,
  },
  title: {
    fontSize: screenHeight < 700 ? 28 : 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: screenHeight < 700 ? 16 : 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateContainer: {
    marginBottom: 40,
  },
  button: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonInner: {
    padding: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});