import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { compatibilityService } from '../../services/compatibilityService';

const { width: screenWidth } = Dimensions.get('window');

interface SocialModeScreenProps {
  navigation: any;
  route: any;
}

export const SocialModeScreen: React.FC<SocialModeScreenProps> = ({ navigation, route }) => {
  const { userReading, prefilledCode, autoEnterMode } = route.params || {};
  
  const [currentView, setCurrentView] = useState<'generate' | 'scan' | 'enter-code'>('generate');
  const [userCompatibilityCode, setUserCompatibilityCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');

  // Handle deep link prefilled codes
  useEffect(() => {
    if (prefilledCode && autoEnterMode) {
      console.log('Processing prefilled code from deep link:', prefilledCode);
      
      // Switch to enter code view
      setCurrentView('enter-code');
      setInputCode(prefilledCode);
      
      // Show loading message
      Alert.alert(
        '🔮 Processing Compatibility Link!',
        `Found compatibility code: ${prefilledCode}\n\nChecking your cosmic connection...`,
        [
          { 
            text: 'Continue', 
            onPress: () => {
              // Auto-process after user confirms
              setTimeout(() => {
                handleEnterCode();
              }, 1000);
            }
          }
        ]
      );
    }
  }, [prefilledCode, autoEnterMode]);

  // Generate a unique compatibility code for the user
  const generateCompatibilityCode = () => {
    // Create a unique code based on user's palm reading data and timestamp
    const timestamp = Date.now();
    const palmHash = userReading?.userData?.name?.slice(0, 3).toUpperCase() || 'ZOD';
    const code = `${palmHash}${timestamp.toString().slice(-6)}`;
    setUserCompatibilityCode(code);
    return code;
  };

  const handleGenerateCode = async () => {
    const code = generateCompatibilityCode();
    
    try {
      // Store the code in the database
      const result = await compatibilityService.storeCode({
        userReading,
        code
      });

      if (result.success) {
        Alert.alert(
          'Code Generated! ✨',
          `Your compatibility code is: ${code}\n\nThis code is now stored and ready to share! Anyone can use it for 30 days to check compatibility with you! 🔮`,
          [
            { text: 'Copy Code', onPress: () => copyToClipboard(code) },
            { text: 'Share Link', onPress: () => shareCode(code) },
            { text: 'OK' }
          ]
        );
      } else {
        // Fallback to local-only code if database fails
        Alert.alert(
          'Code Generated! ✨',
          `Your compatibility code is: ${code}\n\n⚠️ Note: This code is temporary (not stored online). Share it quickly!`,
          [
            { text: 'Copy Code', onPress: () => copyToClipboard(code) },
            { text: 'Share', onPress: () => shareCode(code) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error generating code:', error);
      Alert.alert('Error', 'Failed to generate compatibility code. Please try again.');
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied! 📋', 'Your compatibility code has been copied to clipboard.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareCode = async (code: string) => {
    try {
      const compatibilityLink = `https://zodia.app/compatibility/${code}`;
      const message = `✨ Compare our cosmic compatibility! \n\n🔮 Click this link to check our connection: ${compatibilityLink}\n\nIf you don't have the Zodia app, it will guide you to download it first! 🔮✋\n\n#PalmReading #Compatibility #ZodiaApp`;
      
      await Share.share({
        message,
        url: compatibilityLink, // This helps on iOS to show the link prominently
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEnterCode = () => {
    if (!inputCode.trim()) {
      Alert.alert('Enter Code', 'Please enter a compatibility code to continue! ✨');
      return;
    }

    // Navigate to compatibility results with the entered code
    navigation.navigate('SocialCompatibilityResult', {
      userReading,
      partnerCode: inputCode.trim().toUpperCase()
    });
  };

  const renderGenerateView = () => (
    <View style={styles.content}>
      <View style={styles.heroSection}>
        <Text style={styles.emoji}>🔗✨</Text>
        <Text style={styles.title}>Share Your Cosmic Code</Text>
        <Text style={styles.subtitle}>
          Generate a unique code that friends, crushes, or anyone can use to check compatibility with you! Perfect for social media! 💫
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🎯</Text>
          <Text style={styles.featureTitle}>Unique Code</Text>
          <Text style={styles.featureDescription}>
            Get a special code linked to your palm reading
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>📱</Text>
          <Text style={styles.featureTitle}>Easy Sharing</Text>
          <Text style={styles.featureDescription}>
            Share via text, social media, or show the QR code
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>💖</Text>
          <Text style={styles.featureTitle}>Instant Results</Text>
          <Text style={styles.featureDescription}>
            Anyone can use your code for immediate compatibility
          </Text>
        </View>
      </View>

      {userCompatibilityCode && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeTitle}>Your Compatibility Code:</Text>
          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{userCompatibilityCode}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(userCompatibilityCode)}
            >
              <Ionicons name="copy" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View style={styles.codeInfoContainer}>
            <Text style={styles.codeInfoText}>
              Share this code via text, social media, or just tell your friends! 💫
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => shareCode(userCompatibilityCode)}
          >
            <Ionicons name="share" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share Your Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {!userCompatibilityCode && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateCode}>
          <Text style={styles.primaryButtonText}>Generate My Code ✨</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEnterCodeView = () => (
    <View style={styles.content}>
      <View style={styles.heroSection}>
        <Text style={styles.emoji}>🔮💫</Text>
        <Text style={styles.title}>Enter Friend's Code</Text>
        <Text style={styles.subtitle}>
          Got a compatibility code from someone? Enter it here to see how your cosmic energies align! ✨
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Compatibility Code:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.codeInput}
            value={inputCode}
            onChangeText={setInputCode}
            placeholder="Enter code here..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            autoCapitalize="characters"
            maxLength={10}
            autoFocus
          />
        </View>
        <Text style={styles.inputHint}>
          💡 Codes are usually 6-10 characters long (e.g., ZOD123456)
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, !inputCode.trim() && styles.disabledButton]} 
        onPress={handleEnterCode}
        disabled={!inputCode.trim()}
      >
        <Text style={[styles.primaryButtonText, !inputCode.trim() && styles.disabledButtonText]}>
          Check Compatibility! 🔮
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Social Mode</Text>
        </View>

        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, currentView === 'generate' && styles.activeToggle]}
            onPress={() => setCurrentView('generate')}
          >
            <Text style={[styles.toggleText, currentView === 'generate' && styles.activeToggleText]}>
              Share Code
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, currentView === 'enter-code' && styles.activeToggle]}
            onPress={() => setCurrentView('enter-code')}
          >
            <Text style={[styles.toggleText, currentView === 'enter-code' && styles.activeToggleText]}>
              Enter Code
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentView === 'generate' ? renderGenerateView() : renderEnterCodeView()}
        </ScrollView>
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
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeToggleText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
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
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 25,
    gap: 15,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  codeInfoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  codeInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    gap: 10,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 20,
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
  // Enter Code View Styles
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  codeInput: {
    fontSize: 18,
    color: 'white',
    paddingVertical: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});