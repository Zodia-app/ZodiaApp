import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoUploadStepProps {
  onNext: () => void;
  userData: any;
  setUserData: (data: any) => void;
  palmData: any;
  setPalmData: (data: any) => void;
}

export const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({ 
  onNext, 
  userData, 
  setUserData,
  palmData,
  setPalmData 
}) => {
  const [leftPalmImage, setLeftPalmImage] = useState<string | null>(null);
  const [rightPalmImage, setRightPalmImage] = useState<string | null>(null);

  const pickImage = async (hand: 'left' | 'right') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take palm photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (hand === 'left') {
        setLeftPalmImage(result.assets[0].uri);
      } else {
        setRightPalmImage(result.assets[0].uri);
      }
    }
  };

  const removeImage = (hand: 'left' | 'right') => {
    if (hand === 'left') {
      setLeftPalmImage(null);
    } else {
      setRightPalmImage(null);
    }
  };

  const handleSubmit = () => {
    if (!leftPalmImage || !rightPalmImage) {
      Alert.alert('Photos Required', 'Please take photos of both palms');
      return;
    }

    setPalmData({
      ...palmData,
      leftPalmImage,
      rightPalmImage,
      capturedAt: new Date().toISOString()
    });

    onNext();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload your palm photos</Text>
        <Text style={styles.subtitle}>Take clear photos of both palms</Text>

        {/* Left Palm */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Left Palm</Text>
          {leftPalmImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: leftPalmImage }} style={styles.palmImage} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeImage('left')}
              >
                <Ionicons name="close-circle" size={30} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => pickImage('left')}
            >
              <Ionicons name="camera-outline" size={40} color="#6B46C1" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right Palm */}
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Right Palm</Text>
          {rightPalmImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: rightPalmImage }} style={styles.palmImage} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeImage('right')}
              >
                <Ionicons name="close-circle" size={30} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => pickImage('right')}
            >
              <Ionicons name="camera-outline" size={40} color="#6B46C1" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📸 Photo Tips:</Text>
          <Text style={styles.tipText}>• Use good lighting</Text>
          <Text style={styles.tipText}>• Keep palm flat and fingers spread</Text>
          <Text style={styles.tipText}>• Capture the entire palm</Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton, 
            (!leftPalmImage || !rightPalmImage) && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={!leftPalmImage || !rightPalmImage}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 30,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  palmImage: {
    width: screenWidth - 40,
    height: (screenWidth - 40) * 0.75,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  tipsContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  tipText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 4,
  },
  continueButton: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});