import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserProfileService } from '../../services/compatibility/userProfileService';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const CreateProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Get palm reading data from previous flow
  const { readingData } = route.params || {};
  
  console.log('CreateProfile - route.params:', route.params);
  console.log('CreateProfile - readingData:', readingData);

  useEffect(() => {
    // Pre-fill name if available from palm reading
    if (readingData?.userData?.name) {
      setFormData(prev => ({
        ...prev,
        name: readingData.userData.name
      }));
    }
  }, [readingData]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const available = await UserProfileService.isUsernameAvailable(username);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    // Clean username: lowercase, no spaces, alphanumeric + underscore only
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, username: cleanUsername }));
    
    // Debounce username check
    setTimeout(() => {
      if (cleanUsername === formData.username) {
        checkUsernameAvailability(cleanUsername);
      }
    }, 500);
  };

  const handleCreateProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      Alert.alert('Error', 'Please enter a username (at least 3 characters)');
      return;
    }

    if (usernameAvailable === false) {
      Alert.alert('Error', 'This username is already taken');
      return;
    }

    setLoading(true);
    try {
      // Create user profile (palm reading is optional for now)
      const profileData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        date_of_birth: readingData?.userData?.dateOfBirth || new Date().toISOString().split('T')[0], // Use today if no reading data
        palm_reading_id: readingData?.palmReadingId || null,
        is_public: true
      };

      await UserProfileService.createOrUpdateProfile(profileData);
      
      Alert.alert(
        'Profile Created! 🎉',
        'Your compatibility profile is ready! You can now create invitations or join matches.',
        [
          { text: 'OK', onPress: () => navigation.navigate('CompatibilityDashboard') }
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    navigation.navigate('CompatibilityDashboard');
  };

  const getUsernameStatusColor = () => {
    if (checkingUsername) return '#FCD34D';
    if (usernameAvailable === true) return '#10B981';
    if (usernameAvailable === false) return '#EF4444';
    return 'rgba(255, 255, 255, 0.5)';
  };

  const getUsernameStatusText = () => {
    if (!formData.username) return '';
    if (checkingUsername) return 'Checking...';
    if (usernameAvailable === true) return '✓ Available';
    if (usernameAvailable === false) return '✗ Taken';
    return '';
  };

  return (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Profile ✨</Text>
            <Text style={styles.subtitle}>
              Set up your compatibility profile to start matching with friends and partners!
            </Text>
          </View>

          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="What should people call you?"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                maxLength={50}
              />
            </View>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[styles.input, styles.usernameInput]}
                  value={formData.username}
                  onChangeText={handleUsernameChange}
                  placeholder="your_unique_username"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  maxLength={30}
                  autoCapitalize="none"
                />
                <Text style={[styles.usernameStatus, { color: getUsernameStatusColor() }]}>
                  {getUsernameStatusText()}
                </Text>
              </View>
              <Text style={styles.inputHint}>
                This will be used to invite you to compatibility matches
              </Text>
            </View>

            {/* Bio Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio (Optional)</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell people a bit about yourself... ✨"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>{formData.bio.length}/200</Text>
            </View>

            {/* Palm Reading Status */}
            <View style={[styles.statusCard, !readingData && styles.statusCardWarning]}>
              <Text style={styles.statusEmoji}>{readingData ? '🤲' : '⚠️'}</Text>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>
                  {readingData ? 'Palm Reading Complete' : 'No Palm Reading'}
                </Text>
                <Text style={styles.statusDescription}>
                  {readingData 
                    ? 'Your palm reading is ready for compatibility matching!'
                    : 'You can still create a profile, but palm readings give better matches!'
                  }
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.createButton, loading && styles.disabledButton]} 
            onPress={handleCreateProfile}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#6B7280', '#9CA3AF'] : ['#F59E0B', '#EAB308', '#FCD34D']}
              style={styles.buttonGradient}
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Text style={styles.createButtonText}>Create Profile 🚀</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipProfile}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  usernameContainer: {
    position: 'relative',
  },
  usernameInput: {
    paddingRight: 80,
  },
  usernameStatus: {
    position: 'absolute',
    right: 16,
    top: 18,
    fontSize: 14,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusCardWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.95)',
  },
  createButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    flexDirection: 'row',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateProfileScreen;