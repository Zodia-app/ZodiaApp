import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext'; // Commented out for now
import { theme } from '../theme';
import LoadingOverlay from '../components/LoadingOverlay';
import RecentPartners from '../components/RecentPartners';

export default function CompatibilityInputScreen() {
  const navigation = useNavigation();
  // const { user } = useAuth(); // Commented out for now
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [partnerBirthTime, setPartnerBirthTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [partnerBirthPlace, setPartnerBirthPlace] = useState('');
  const [includeAdvanced, setIncludeAdvanced] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setPartnerBirthDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      setPartnerBirthTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      );
    }
  };

  const validateForm = () => {
    if (!partnerName.trim()) {
      Alert.alert('Missing Information', 'Please enter your partner\'s name');
      return false;
    }
    
    // Check if date is valid and not in the future
    if (partnerBirthDate > new Date()) {
      Alert.alert('Invalid Date', 'Birth date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Please sign in to use this feature');
    }

    console.log('User found:', user.id);

    // Save partner data
    const { data: partnerData, error: partnerError } = await supabase
      .from('compatibility_partners')
      .insert({
        user_id: user.id,
        partner_name: partnerName,
        birth_date: partnerBirthDate.toISOString().split('T')[0],
        birth_time: includeAdvanced ? partnerBirthTime : null,
        birth_place: includeAdvanced ? partnerBirthPlace : null,
      })
      .select()
      .single();

    if (partnerError) {
      console.error('Partner save error:', partnerError);
      throw partnerError;
    }

    console.log('Partner saved:', partnerData);

    // Create compatibility reading request
    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        reading_type: 'compatibility',
        status: 'pending',
        input_data: {
          partner_name: partnerName,
          partner_birth_date: partnerBirthDate.toISOString().split('T')[0],
          partner_birth_time: includeAdvanced ? partnerBirthTime : null,
          partner_birth_place: includeAdvanced ? partnerBirthPlace : null,
        },
        metadata: {
          partner_id: partnerData.id,
          partner_name: partnerName,
          include_advanced: includeAdvanced,
        },
      })
      .select()
      .single();

    if (readingError) {
      console.error('Reading creation error:', readingError);
      throw readingError;
    }

    console.log('Reading created:', reading);
    console.log('Navigating to CompatibilityAnalysis...');

    // Navigate to loading/results screen
    navigation.navigate('CompatibilityAnalysis' as never, { 
      readingId: reading.id,
      partnerName: partnerName 
    } as never);

  } catch (error: any) {
    console.error('Error creating compatibility reading:', error);
    Alert.alert(
      'Error',
      error.message || 'Failed to create compatibility reading. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <LinearGradient
      colors={[theme.colors.background, '#1a0033']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Cosmic Compatibility</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Intro Text */}
          <Text style={styles.introText}>
            Discover the cosmic connection between you and your partner
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Partner Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Partner's Name</Text>
              <TextInput
                style={styles.input}
                value={partnerName}
                onChangeText={setPartnerName}
                placeholder="Enter name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Birth Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Partner's Birth Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {partnerBirthDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              
              {/* Date Picker for iOS with Modal */}
              {showDatePicker && Platform.OS === 'ios' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDatePicker}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={partnerBirthDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        minimumDate={new Date(1900, 0, 1)}
                        style={styles.iosPicker}
                      />
                    </View>
                  </View>
                </Modal>
              )}
              
              {/* Date Picker for Android */}
              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={partnerBirthDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>

            {/* Advanced Options Toggle */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setIncludeAdvanced(!includeAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                Advanced compatibility analysis
              </Text>
              <Ionicons 
                name={includeAdvanced ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>

            {/* Advanced Fields */}
            {includeAdvanced && (
              <View style={styles.advancedFields}>
                {/* Birth Time */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Birth Time (Optional)
                  </Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {partnerBirthTime || 'Select time'}
                    </Text>
                    <Ionicons name="time" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  
                  {/* Time Picker for iOS with Modal */}
                  {showTimePicker && Platform.OS === 'ios' && (
                    <Modal
                      transparent={true}
                      animationType="slide"
                      visible={showTimePicker}
                    >
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                              <Text style={styles.modalCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                              <Text style={styles.modalDone}>Done</Text>
                            </TouchableOpacity>
                          </View>
                          <DateTimePicker
                            value={new Date()}
                            mode="time"
                            display="spinner"
                            onChange={handleTimeChange}
                            style={styles.iosPicker}
                          />
                        </View>
                      </View>
                    </Modal>
                  )}
                  
                  {/* Time Picker for Android */}
                  {showTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                </View>

                {/* Birth Place */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Birth Place (Optional)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={partnerBirthPlace}
                    onChangeText={setPartnerBirthPlace}
                    placeholder="City, Country"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>

                <Text style={styles.helpText}>
                  Including birth time and place enables deeper astrological insights
                  through rising signs and house placements.
                </Text>
              </View>
            )}

            {/* Recent Partners */}
            <RecentPartners onSelect={(partner) => {
              setPartnerName(partner.partner_name);
              setPartnerBirthDate(new Date(partner.birth_date));
              if (partner.birth_time) {
                setPartnerBirthTime(partner.birth_time);
                setIncludeAdvanced(true);
              }
              if (partner.birth_place) {
                setPartnerBirthPlace(partner.birth_place);
                setIncludeAdvanced(true);
              }
            }} />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitText}>
                  Reveal Cosmic Connection
                </Text>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && <LoadingOverlay message="Analyzing cosmic compatibility..." />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  introText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  advancedToggleText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  advancedFields: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
  },
  submitButton: {
    marginTop: 30,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 30,
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal styles for date/time pickers
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  modalDone: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  iosPicker: {
    backgroundColor: 'white',
    height: 200,
  },
});