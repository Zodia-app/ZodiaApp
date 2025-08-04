import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIReadingDisplay from '../components/AIReadingDisplay';
import { generateClairvoyanceReading } from '../services/openai';

const ClairvoyanceReadingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { question } = route.params as { question?: string } || {};
  
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userContext, setUserContext] = useState<any>({});

  useEffect(() => {
    generateReading();
  }, []);

  const generateReading = async () => {
    try {
      // Get user data
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      
      setUserContext({
        name: userData.name,
        zodiacSign: userData.zodiacSign,
        birthDate: userData.birthDate,
      });

      // Generate AI clairvoyance reading
      const reading = await generateClairvoyanceReading({
        name: userData.name,
        question: question,
        birthDate: userData.birthDate,
      });

      setAiResponse(reading);
    } catch (error) {
      console.error('Error generating clairvoyance reading:', error);
      setAiResponse(getFallbackReading());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackReading = (): string => {
    return `Clairvoyant Vision\n\nThe Veil Parts...\nYour presence radiates powerful energy that transcends the physical realm. The universe has important messages for you at this pivotal moment.\n\nImmediate Insights\nA significant shift approaches in your life's journey. The signs have been present, waiting for your recognition. Trust your intuition as it guides you through upcoming transitions.\n\nHidden Influences\nUnseen forces work in your favor, though patience is required. What appears as obstacles are actually stepping stones to your greater purpose.\n\nSpiritual Guidance\nYour spiritual guides are particularly active now. Pay attention to synchronicities, repeated numbers, and unexpected encounters - these carry messages meant specifically for you.\n\nThe Path Forward\nThree major energies converge in your near future:\n- Transformation through release\n- Unexpected opportunities through new connections\n- Spiritual awakening through self-discovery\n\nFinal Message\nThe universe conspires in your favor. Trust the journey, even when the path seems unclear. Your destiny unfolds perfectly in divine timing.`;
  };

  const handleGenerateNew = async () => {
    setIsLoading(true);
    await generateReading();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AIReadingDisplay
        readingType="clairvoyance"
        aiResponse={aiResponse}
        userContext={userContext}
        onGenerateNew={handleGenerateNew}
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

export default ClairvoyanceReadingScreen;