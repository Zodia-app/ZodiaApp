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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MysticalCameraView } from '../../components/palmReading/MysticalCameraView';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DateOfBirthPicker } from '../../components/shared/DateOfBirthPicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FriendModeScreenProps {
  navigation: any;
  route: any;
}

interface FriendData {
  name: string;
  dateOfBirth: string;
  age: number;
  zodiacSign: string;
  leftPalmImage: string | null;
  rightPalmImage: string | null;
}

type StepType = 'intro' | 'name' | 'dateOfBirth' | 'leftPalm' | 'rightPalm' | 'processing';

export const FriendModeScreen: React.FC<FriendModeScreenProps> = ({ navigation, route }) => {
  const { userReading } = route.params || {}; // User's own palm reading
  
  const [currentStep, setCurrentStep] = useState<StepType>('intro');
  const [friendData, setFriendData] = useState<FriendData>({
    name: '',
    dateOfBirth: '',
    age: 0,
    zodiacSign: '',
    leftPalmImage: null,
    rightPalmImage: null,
  });
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();


  const handleStartFriendMode = () => {
    setCurrentStep('name');
  };

  const handleNameSubmit = () => {
    if (!friendData.name.trim()) {
      Alert.alert('Oops!', 'Please enter your friend\'s name first! 💫');
      return;
    }
    setCurrentStep('dateOfBirth');
  };

  const handleDateOfBirthSubmit = () => {
    if (!friendData.dateOfBirth) {
      Alert.alert('Missing Info', 'Please select your friend\'s date of birth! 🎂');
      return;
    }
    console.log('Moving to leftPalm step from dateOfBirth');
    setCurrentStep('leftPalm');
  };

  const handleDateChange = (dateString: string, age: number, zodiacSign: string) => {
    setFriendData(prev => ({
      ...prev,
      dateOfBirth: dateString,
      age,
      zodiacSign,
    }));
  };

  const openCamera = async (handType: 'left' | 'right') => {
    try {
      if (!permission?.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Please allow camera access to scan your friend\'s palm.');
          return;
        }
      }
      setCurrentHandType(handType);
      setShowCameraModal(true);
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const [currentHandType, setCurrentHandType] = useState<'left' | 'right'>('left');

  const takePicture = async () => {
    if (cameraRef) {
      try {
        console.log(`=== TAKING ${currentHandType.toUpperCase()} PALM PICTURE ===`);
        console.log('Current friend data before capture:', JSON.stringify(friendData, null, 2));
        
        setIsCapturing(true);
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        console.log('Photo captured:', photo);
        console.log('Photo URI:', photo.uri);
        console.log('Current hand type:', currentHandType);
        
        if (currentHandType === 'left') {
          console.log('Setting LEFT palm image:', photo.uri);
          setFriendData(prev => {
            const updated = { ...prev, leftPalmImage: photo.uri };
            console.log('Updated friend data (left palm):', JSON.stringify(updated, null, 2));
            return updated;
          });
        } else {
          console.log('Setting RIGHT palm image:', photo.uri);
          const updatedFriendData = { ...friendData, rightPalmImage: photo.uri };
          console.log('Updated friend data (right palm):', JSON.stringify(updatedFriendData, null, 2));
          setFriendData(updatedFriendData);
        }
        
        setShowCameraModal(false);
        setIsCapturing(false);
        
        // Move to next step or start processing
        if (currentHandType === 'left') {
          console.log('Moving to right palm step');
          setCurrentStep('rightPalm');
        } else {
          console.log('Both palms captured, starting compatibility processing');
          const completeData = { ...friendData, rightPalmImage: photo.uri };
          setTimeout(() => {
            processCompatibility(completeData);
          }, 1000);
        }
      } catch (err) {
        console.error('Error taking picture:', err);
        Alert.alert('Error', 'Failed to capture palm. Please try again.');
        setIsCapturing(false);
      }
    } else {
      console.error('Camera ref is null!');
    }
  };

  const processCompatibility = (completeData?: FriendData) => {
    setCurrentStep('processing');
    
    // Use the passed complete data or fall back to state
    const dataToUse = completeData || friendData;
    
    console.log('=== PROCESSING COMPATIBILITY ===');
    console.log('Friend data state at processing time:', JSON.stringify(dataToUse, null, 2));
    console.log('Left palm image:', dataToUse.leftPalmImage ? `present: ${dataToUse.leftPalmImage}` : 'MISSING');
    console.log('Right palm image:', dataToUse.rightPalmImage ? `present: ${dataToUse.rightPalmImage}` : 'MISSING');
    
    // Additional debugging - check if images exist in state right before navigation
    setTimeout(() => {
      console.log('=== FINAL STATE CHECK BEFORE NAVIGATION ===');
      console.log('Final friend data state:', JSON.stringify(dataToUse, null, 2));
      console.log('Final left palm:', dataToUse.leftPalmImage ? 'EXISTS' : 'NULL');
      console.log('Final right palm:', dataToUse.rightPalmImage ? 'EXISTS' : 'NULL');
    }, 500);
    
    // Navigate to compatibility results with complete friend data
    setTimeout(() => {
      const navigationData = {
        userReading,
        friendData: {
          userData: {
            name: dataToUse.name,
            dateOfBirth: dataToUse.dateOfBirth,
            age: dataToUse.age,
            zodiacSign: dataToUse.zodiacSign,
          },
          palmData: {
            leftPalmImage: dataToUse.leftPalmImage,
            rightPalmImage: dataToUse.rightPalmImage,
          }
        }
      };
      
      console.log('Navigation data being passed:', JSON.stringify(navigationData, null, 2));
      navigation.navigate('FriendCompatibilityResult', navigationData);
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

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartFriendMode}>
              <Text style={styles.primaryButtonText}>Start Friend Scan ✨</Text>
            </TouchableOpacity>
          </View>
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
                value={friendData.name}
                onChangeText={(text) => setFriendData(prev => ({ ...prev, name: text }))}
                placeholder="Enter their name..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                maxLength={30}
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !friendData.name.trim() && styles.disabledButton]} 
            onPress={handleNameSubmit}
            disabled={!friendData.name.trim()}
          >
            <Text style={[styles.primaryButtonText, !friendData.name.trim() && styles.disabledButtonText]}>
              Next: Date of Birth 🎂
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderDateOfBirthInput = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('name')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{friendData.name}'s Birthday</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.dateSection}>
            <Text style={styles.datePrompt}>When is {friendData.name}'s birthday? 🎂</Text>
            <Text style={styles.dateSubtext}>
              We need this to calculate their zodiac sign and personalize the reading! ✨
            </Text>

            <DateOfBirthPicker
              value={friendData.dateOfBirth}
              onDateChange={handleDateChange}
              theme="dark"
              required={true}
              showZodiac={true}
              showAge={true}
              placeholder="Select Date of Birth"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !friendData.dateOfBirth && styles.disabledButton]} 
            onPress={handleDateOfBirthSubmit}
            disabled={!friendData.dateOfBirth}
          >
            <Text style={[styles.primaryButtonText, !friendData.dateOfBirth && styles.disabledButtonText]}>
              Next: Left Palm 🤚
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderLeftPalmStep = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('dateOfBirth')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{friendData.name}'s Left Palm</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.scanSection}>
            <Text style={styles.scanPrompt}>📸 Left Palm Photo</Text>
            <Text style={styles.scanSubtext}>
              Have {friendData.name} show their LEFT palm to the camera. Make sure it's well-lit and clear! 🤚✨
            </Text>
            
            {friendData.leftPalmImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: friendData.leftPalmImage }} style={styles.palmPreview} />
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={() => {
                    console.log('Retaking LEFT palm photo - clearing leftPalmImage');
                    setFriendData(prev => ({ ...prev, leftPalmImage: null }));
                  }}
                >
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraButton} onPress={() => openCamera('left')}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.cameraButtonText}>Capture Left Palm 🤚</Text>
              </TouchableOpacity>
            )}
          </View>

          {friendData.leftPalmImage && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentStep('rightPalm')}>
              <Text style={styles.primaryButtonText}>Next: Right Palm ✋</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderRightPalmStep = () => (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentStep('leftPalm')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{friendData.name}'s Right Palm</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.scanSection}>
            <Text style={styles.scanPrompt}>📸 Right Palm Photo</Text>
            <Text style={styles.scanSubtext}>
              Now have {friendData.name} show their RIGHT palm to the camera. Almost ready for the cosmic analysis! ✋✨
            </Text>
            
            {friendData.rightPalmImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: friendData.rightPalmImage }} style={styles.palmPreview} />
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={() => {
                    console.log('Retaking RIGHT palm photo - clearing rightPalmImage');
                    setFriendData(prev => ({ ...prev, rightPalmImage: null }));
                  }}
                >
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.cameraButton} onPress={() => openCamera('right')}>
                <Ionicons name="camera" size={40} color="white" />
                <Text style={styles.cameraButtonText}>Capture Right Palm ✋</Text>
              </TouchableOpacity>
            )}
          </View>

          {friendData.rightPalmImage && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => {
              console.log('User clicked Analyze Compatibility button');
              console.log('Right palm image status:', friendData.rightPalmImage ? 'EXISTS' : 'NULL');
              processCompatibility(friendData);
            }}>
              <Text style={styles.primaryButtonText}>Analyze Compatibility! 💕✨</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
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
      case 'dateOfBirth':
        return renderDateOfBirthInput();
      case 'leftPalm':
        return renderLeftPalmStep();
      case 'rightPalm':
        return renderRightPalmStep();
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
            currentHandType={currentHandType}
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
  // Date picker styles
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  dateSection: {
    paddingTop: 40,
    alignItems: 'center',
  },
  datePrompt: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});