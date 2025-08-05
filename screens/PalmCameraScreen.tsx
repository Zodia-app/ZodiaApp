import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type HandType = 'left' | 'right';

interface CapturedHand {
  uri: string;
  type: HandType;
}

const PalmCameraScreen = (props?: any) => {
  const navigation = props?.navigation;
  const route = props?.route;
  
  const [capturedHands, setCapturedHands] = useState<CapturedHand[]>([]);
  const [currentHand, setCurrentHand] = useState<HandType>('left');
  const [isProcessing, setIsProcessing] = useState(false);

  const userData = route?.params?.userData || {};

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    }
  };

  // Mock photo capture
  const takePicture = () => {
    // Simulate taking a photo with a placeholder
    const mockPhotoUri = `mock-photo-${currentHand}-${Date.now()}`;
    
    const newCapture: CapturedHand = {
      uri: mockPhotoUri,
      type: currentHand,
    };

    const updatedHands = [...capturedHands, newCapture];
    setCapturedHands(updatedHands);

    if (updatedHands.length === 2) {
      navigateToResult(updatedHands);
    } else {
      setCurrentHand('right');
      Alert.alert(
        'Great!',
        'Now please capture your right hand.',
        [{ text: 'OK' }]
      );
    }
  };

  const navigateToResult = async (hands: CapturedHand[]) => {
    setIsProcessing(true);
    
    const leftHand = hands.find(h => h.type === 'left');
    const rightHand = hands.find(h => h.type === 'right');

    // Navigate to ReadingQueue with mock data
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

  if (!navigation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Navigation not available</Text>
        <Text style={styles.errorSubtext}>This screen must be used within React Navigation</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1a0033', '#000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Palm Reading (Mock)</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.mockCameraView}>
            <Ionicons name="camera" size={100} color="#666" />
            <Text style={styles.mockText}>Camera Preview</Text>
            <Text style={styles.mockSubtext}>(Mock Mode - No actual camera)</Text>
          </View>

          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>
              Capturing {currentHand} hand
            </Text>
            <Text style={styles.guideTip}>
              This is a mock camera screen for testing
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mockCameraView: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mockText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  mockSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  guideContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    padding: 3,
    marginBottom: 40,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#000',
  },
  progressContainer: {
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
});

export default PalmCameraScreen;
