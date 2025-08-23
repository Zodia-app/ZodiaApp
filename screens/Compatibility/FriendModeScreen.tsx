import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MysticalCameraView } from '../../components/palmReading/MysticalCameraView';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FriendModeScreenProps {
  navigation: any;
  route: any;
}

// Interface moved inline where needed

export const FriendModeScreen: React.FC<FriendModeScreenProps> = ({ navigation, route }) => {
  const { userReading } = route.params || {}; // User's own palm reading
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'name' | 'scan' | 'processing'>('intro');
  const [friendName, setFriendName] = useState('');
  const [friendPalmImage, setFriendPalmImage] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleStartFriendMode = () => {
    setCurrentStep('name');
  };

  const handleNameSubmit = () => {
    if (!friendName.trim()) {
      Alert.alert('Oops!', 'Please enter your friend\'s name first! 💫');
      return;
    }
    setCurrentStep('scan');
  };

  const openCamera = async () => {
    try {
      if (!permission?.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Please allow camera access to scan your friend\'s palm.');
          return;
        }
      }
      setShowCameraModal(true);
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        setFriendPalmImage(photo.uri);
        setShowCameraModal(false);
        setIsCapturing(false);
        
        // Start processing compatibility
        setTimeout(() => {
          processCompatibility();
        }, 1000);
      } catch (err) {
        console.error('Error taking picture:', err);
        Alert.alert('Error', 'Failed to capture palm. Please try again.');
        setIsCapturing(false);
      }
    }
  };

  const processCompatibility = () => {
    setCurrentStep('processing');
    
    // Simulate processing time
    setTimeout(() => {
      // Navigate to compatibility results
      navigation.navigate('FriendCompatibilityResult', {
        userReading,
        friendData: {
          name: friendName,
          palmImage: friendPalmImage
        }
      });
    }, 3000);
  };

  const renderIntro = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend Mode</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Text style={styles.emoji}>👫✨</Text>
            <Text style={styles.title}>Instant Compatibility</Text>
            <Text style={styles.subtitle}>
              Scan your friend's palm for instant compatibility magic! Perfect for parties, dates, or just hanging out! 💅
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>📸</Text>
              <Text style={styles.featureText}>Scan in real-time</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <Text style={styles.featureText}>Instant results</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🎉</Text>
              <Text style={styles.featureText}>Share the vibes</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleStartFriendMode}>
            <Text style={styles.primaryButtonText}>Start Friend Scan ✨</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderNameInput = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('intro')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friend's Name</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.nameSection}>
            <Text style={styles.namePrompt}>What's your friend's name? ✨</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={friendName}
                onChangeText={setFriendName}
                placeholder="Enter their name..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                maxLength={30}
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !friendName.trim() && styles.disabledButton]} 
            onPress={handleNameSubmit}
            disabled={!friendName.trim()}
          >
            <Text style={[styles.primaryButtonText, !friendName.trim() && styles.disabledButtonText]}>
              Next: Scan Their Palm 📸
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderScanStep = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('name')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan {friendName}'s Palm</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.scanSection}>
            <Text style={styles.scanPrompt}>Ready to scan {friendName}'s palm? ✋✨</Text>
            <Text style={styles.scanSubtext}>
              Have {friendName} hold their palm steady in front of the camera. The universe will do the rest! 🔮
            </Text>
            
            {friendPalmImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: friendPalmImage }} style={styles.palmPreview} />
                <TouchableOpacity style={styles.retakeButton} onPress={() => setFriendPalmImage(null)}>
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.cameraButtonText}>Scan {friendName}'s Palm</Text>
              </TouchableOpacity>
            )}
          </View>

          {friendPalmImage && (
            <TouchableOpacity style={styles.primaryButton} onPress={processCompatibility}>
              <Text style={styles.primaryButtonText}>Check Compatibility! 💕</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderProcessing = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.processingContent}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>✨ Reading your compatibility vibes...</Text>
          <Text style={styles.processingSubtext}>The universe is analyzing your cosmic connection! 🔮</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  // Main render with camera modal
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntro();
      case 'name':
        return renderNameInput();
      case 'scan':
        return renderScanStep();
      case 'processing':
        return renderProcessing();
      default:
        return renderIntro();
    }
  };

  return (
    <>
      {renderCurrentStep()}
      
      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.cameraContainer}>
          <MysticalCameraView
            onCameraReady={setCameraRef}
            currentHandType="right" // Default to right hand for friends
            isCapturing={isCapturing}
          />
          
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCameraModal(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <View style={styles.captureControls}>
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonActive]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View style={[styles.captureButtonInner, isCapturing && styles.captureButtonInnerActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
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
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 40,
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
  nameSection: {
    paddingTop: 60,
    alignItems: 'center',
  },
  namePrompt: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  scanSection: {
    paddingTop: 40,
    alignItems: 'center',
  },
  scanPrompt: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scanSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  cameraButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 30,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  palmPreview: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  // Camera Modal Styles
  cameraContainer: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  closeButton: {
    padding: 15,
  },
  captureControls: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    transform: [{ scale: 0.95 }],
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  captureButtonInnerActive: {
    backgroundColor: '#8B5CF6',
  },
});