import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth } = Dimensions.get('window');

interface DatingModeScreenProps {
  navigation: any;
  route: any;
}

export const DatingModeScreen: React.FC<DatingModeScreenProps> = ({ navigation, route }) => {
  const { userReading } = route.params || {}; // User's palm reading data
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'avatar' | 'profile' | 'matching'>('intro');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    age: '',
    interests: [] as string[],
    lookingFor: 'friends',
    bio: '',
  });

  const handleStartDatingMode = () => {
    setCurrentStep('avatar');
  };

  const selectAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to upload your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting avatar:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleAvatarNext = () => {
    if (!avatarImage) {
      Alert.alert('Avatar Required', 'Please upload your photo to continue with Dating Mode! ✨');
      return;
    }
    setCurrentStep('profile');
  };

  const handleProfileComplete = () => {
    // Save profile and enter matching pool
    setCurrentStep('matching');
  };

  const renderIntro = () => (
    <LinearGradient colors={['#EC4899', '#F97316', '#EAB308']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dating Mode</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.heroSection}>
              <Text style={styles.emoji}>💕✨</Text>
              <Text style={styles.title}>Find Your Cosmic Match</Text>
              <Text style={styles.subtitle}>
                Connect with others who've unlocked their palm reading destiny! Using the power of palmistry and modern matching! 🔮
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📸</Text>
                <Text style={styles.featureTitle}>Upload Your Avatar</Text>
                <Text style={styles.featureDescription}>
                  Show your best self with a gorgeous profile photo
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🔮</Text>
                <Text style={styles.featureTitle}>Palmistry Matching</Text>
                <Text style={styles.featureDescription}>
                  Our AI analyzes palm compatibility for deeper connections
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>💫</Text>
                <Text style={styles.featureTitle}>Meaningful Connections</Text>
                <Text style={styles.featureDescription}>
                  Meet people aligned with your cosmic energy
                </Text>
              </View>
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>
                💖 Dating Mode creates a profile visible to others who've opted into dating. Your privacy and safety are our top priority!
              </Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.primaryButton} onPress={handleStartDatingMode}>
          <Text style={styles.primaryButtonText}>Create Dating Profile ✨</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderAvatarUpload = () => (
    <LinearGradient colors={['#EC4899', '#F97316', '#EAB308']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('intro')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Avatar</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Show Your Best Self! ✨</Text>
            <Text style={styles.sectionSubtitle}>
              Upload a clear, recent photo that represents the amazing you!
            </Text>

            <View style={styles.avatarContainer}>
              {avatarImage ? (
                <View style={styles.avatarPreview}>
                  <Image source={{ uri: avatarImage }} style={styles.avatarImage} />
                  <TouchableOpacity style={styles.changeAvatarButton} onPress={selectAvatar}>
                    <Ionicons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={selectAvatar}>
                  <Ionicons name="camera" size={40} color="white" />
                  <Text style={styles.uploadButtonText}>Upload Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.avatarTips}>
              <Text style={styles.tipsTitle}>📸 Photo Tips:</Text>
              <Text style={styles.tipItem}>• Clear, well-lit photos work best</Text>
              <Text style={styles.tipItem}>• Show your genuine smile!</Text>
              <Text style={styles.tipItem}>• Face should be clearly visible</Text>
              <Text style={styles.tipItem}>• No group photos or filters needed</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, !avatarImage && styles.disabledButton]} 
          onPress={handleAvatarNext}
          disabled={!avatarImage}
        >
          <Text style={[styles.primaryButtonText, !avatarImage && styles.disabledButtonText]}>
            Next: Complete Profile 💫
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderProfileSetup = () => (
    <LinearGradient colors={['#EC4899', '#F97316', '#EAB308']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('avatar')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Tell Us About Yourself! 💫</Text>
            <Text style={styles.sectionSubtitle}>
              Help others discover your amazing energy and find your cosmic match!
            </Text>

            {/* Profile form would go here - simplified for now */}
            <View style={styles.profileForm}>
              <Text style={styles.formNote}>
                🌟 Profile setup coming soon! For now, your palm reading and avatar are enough to find amazing matches based on cosmic compatibility!
              </Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.primaryButton} onPress={handleProfileComplete}>
          <Text style={styles.primaryButtonText}>Enter Dating Pool! 💕</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderMatching = () => (
    <LinearGradient colors={['#EC4899', '#F97316', '#EAB308']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.matchingSection}>
            <Text style={styles.emoji}>🎉✨</Text>
            <Text style={styles.title}>Welcome to Dating Mode!</Text>
            <Text style={styles.subtitle}>
              Your profile is live! The universe is now finding your perfect cosmic matches based on your palm reading and energy! 💫
            </Text>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => navigation.navigate('DatingDashboard', { userProfile: { avatar: avatarImage, ...profileData, palmReading: userReading } })}
            >
              <Text style={styles.primaryButtonText}>View Matches 💕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Render based on current step
  switch (currentStep) {
    case 'intro':
      return renderIntro();
    case 'avatar':
      return renderAvatarUpload();
    case 'profile':
      return renderProfileSetup();
    case 'matching':
      return renderMatching();
    default:
      return renderIntro();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  // Avatar Upload Styles
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  uploadButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  avatarPreview: {
    position: 'relative',
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'white',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#EC4899',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignSelf: 'stretch',
  },
  tipsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  // Profile Setup Styles
  profileForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 30,
    marginTop: 30,
  },
  formNote: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  // Matching Styles
  matchingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});