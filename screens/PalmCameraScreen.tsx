import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type HandType = 'left' | 'right';

interface CapturedHand {
  uri: string;
  type: HandType;
}

// Make the component defensive against missing props
const PalmCameraScreen = (props?: any) => {
  // Safely handle props that might be undefined
  const navigation = props?.navigation;
  const route = props?.route;
  
  // Log what we're receiving
  console.log('PalmCameraScreen props:', {
    hasProps: !!props,
    hasNavigation: !!navigation,
    hasRoute: !!route,
    propsType: typeof props,
  });
  
  const cameraRef = useRef<Camera>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [type, setType] = useState<CameraType>(CameraType.back);
  const [flash, setFlash] = useState<FlashMode>(FlashMode.off);
  const [capturedHands, setCapturedHands] = useState<CapturedHand[]>([]);
  const [currentHand, setCurrentHand] = useState<HandType>('left');
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get userData from route params
  const userData = route?.params?.userData || {};

  // Request camera permissions on mount
  useEffect(() => {
    requestCameraPermissions();
  }, []);

  const requestCameraPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      // Add a small delay to ensure Camera constants are loaded
      setTimeout(() => setIsCameraReady(true), 100);
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
    }
  };

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else {
      console.warn('Navigation not available for goBack');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPreviewUri(manipulatedImage.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      console.error('Camera capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const acceptPhoto = () => {
    if (!previewUri) return;

    const newCapture: CapturedHand = {
      uri: previewUri,
      type: currentHand,
    };

    const updatedHands = [...capturedHands, newCapture];
    setCapturedHands(updatedHands);

    if (updatedHands.length === 2) {
      navigateToResult(updatedHands);
    } else {
      setCurrentHand('right');
      setPreviewUri(null);
      Alert.alert(
        'Great!',
        'Now please capture your right hand.',
        [{ text: 'OK' }]
      );
    }
  };

  const retakePhoto = () => {
    setPreviewUri(null);
  };

  const navigateToResult = async (hands: CapturedHand[]) => {
    setIsProcessing(true);
    
    const leftHand = hands.find(h => h.type === 'left');
    const rightHand = hands.find(h => h.type === 'right');

    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('ReadingQueue', {
        readingType: 'palm',
        leftHandUri: leftHand?.uri,
        rightHandUri: rightHand?.uri,
        userData: userData,
      });
    } else {
      console.error('Navigation not available for navigate');
      setIsProcessing(false);
    }
  };

  const toggleCameraType = () => {
    setType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlash(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  // Show error if navigation is not available
  if (!navigation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Navigation not available</Text>
        <Text style={styles.errorSubtext}>This screen must be used within React Navigation</Text>
      </View>
    );
  }

  if (hasPermission === null || !isCameraReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B19CD9" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient colors={['#1a0033', '#000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-off" size={80} color="#666" />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              To provide palm readings, Zodia needs access to your camera.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestCameraPermissions}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.permissionButton, { marginTop: 15, backgroundColor: '#666' }]}
              onPress={handleGoBack}
            >
              <Text style={styles.permissionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewTitle}>
            {currentHand === 'left' ? 'Left' : 'Right'} Hand Captured
          </Text>
          <Text style={styles.previewSubtitle}>
            Is this photo clear enough?
          </Text>
        </View>
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.retakeButton]}
            onPress={retakePhoto}
          >
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={acceptPhoto}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        ref={cameraRef}
        style={styles.camera} 
        type={type}
        flashMode={flash}
        onCameraReady={() => console.log('Camera is ready')}
        onMountError={(error) => console.error('Camera mount error:', error)}
      >
        <SafeAreaView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Palm Reading</Text>
          <View style={styles.headerSpacer} />
        </SafeAreaView>

        <View style={styles.guideContainer}>
          <View style={styles.handGuide}>
            <View style={styles.handOutline} />
            <Text style={styles.guideText}>
              Place your {currentHand} hand here
            </Text>
            <Text style={styles.guideTip}>
              Ensure good lighting and spread your fingers
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleFlash}
          >
            <Ionicons 
              name={flash === FlashMode.on ? "flash" : "flash-off"} 
              size={30} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner}>
              {isCapturing && (
                <ActivityIndicator size="small" color="#B19CD9" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[
              styles.progressDot, 
              capturedHands.length > 0 && styles.progressDotActive
            ]} />
          </View>
          <Text style={styles.progressText}>
            {capturedHands.length}/2 hands captured
          </Text>
        </View>
      </Camera>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#B19CD9" />
          <Text style={styles.processingText}>
            Preparing your palm reading...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  camera: {
    flex: 1,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handGuide: {
    alignItems: 'center',
  },
  handOutline: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: '#B19CD9',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  guideText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  guideTip: {
    fontSize: 14,
    color: '#ccc',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 50,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    padding: 3,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#B19CD9',
  },
  progressText: {
    color: '#ccc',
    fontSize: 12,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#B19CD9',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    flex: 1,
  },
  previewOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  previewSubtitle: {
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retakeButton: {
    backgroundColor: '#666',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
});

export default PalmCameraScreen;
