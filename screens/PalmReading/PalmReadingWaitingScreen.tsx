import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palmReadingService } from '../../services/palmReading/palmReadingService';

export const PalmReadingWaitingScreen: React.FC<any> = ({ navigation, route }) => {
  const { readingData } = route.params || {};
  const [statusMessage, setStatusMessage] = useState('🚀 Initializing ultra-optimized reading...');
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [fromCache, setFromCache] = useState(false);

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

        // Check cache first for instant feedback
        setStatusMessage('🔍 Checking intelligent cache...');
        
        // Get current cache stats
        const cacheStats = await palmReadingService.getCacheStats();
        if (cacheStats && cacheStats.totalEntries > 0) {
          setStatusMessage(`💾 Cache ready (${cacheStats.totalEntries} readings, ${cacheStats.hitRate} avg hits)`);
        }
        
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

        console.log('🚀 Starting ULTRA-OPTIMIZED palm reading analysis...');
        setStatusMessage('🗜️ Compressing images for optimal performance...');
        
        // Monitor queue status
        const queueInterval = setInterval(() => {
          const queueStatus = palmReadingService.getQueueStatus();
          if (queueStatus.queueLength > 0) {
            setQueuePosition(queueStatus.queueLength);
            setStatusMessage(`⏳ In queue: ${queueStatus.currentProcessing}/${queueStatus.maxConcurrent} processing, ${queueStatus.queueLength} waiting`);
          }
        }, 1000);
        
        setStatusMessage('🔮 AI is decoding your future with ultra-optimization...');
        
        // Use the ULTRA-OPTIMIZED service
        const result = await palmReadingService.submitPalmReadingUltraOptimized(formData, 'normal');
        
        clearInterval(queueInterval);
        
        // Check if result came from cache
        if (result.performance?.source === 'cache') {
          setFromCache(true);
          setStatusMessage('⚡ Ultra-fast response from intelligent cache!');
        } else {
          setStatusMessage('✅ Analysis complete with full optimization!');
        }
        
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
        <ActivityIndicator 
          size="large" 
          color={fromCache ? "#10B981" : "#6B46C1"} 
        />
        <Text style={styles.title}>
          {fromCache ? "⚡ Ultra-Fast Cache Hit!" : "🚀 Ultra-Optimized Reading"}
        </Text>
        <Text style={styles.subtitle}>
          {statusMessage}
        </Text>
        {queuePosition && (
          <Text style={styles.queueInfo}>
            📊 Position in queue: {queuePosition}
          </Text>
        )}
        {fromCache ? (
          <Text style={styles.cacheInfo}>
            🎯 Instant response from intelligent caching system!
          </Text>
        ) : (
          <Text style={styles.waitTime}>
            🗜️ Compressed images + Smart queue + AI analysis = Optimized experience ✨
          </Text>
        )}
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
  queueInfo: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  cacheInfo: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    textAlign: 'center',
  },
});