import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palmReadingService } from '../../services/palmReading/palmReadingService';

export const PalmReadingWaitingScreen: React.FC<any> = ({ navigation, route }) => {
  const { readingData } = route.params || {};
  const [statusMessage, setStatusMessage] = useState('✨ Reading your palm vibes...');

  useEffect(() => {
    const performPalmReading = async () => {
      try {
        console.log('=== DEBUGGING PALM READING ===');
        console.log('readingData:', readingData);
        console.log('userData:', readingData?.userData);
        console.log('palmData:', readingData?.palmData);
        
        const { userData, palmData } = readingData || {};
        const { leftPalmImage, rightPalmImage } = palmData || {};
        
        console.log('leftPalmImage:', leftPalmImage);
        console.log('rightPalmImage:', rightPalmImage);
        console.log('================================');
        
        if (!leftPalmImage || !rightPalmImage) {
          throw new Error('Palm images are missing');
        }

        setStatusMessage('🔮 AI is decoding your future...');
        
        // Prepare the form data for the service
        const formData = {
          name: userData?.name || 'User',
          dateOfBirth: userData?.dateOfBirth,
          timeOfBirth: userData?.timeOfBirth || '',
          gender: userData?.gender,
          relationshipStatus: userData?.relationshipStatus,
          leftHandImage: leftPalmImage,
          rightHandImage: rightPalmImage,
          focusAreas: userData?.focusAreas || [],
          struggles: userData?.struggles || '',
          goals: userData?.goals || '',
          placeOfBirth: userData?.placeOfBirth || { city: '', state: '', country: '' }
        };

        console.log('Starting palm reading analysis...');
        setStatusMessage('🌟 Almost done, cooking up your destiny...');
        
        const result = await palmReadingService.submitPalmReading(formData);
        
        console.log('Palm reading completed successfully:', result);
        
        // Navigate to results with the completed reading
        navigation.replace('PalmReadingResult', { 
          readingResult: result,
          readingData: readingData
        });
        
      } catch (error) {
        console.error('Palm reading error:', error);
        Alert.alert(
          'Reading Failed', 
          'Unable to generate your palm reading. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => navigation.goBack()
            },
            {
              text: 'Cancel',
              onPress: () => navigation.navigate('MainTabs')
            }
          ]
        );
      }
    };

    if (readingData) {
      performPalmReading();
    }
  }, [readingData]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.title}>✨ AI Reading Your Palms ✨</Text>
        <Text style={styles.subtitle}>
          {statusMessage}
        </Text>
        <Text style={styles.waitTime}>
          The universe is spilling the tea about your life... ☕️✨
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  waitTime: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});