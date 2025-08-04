import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIReadingDisplay from '../components/AIReadingDisplay';
import { generatePalmReading } from '../services/openai';
import { analyzePalmImage } from '../services/palmAnalysis';

const PalmReadingResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, readingType } = route.params as { 
    imageUri: string; 
    readingType: 'teaser' | 'full' 
  };
  
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userContext, setUserContext] = useState<any>({});

  useEffect(() => {
    generatePalmReadingFromImage();
  }, []);

  const generatePalmReadingFromImage = async () => {
    try {
      // Analyze palm image (mock for now)
      const palmFeatures = await analyzePalmImage(imageUri);
      
      // Get user data
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      
      setUserContext({
        name: userData.name,
        zodiacSign: userData.zodiacSign,
      });

      // Generate AI reading based on palm features
      const reading = await generatePalmReading({
        palmFeatures,
        name: userData.name,
        readingType: readingType,
      });

      setAiResponse(reading);
    } catch (error) {
      console.error('Error generating palm reading:', error);
      setAiResponse(getFallbackPalmReading(readingType));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackPalmReading = (type: string): string => {
    if (type === 'teaser') {
      return `Palm Reading Overview\nYour palm reveals a fascinating life journey ahead.\n\nKey Line\nYour life line shows strength and vitality.\n\nSpecial Mark\nA unique formation suggests hidden talents.`;
    }
    
    return `Detailed Palm Analysis\n\nLife Line\nYour life line is deep and well-defined, indicating robust health and vitality. The curve suggests an adventurous spirit and openness to new experiences.\n\nHeart Line\nThe heart line reveals emotional depth and capacity for meaningful relationships. Its clarity indicates emotional intelligence and empathy.\n\nHead Line\nYour head line shows strong analytical abilities and clear thinking. The length suggests intellectual curiosity and love of learning.\n\nFate Line\nA prominent fate line indicates a clear sense of purpose and direction in life. You are likely to achieve your goals through determination.\n\nSpecial Markings\nUnique formations on your palm suggest creative abilities and intuitive gifts that may not yet be fully developed.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AIReadingDisplay
        readingType="palm"
        aiResponse={aiResponse}
        userContext={userContext}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

export default PalmReadingResultScreen;