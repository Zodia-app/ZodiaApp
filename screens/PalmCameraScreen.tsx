import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PalmReadingService, PalmReadingRequest } from '../services/palmReadingService';

export default function PalmCameraScreen({ navigation, route }) {
  const { userId, userName, dateOfBirth, gender, relationshipStatus } = route.params;
  const cameraRef = useRef<Camera>(null);
  
  // State management
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'gallery' | null>(null);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [selectedHand, setSelectedHand] = useState<'left' | 'right'>('right');
  const [readingType, setReadingType] = useState<'quick' | 'detailed'>('quick');

  useEffect(() => {
    requestCameraPermissions();
  }, []);

  const requestCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestGalleryPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to select palm images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
        setShowPreview(true);
        setUploadMethod('camera');
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestGalleryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setShowPreview(true);
        setUploadMethod('gallery');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Prepare reading request
      const readingRequest: PalmReadingRequest = {
        userId: userId,
        userName: userName || 'Seeker',
        imageUri: capturedImage,
        handedness: selectedHand,
        dateOfBirth: dateOfBirth,
        gender: gender,
        relationshipStatus: relationshipStatus,
        readingType: readingType,
      };

      // Generate the palm reading
      const result = await PalmReadingService.generateReading(readingRequest);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Navigate to results screen with the reading
      setTimeout(() => {
        navigation.navigate('PalmReadingResultScreen', {
          reading: result,
          imageUri: capturedImage
        });
      }, 500);

    } catch (error) {
      console.error('Palm reading failed:', error);
      Alert.alert(
        'Reading Failed',
        error instanceof Error ? error.message : 'Unable to process your palm reading. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setUploadMethod(null);
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  // Hand selector component
  const HandSelector = () => (
    <View style={styles.handSelector}>
      <Text style={styles.handSelectorTitle}>Which hand?</Text>
      <View style={styles.handButtons}>
        <TouchableOpacity
          style={[
            styles.handButton,
            selectedHand === 'left' && styles.handButtonActive
          ]}
          onPress={() => setSelectedHand('left')}
        >
          <Ionicons name="hand-left-outline" size={30} color={selectedHand === 'left' ? '#fff' : '#666'} />
          <Text style={[
            styles.handButtonText,
            selectedHand === 'left' && styles.handButtonTextActive
          ]}>Left</Text>
          <Text style={styles.handButtonSubtext}>Non-dominant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.handButton,
            selectedHand === 'right' && styles.handButtonActive
          ]}
          onPress={() => setSelectedHand('right')}
        >
          <Ionicons name="hand-right-outline" size={30} color={selectedHand === 'right' ? '#fff' : '#666'} />
          <Text style={[
            styles.handButtonText,
            selectedHand === 'right' && styles.handButtonTextActive
          ]}>Right</Text>
          <Text style={styles.handButtonSubtext}>Dominant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Reading type selector
  const ReadingTypeSelector = () => (
    <View style={styles.readingTypeSelector}>
      <Text style={styles.readingTypeSelectorTitle}>Reading Type</Text>
      <View style={styles.readingTypeButtons}>
        <TouchableOpacity
          style={[
            styles.readingTypeButton,
            readingType === 'quick' && styles.readingTypeButtonActive
          ]}
          onPress={() => setReadingType('quick')}
        >
          <Ionicons name="flash-outline" size={24} color={readingType === 'quick' ? '#fff' : '#666'} />
          <Text style={[
            styles.readingTypeButtonText,
            readingType === 'quick' && styles.readingTypeButtonTextActive
          ]}>Quick Reading</Text>
          <Text style={styles.readingTypeButtonSubtext}>Essential insights</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.readingTypeButton,
            readingType === 'detailed' && styles.readingTypeButtonActive
          ]}
          onPress={() => setReadingType('detailed')}
        >
          <Ionicons name="book-outline" size={24} color={readingType === 'detailed' ? '#fff' : '#666'} />
          <Text style={[
            styles.readingTypeButtonText,
            readingType === 'detailed' && styles.readingTypeButtonTextActive
          ]}>Detailed Reading</Text>
          <Text style={styles.readingTypeButtonSubtext}>Comprehensive analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Permission denied screen
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Camera permission is required for palm reading
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermissions}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading screen
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  // Upload method selection screen
  if (!uploadMethod && !capturedImage) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#0a0a0a']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Palm Reading</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Choose how to provide your palm image
            </Text>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => setUploadMethod('camera')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={40} color="#9333ea" />
                </View>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionDescription}>
                  Use your camera to capture your palm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadOption}
                onPress={pickImageFromGallery}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={40} color="#9333ea" />
                </View>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionDescription}>
                  Select an existing photo of your palm
                </Text>
              </TouchableOpacity>
            </View>

            <HandSelector />
            <ReadingTypeSelector />

            <View style={styles.tips}>
              <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={20} color="#9333ea" />
                <Text style={styles.tipText}>Ensure good lighting</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={20} color="#9333ea" />
                <Text style={styles.tipText}>Keep palm flat and open</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={20} color="#9333ea" />
                <Text style={styles.tipText}>Include all fingers in frame</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={20} color="#9333ea" />
                <Text style={styles.tipText}>Avoid shadows on palm lines</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }

  // Camera view
  if (uploadMethod === 'camera' && !capturedImage) {
    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setUploadMethod(null)}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFlash}>
                <Ionicons
                  name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
                  size={30}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.palmGuideContainer}>
              <View style={styles.palmGuide}>
                <Text style={styles.guideText}>Position your {selectedHand} palm here</Text>
              </View>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }

  // Image preview and upload screen
  if (capturedImage && showPreview) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#0a0a0a']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={retakePicture}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Review Image</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          </View>

          <View style={styles.readingInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hand:</Text>
              <Text style={styles.infoValue}>{selectedHand === 'left' ? 'Left' : 'Right'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reading Type:</Text>
              <Text style={styles.infoValue}>{readingType === 'quick' ? 'Quick' : 'Detailed'}</Text>
            </View>
          </View>

          {isUploading ? (
            <View style={styles.uploadProgressContainer}>
              <Text style={styles.uploadingText}>Processing your palm reading...</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={retakePicture}
              >
                <Ionicons name="camera-reverse" size={20} color="#fff" />
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleUpload}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.buttonText}>Get Reading</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadOptions: {
    gap: 20,
    marginBottom: 30,
  },
  uploadOption: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  handSelector: {
    marginBottom: 20,
    alignItems: 'center',
  },
  handSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  handButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  handButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  handButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderColor: '#9333ea',
  },
  handButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  handButtonTextActive: {
    color: '#fff',
  },
  handButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  readingTypeSelector: {
    marginBottom: 30,
    alignItems: 'center',
  },
  readingTypeSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  readingTypeButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  readingTypeButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  readingTypeButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderColor: '#9333ea',
  },
  readingTypeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  readingTypeButtonTextActive: {
    color: '#fff',
  },
  readingTypeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  tips: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  tipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  palmGuideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palmGuide: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.6)',
    borderRadius: 125,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    margin: 20,
  },
  previewImage: {
    flex: 1,
    borderRadius: 12,
  },
  readingInfo: {
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadProgressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9333ea',
    borderRadius: 4,
  },
  progressText: {
    color: '#9333ea',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#9333ea',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});