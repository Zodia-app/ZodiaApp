import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { calculateZodiacSign } from '../utils/zodiacCalculator';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { supabase } from '../lib/supabase';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
  route: EditProfileScreenRouteProp;
}

const EditProfileScreen = ({ navigation, route }: Props) => {
  const userData = route?.params?.userData || {};
  
  const [formData, setFormData] = useState({
    name: userData.name || '',
    birthDate: userData.birthDate || '',
    gender: userData.gender || '',
    birthCity: userData.birthCity || '',
    relationshipStatus: userData.relationshipStatus || ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Use the imported calculateZodiacSign function
  const getZodiacDisplay = (birthDate: string) => {
    const zodiacInfo = calculateZodiacSign(birthDate);
    return zodiacInfo ? `${zodiacInfo.name} ${zodiacInfo.symbol}` : 'Unknown';
  };

  // Update profile in Supabase
  const updateProfile = async (updates: typeof formData) => {
    setUpdateLoading(true);
    
    try {
      // If no Supabase configured, just navigate with updated data
      if (!supabase) {
        navigation.navigate('Profile', { userData: updates });
        setHasUnsavedChanges(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Calculate zodiac sign
      const zodiacInfo = calculateZodiacSign(updates.birthDate);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          birth_date: updates.birthDate,
          gender: updates.gender,
          birth_city: updates.birthCity,
          relationship_status: updates.relationshipStatus,
          zodiac_sign: zodiacInfo?.name || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Show success message
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Profile', { 
              userData: {
                ...updates,
                zodiacSign: zodiacInfo?.name
              } 
            });
            setHasUnsavedChanges(false);
          }
        }
      ]);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Alert.alert(
        'Error', 
        err.message || 'Unable to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!formData.birthDate || !formData.birthDate.trim()) {
      Alert.alert('Error', 'Birth date is required');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.birthDate)) {
      Alert.alert('Error', 'Birth date must be in YYYY-MM-DD format');
      return;
    }

    updateProfile(formData);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={updateLoading}
          >
            <Text style={[
              styles.cancelButtonText, 
              updateLoading && styles.disabledText
            ]}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={updateLoading}
          >
            <Text style={[
              styles.saveButtonText,
              updateLoading && styles.disabledText
            ]}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.zodiacSection}>
          <Text style={styles.zodiacLabel}>Current Zodiac Sign</Text>
          <Text style={styles.zodiacSign}>{getZodiacDisplay(formData.birthDate)}</Text>
          {formData.birthDate && (
            <Text style={styles.zodiacHint}>
              Automatically calculated from your birth date
            </Text>
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              editable={!updateLoading}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Birth Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              value={formData.birthDate}
              onChangeText={(text) => updateFormData('birthDate', text)}
              editable={!updateLoading}
              keyboardType="numeric"
            />
            <Text style={styles.fieldHint}>
              Format: YYYY-MM-DD (e.g., 1990-03-21)
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.optionsContainer}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.gender === option && styles.optionButtonSelected,
                    updateLoading && styles.optionButtonDisabled
                  ]}
                  onPress={() => updateFormData('gender', option)}
                  disabled={updateLoading}
                >
                  <Text style={[
                    styles.optionText,
                    formData.gender === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Birth City</Text>
            <TextInput
              style={styles.input}
              placeholder="City, Country"
              placeholderTextColor="#888"
              value={formData.birthCity}
              onChangeText={(text) => updateFormData('birthCity', text)}
              editable={!updateLoading}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Relationship Status</Text>
            <View style={styles.optionsContainer}>
              {['Single', 'In a relationship', 'Married', 'It\'s complicated'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    formData.relationshipStatus === option && styles.optionButtonSelected,
                    updateLoading && styles.optionButtonDisabled
                  ]}
                  onPress={() => updateFormData('relationshipStatus', option)}
                  disabled={updateLoading}
                >
                  <Text style={[
                    styles.optionText,
                    formData.relationshipStatus === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.requiredNote}>* Required fields</Text>
      </ScrollView>

      <FullScreenLoader 
        visible={updateLoading} 
        message="Updating your profile..." 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#9d4edd',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  zodiacSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
    marginBottom: 20,
  },
  zodiacLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  zodiacSign: {
    fontSize: 24,
    color: '#9d4edd',
    fontWeight: 'bold',
  },
  zodiacHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: '#2d2d44',
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2d2d44',
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#9d4edd',
    borderColor: '#9d4edd',
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default EditProfileScreen;