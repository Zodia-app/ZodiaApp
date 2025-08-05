import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PalmCameraScreen = () => {
  // Use hooks instead of props
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const cameraRef = React.useRef<any>(null);

  // Simple mock implementation to test navigation
  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleContinue = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('PalmReadingResult', {
        images: ['mock-left-hand.jpg', 'mock-right-hand.jpg']
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Your Palms</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Camera View</Text>
          <Text style={styles.instructionText}>
            (Mock camera - tap Continue to proceed)
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue with Mock Images</Text>
        </TouchableOpacity>
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
  backText: {
    color: '#8B5CF6',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    height: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  placeholderText: {
    color: '#E2E8F0',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PalmCameraScreen;
