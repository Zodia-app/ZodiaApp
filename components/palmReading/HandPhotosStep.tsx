import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { PalmPositioningOverlay } from './PalmPositioningOverlay';

const { height: screenHeight } = Dimensions.get('window');


interface HandPhotosStepProps {
  onNext: (palmData: any) => void;
  palmData: any;
  setPalmData?: (data: any) => void; // Optional since not used
}

export const HandPhotosStep: React.FC<HandPhotosStepProps> = ({ onNext, palmData }) => {
  // Safe initialization with optional chaining and fallback
  const [leftHandImage, setLeftHandImage] = useState<string | null>(palmData?.leftPalmImage || null);
  const [rightHandImage, setRightHandImage] = useState<string | null>(palmData?.rightPalmImage || null);
  const [error, setError] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentHandType, setCurrentHandType] = useState<'left' | 'right'>('left');
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const openCameraModal = async (hand: 'left' | 'right') => {
    try {
      // Request camera permissions
      if (!permission?.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Please allow camera access to take palm photos.');
          return;
        }
      }

      setCurrentHandType(hand);
      setShowCameraModal(true);
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        const imageUri = photo.uri;
        
        if (currentHandType === 'left') {
          setLeftHandImage(imageUri);
        } else {
          setRightHandImage(imageUri);
        }
        
        setShowCameraModal(false);
        
        // Check if both images are now captured and auto-proceed
        const updatedLeftImage = currentHandType === 'left' ? imageUri : leftHandImage;
        const updatedRightImage = currentHandType === 'right' ? imageUri : rightHandImage;
        
        if (updatedLeftImage && updatedRightImage) {
          // Auto-proceed when both images are captured
          setTimeout(() => {
            const updatedPalmData = {
              leftPalmImage: updatedLeftImage,
              rightPalmImage: updatedRightImage
            };
            onNext(updatedPalmData);
          }, 500); // Small delay to show the second image
        }
      } catch (err) {
        console.error('Error taking picture:', err);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    }
  };

  const pickImage = async (hand: 'left' | 'right') => {
    // This is now used for gallery selection only
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        if (hand === 'left') {
          setLeftHandImage(imageUri);
        } else {
          setRightHandImage(imageUri);
        }
        
        // Check if both images are now captured and auto-proceed
        const updatedLeftImage = hand === 'left' ? imageUri : leftHandImage;
        const updatedRightImage = hand === 'right' ? imageUri : rightHandImage;
        
        if (updatedLeftImage && updatedRightImage) {
          // Auto-proceed when both images are captured
          setTimeout(() => {
            const updatedPalmData = {
              leftPalmImage: updatedLeftImage,
              rightPalmImage: updatedRightImage
            };
            onNext(updatedPalmData);
          }, 500); // Small delay to show the second image
        }
      }
    } catch (err) {
      console.error('Error picking image from gallery:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };


  const showImageOptions = (hand: 'left' | 'right') => {
    Alert.alert(
      'Select Image',
      'Choose how you want to capture your palm',
      [
        { text: 'Take Photo with Guide', onPress: () => openCameraModal(hand) },
        { text: 'Choose from Gallery', onPress: () => pickImage(hand) },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };


  const removeImage = (hand: 'left' | 'right') => {
    if (hand === 'left') {
      setLeftHandImage(null);
    } else {
      setRightHandImage(null);
    }
    setError('');
  };

  return (
    <>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEnabled={true}
        >
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.emoji}>📸</Text>
              <Text style={styles.title}>Capture your palms</Text>
              <Text style={styles.subtitle}>Your palms hold the secrets ✨</Text>
            </View>
            
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>💡</Text>
                <Text style={styles.instructionText}>Good lighting</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>✋</Text>
                <Text style={styles.instructionText}>Palm flat & open</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionEmoji}>🎯</Text>
                <Text style={styles.instructionText}>Center in frame</Text>
              </View>
            </View>

            <View style={styles.photosContainer}>
              <View style={styles.photoSection}>
                <Text style={styles.handLabel}>Left Palm</Text>
                <TouchableOpacity 
                  style={[styles.photoButton, leftHandImage && styles.photoButtonFilled]} 
                  onPress={() => showImageOptions('left')}
                >
                  {leftHandImage ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: leftHandImage }} style={styles.handImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.imageOverlay}
                      />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeImage('left')}
                      >
                        <Ionicons name="refresh" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="camera" size={32} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.placeholderText}>Tap to capture</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.photoSection}>
                <Text style={styles.handLabel}>Right Palm</Text>
                <TouchableOpacity 
                  style={[styles.photoButton, rightHandImage && styles.photoButtonFilled]} 
                  onPress={() => showImageOptions('right')}
                >
                  {rightHandImage ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: rightHandImage }} style={styles.handImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.imageOverlay}
                      />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeImage('right')}
                      >
                        <Ionicons name="refresh" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="camera" size={32} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.placeholderText}>Tap to capture</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Camera Modal with Positioning Overlay */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            ref={setCameraRef}
          >
            <PalmPositioningOverlay handType={currentHandType} />
            
            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCameraModal(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              
              <View style={styles.centerControls}>
                <Text style={styles.handInstruction}>
                  Position your {currentHandType} palm in the outline
                </Text>
              </View>
              
              <View style={styles.captureControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
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
    paddingHorizontal: 20,
    paddingBottom: 60,
    minHeight: screenHeight - 120,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: screenHeight < 800 ? 15 : 25,
  },
  emoji: {
    fontSize: screenHeight < 800 ? 35 : 45,
    marginBottom: screenHeight < 800 ? 8 : 12,
  },
  title: {
    fontSize: screenHeight < 800 ? 22 : 26,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: screenHeight < 800 ? 13 : 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: screenHeight < 800 ? 10 : 14,
    marginBottom: screenHeight < 800 ? 15 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: screenHeight < 800 ? 4 : 6,
  },
  instructionEmoji: {
    fontSize: screenHeight < 800 ? 16 : 18,
    marginRight: 10,
  },
  instructionText: {
    fontSize: screenHeight < 800 ? 13 : 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    minHeight: screenHeight < 800 ? 120 : 150,
  },
  photoSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  handLabel: {
    fontSize: screenHeight < 800 ? 14 : 16,
    fontWeight: '700',
    marginBottom: screenHeight < 800 ? 10 : 12,
    textAlign: 'center',
    color: 'white',
  },
  photoButton: {
    height: screenHeight < 800 ? 110 : 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  photoButtonFilled: {
    borderStyle: 'solid',
    borderColor: '#FCD34D',
    borderWidth: 3,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  handImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  removeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: screenHeight < 800 ? 12 : 13,
    fontWeight: '600',
  },
  error: {
    color: '#FCD34D',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  // Camera Modal Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },
  centerControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  handInstruction: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});