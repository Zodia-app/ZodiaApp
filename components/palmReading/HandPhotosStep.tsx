import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { PalmReadingData } from '../../types/palmReading';

interface HandPhotosStepProps {
  onNext: () => void;
  palmData: Partial<PalmReadingData>;
  setPalmData: (data: Partial<PalmReadingData>) => void;
}

export const HandPhotosStep: React.FC<HandPhotosStepProps> = ({ onNext, palmData, setPalmData }) => {
  const [leftHandImage, setLeftHandImage] = useState<string | null>(palmData.leftHandImage || null);
  const [rightHandImage, setRightHandImage] = useState<string | null>(palmData.rightHandImage || null);
  const [error, setError] = useState('');

  const pickImage = async (hand: 'left' | 'right') => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow camera access to take palm photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (hand === 'left') {
        setLeftHandImage(result.assets[0].uri);
      } else {
        setRightHandImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = () => {
    if (!leftHandImage || !rightHandImage) {
      setError('Please capture both palm photos');
      return;
    }
    setPalmData({ 
      ...palmData, 
      leftHandImage,
      rightHandImage 
    });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture your palms</Text>
      <Text style={styles.subtitle}>Take clear photos in good lighting</Text>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instruction}>📸 Use good lighting</Text>
        <Text style={styles.instruction}>✋ Keep palm flat and open</Text>
        <Text style={styles.instruction}>🎯 Center palm in frame</Text>
      </View>

      <View style={styles.photosContainer}>
        <View style={styles.photoSection}>
          <Text style={styles.handLabel}>Left Hand</Text>
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={() => pickImage('left')}
          >
            {leftHandImage ? (
              <Image source={{ uri: leftHandImage }} style={styles.handImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.placeholderText}>Tap to capture</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.handLabel}>Right Hand</Text>
          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={() => pickImage('right')}
          >
            {rightHandImage ? (
              <Image source={{ uri: rightHandImage }} style={styles.handImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.placeholderText}>Tap to capture</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={[styles.button, (!leftHandImage || !rightHandImage) && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={!leftHandImage || !rightHandImage}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#f3f0ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 14,
    color: '#6B46C1',
    marginVertical: 4,
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  handLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  photoButton: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  handImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    marginBottom: 10,
  },
});