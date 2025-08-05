import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';

const PalmCameraScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  useScreenTracking(); // Automatically track screen view
  const analytics = useAnalytics();
  
  const [capturedHands, setCapturedHands] = useState<string[]>([]);
  const [currentHand, setCurrentHand] = useState<'left' | 'right'>('left');

  const handleGoBack = () => {
    analytics.trackEvent('Palm Camera Back Button Pressed');
    navigation.goBack();
  };

  const handleCapture = () => {
    // Track palm capture
    analytics.trackPalmCaptured(currentHand);
    
    const mockImageUri = `mock-${currentHand}-hand-${Date.now()}.jpg`;
    const newCapturedHands = [...capturedHands, mockImageUri];
    setCapturedHands(newCapturedHands);

    if (currentHand === 'left') {
      setCurrentHand('right');
      Alert.alert(
        'Left Hand Captured',
        'Great! Now position your right hand.',
        [{ text: 'OK' }]
      );
    } else {
      // Both hands captured - track completion
      analytics.trackEvent('Both Palms Captured');
      analytics.trackPalmReadingCompleted();
      analytics.trackEvent('Navigating to Palm Results');
      
      navigation.navigate('PalmReadingResult', {
        images: newCapturedHands
      });
    }
  };

  const handleRetake = () => {
    analytics.trackEvent('Palm Photos Retake Requested');
    setCapturedHands([]);
    setCurrentHand('left');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Your Palms</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, capturedHands.length > 0 && styles.progressDotActive]} />
          <View style={styles.progressLine} />
          <View style={[styles.progressDot, capturedHands.length > 1 && styles.progressDotActive]} />
        </View>
        <Text style={styles.progressText}>
          {capturedHands.length === 0 ? 'Capture left hand' : 
           capturedHands.length === 1 ? 'Capture right hand' : 
           'Both hands captured'}
        </Text>

        {/* Camera Placeholder */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <Ionicons 
              name={currentHand === 'left' ? 'hand-left' : 'hand-right'} 
              size={80} 
              color="#8B5CF6" 
            />
            <Text style={styles.handText}>
              Position your {currentHand} hand
            </Text>
          </View>

          {/* Overlay Guide */}
          <View style={styles.guideOverlay}>
            <View style={styles.handGuide}>
              <Text style={styles.guideText}>
                Place hand within frame
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          {currentHand === 'left' 
            ? "Position your left palm flat, fingers spread, in good lighting"
            : "Now position your right palm the same way"}
        </Text>

        {/* Capture Button */}
        {capturedHands.length < 2 ? (
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <Ionicons name="camera" size={40} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
              <Text style={styles.retakeButtonText}>Retake Photos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#475569',
  },
  progressDotActive: {
    backgroundColor: '#8B5CF6',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#475569',
    marginHorizontal: 5,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handText: {
    color: '#E2E8F0',
    fontSize: 18,
    marginTop: 20,
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  handGuide: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    borderRadius: 20,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  guideText: {
    color: '#E2E8F0',
    fontSize: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionButtons: {
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  retakeButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PalmCameraScreen;