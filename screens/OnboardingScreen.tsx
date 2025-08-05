import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { calculateZodiacSign } from '../utils/zodiacCalculator';
import { FullScreenLoader } from '../components/FullScreenLoader';

interface UserData {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: {
    city: string;
    state: string;
    country: string;
  };
  gender: string;
  relationshipStatus: string;
  zodiacSign?: string;
}

const OnboardingScreen = ({ navigation }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthDate: new Date(),
    birthTime: '',
    birthPlace: {
      city: '',
      state: '',
      country: ''
    },
    gender: '',
    relationshipStatus: ''
  });

  // Initialize anonymous auth when component mounts
  useEffect(() => {
    initializeAnonymousAuth();
  }, []);

  const initializeAnonymousAuth = async () => {
    try {
      // Check if user is already authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous auth error:', error);
          Alert.alert(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection and try again.',
            [{ text: 'Retry', onPress: initializeAnonymousAuth }]
          );
          return;
        }
        console.log('Anonymous user created:', data.user?.id);
      } else {
        console.log('User already authenticated:', user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to initialize the app. Please try again.',
        [{ text: 'Retry', onPress: initializeAnonymousAuth }]
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!userData.name.trim()) {
          Alert.alert('Name Required', 'Please enter your name');
          return false;
        }
        break;
      case 3:
        if (!userData.birthPlace.city.trim()) {
          Alert.alert('Birth City Required', 'Please enter your birth city');
          return false;
        }
        break;
      case 4:
        if (!userData.gender) {
          Alert.alert('Gender Required', 'Please select your gender');
          return false;
        }
        break;
      case 5:
        if (!userData.relationshipStatus) {
          Alert.alert('Relationship Status Required', 'Please select your relationship status');
          return false;
        }
        break;
    }
    return true;
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        Alert.alert('Error', 'Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Calculate zodiac sign
      const zodiacSign = calculateZodiacSign(userData.birthDate);
      const profileData = {
        ...userData,
        zodiacSign,
        id: user.id
      };

      // Save to Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: userData.name,
          birth_date: userData.birthDate.toISOString().split('T')[0],
          birth_time: userData.birthTime || null,
          birth_place_city: userData.birthPlace.city,
          birth_place_state: userData.birthPlace.state || null,
          birth_place_country: userData.birthPlace.country || null,
          gender: userData.gender,
          relationship_status: userData.relationshipStatus,
          zodiac_sign: zodiacSign,
          is_anonymous: true,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile save error:', profileError);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      } else {
        // FIX: Navigate to Dashboard with properly serialized data
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              params: {
                screen: 'Dashboard',
                params: {
                  userData: {
                    ...profileData,
                    birthDate: userData.birthDate.toISOString(), // Serialize the date
                  }
                }
              }
            }
          ]
        });
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / 5) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.stepText}>Step {currentStep} of 5</Text>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>What is your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#666"
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Date & Time of Birth</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={24} color="#9d4edd" />
              <Text style={styles.dateButtonText}>
                {userData.birthDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Time of birth (optional) e.g., 14:30"
              placeholderTextColor="#666"
              value={userData.birthTime}
              onChangeText={(text) => setUserData({...userData, birthTime: text})}
            />
            
            {showDatePicker && (
              <DateTimePicker
                value={userData.birthDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setUserData({...userData, birthDate: selectedDate});
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Place of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#666"
              value={userData.birthPlace.city}
              onChangeText={(text) => setUserData({
                ...userData, 
                birthPlace: {...userData.birthPlace, city: text}
              })}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="State/Province (optional)"
              placeholderTextColor="#666"
              value={userData.birthPlace.state}
              onChangeText={(text) => setUserData({
                ...userData, 
                birthPlace: {...userData.birthPlace, state: text}
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Country (optional)"
              placeholderTextColor="#666"
              value={userData.birthPlace.country}
              onChangeText={(text) => setUserData({
                ...userData, 
                birthPlace: {...userData.birthPlace, country: text}
              })}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Gender</Text>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  userData.gender === gender && styles.optionButtonSelected
                ]}
                onPress={() => setUserData({...userData, gender})}
              >
                <Text style={[
                  styles.optionText,
                  userData.gender === gender && styles.optionTextSelected
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.question}>Relationship Status</Text>
            {['Single', 'In a relationship', 'Married', "It's complicated"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  userData.relationshipStatus === status && styles.optionButtonSelected
                ]}
                onPress={() => setUserData({...userData, relationshipStatus: status})}
              >
                <Text style={[
                  styles.optionText,
                  userData.relationshipStatus === status && styles.optionTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
    }
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#9d4edd" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <FullScreenLoader message="Creating your cosmic profile..." />}
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Set Up Your Profile</Text>
          {renderStepIndicator()}
          {renderStep()}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 5 ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9d4edd',
    fontSize: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    width: '100%',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9d4edd',
    borderRadius: 4,
  },
  stepText: {
    color: '#9d4edd',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
    marginBottom: 30,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  optionButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#9d4edd',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  optionTextSelected: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#9d4edd',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;