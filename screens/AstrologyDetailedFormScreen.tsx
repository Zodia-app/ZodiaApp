// screens/AstrologyDetailedFormScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { astrologyService, AstrologyReadingInput } from '../services/astrology/astrologyService';

const FOCUS_AREAS = [
  'Love & Relationships',
  'Career & Life Purpose',
  'Money & Abundance',
  'Health & Wellness',
  'Family & Home',
  'Personal Growth',
  'Spirituality',
  'Creativity',
];

const AstrologyDetailedFormScreen = ({ navigation, route }: any) => {
  const { userData } = route.params || {};
  
  const [formData, setFormData] = useState<Partial<AstrologyReadingInput>>({
    name: userData?.name || '',
    date_of_birth: userData?.birthDate || '',
    time_of_birth: userData?.timeOfBirth || '',
    place_of_birth: {
      city: userData?.birthCity || '',
      state: '',
      country: userData?.birthCountry || '',
    },
    gender: userData?.gender || '',
    relationship_status: userData?.relationshipStatus || '',
    focus_areas: [],
    struggles: '',
    goals: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFocusArea = (area: string) => {
    const currentAreas = formData.focus_areas || [];
    if (currentAreas.includes(area)) {
      setFormData({
        ...formData,
        focus_areas: currentAreas.filter(a => a !== area),
      });
    } else {
      setFormData({
        ...formData,
        focus_areas: [...currentAreas, area],
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.date_of_birth || !formData.place_of_birth?.city) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }

      // Prepare the input
      const input: AstrologyReadingInput = {
        user_id: user.id,
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        time_of_birth: formData.time_of_birth,
        place_of_birth: formData.place_of_birth as any,
        gender: formData.gender,
        relationship_status: formData.relationship_status,
        focus_areas: formData.focus_areas,
        struggles: formData.struggles,
        goals: formData.goals,
      };

      // Generate the reading
      const reading = await astrologyService.generateReading(input);
      
      // Navigate to the reading result
      navigation.navigate('AstrologyReadingResult', { 
        readingId: reading.id,
        reading: reading.reading,
        chartData: reading.chart_data 
      });
      
    } catch (error) {
      console.error('Error generating reading:', error);
      Alert.alert('Error', 'Failed to generate your reading. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Let's start with your birth details ✨</Text>
            <Text style={styles.stepSubtitle}>Zodia needs this to calculate your unique cosmic blueprint</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#9d4edd" />
              <Text style={styles.dateButtonText}>
                {formData.date_of_birth || 'Select Birth Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color="#9d4edd" />
              <Text style={styles.dateButtonText}>
                {formData.time_of_birth || 'Select Birth Time (optional)'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Birth City"
              placeholderTextColor="#666"
              value={formData.place_of_birth?.city}
              onChangeText={(text) => setFormData({
                ...formData,
                place_of_birth: { ...formData.place_of_birth!, city: text }
              })}
            />

            <TextInput
              style={styles.input}
              placeholder="Birth Country"
              placeholderTextColor="#666"
              value={formData.place_of_birth?.country}
              onChangeText={(text) => setFormData({
                ...formData,
                place_of_birth: { ...formData.place_of_birth!, country: text }
              })}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell Zodia about yourself 🌟</Text>
            <Text style={styles.stepSubtitle}>This helps personalize your cosmic guidance</Text>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Gender</Text>
              <View style={styles.optionRow}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.gender === option && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, gender: option })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      formData.gender === option && styles.optionButtonTextActive
                    ]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Relationship Status</Text>
              <View style={styles.optionRow}>
                {['Single', 'In a Relationship', 'Married', 'Complicated'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.relationship_status === option && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, relationship_status: option })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      formData.relationship_status === option && styles.optionButtonTextActive
                    ]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What areas would you like guidance on? 🔮</Text>
            <Text style={styles.stepSubtitle}>Select all that resonate with you</Text>

            <View style={styles.focusAreasGrid}>
              {FOCUS_AREAS.map((area) => (
                <TouchableOpacity
                  key={area}
                  style={[
                    styles.focusAreaButton,
                    formData.focus_areas?.includes(area) && styles.focusAreaButtonActive
                  ]}
                  onPress={() => toggleFocusArea(area)}
                >
                  <Text style={[
                    styles.focusAreaText,
                    formData.focus_areas?.includes(area) && styles.focusAreaTextActive
                  ]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share your heart with Zodia 💫</Text>
            <Text style={styles.stepSubtitle}>The more you share, the deeper the insights</Text>

            <Text style={styles.textAreaLabel}>What are you currently struggling with?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share your challenges, worries, or areas where you need clarity..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.struggles}
              onChangeText={(text) => setFormData({ ...formData, struggles: text })}
            />

            <Text style={styles.textAreaLabel}>What are your goals and dreams?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tell Zodia about your aspirations, what you want to manifest..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.goals}
              onChangeText={(text) => setFormData({ ...formData, goals: text })}
            />
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#0f0f1e']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#9d4edd" />
          <Text style={styles.loadingText}>
            Zodia is aligning the stars and planets for your personalized reading...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#0f0f1e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cosmic Consultation</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
        </View>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handlePrevious}
            >
              <Ionicons name="arrow-back" size={20} color="#9d4edd" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < totalSteps ? (
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Generate My Reading</Text>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setFormData({
                  ...formData,
                  date_of_birth: date.toISOString().split('T')[0]
                });
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="default"
            onChange={(event, date) => {
              setShowTimePicker(false);
              if (date) {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                setFormData({
                  ...formData,
                  time_of_birth: `${hours}:${minutes}`
                });
              }
            }}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#9d4edd',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d2d44',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9d4edd',
    borderRadius: 3,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d54',
  },
  dateButton: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3d3d54',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  optionGroup: {
    marginBottom: 24,
  },
  optionLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3d3d54',
  },
  optionButtonActive: {
    backgroundColor: '#9d4edd',
    borderColor: '#9d4edd',
  },
  optionButtonText: {
    color: '#888',
    fontSize: 14,
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  focusAreasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusAreaButton: {
    backgroundColor: '#2d2d44',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3d3d54',
    marginBottom: 10,
  },
  focusAreaButtonActive: {
    backgroundColor: '#9d4edd',
    borderColor: '#9d4edd',
  },
  focusAreaText: {
    color: '#888',
    fontSize: 14,
  },
  focusAreaTextActive: {
    color: '#fff',
  },
  textAreaLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  textArea: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3d3d54',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#9d4edd',
    fontSize: 16,
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 'auto',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 'auto',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default AstrologyDetailedFormScreen;