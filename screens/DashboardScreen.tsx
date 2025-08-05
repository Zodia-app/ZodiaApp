import { ErrorService, ErrorType } from '../services/errorService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';

const DashboardScreen = () => {
  const navigation = useNavigation();
  useScreenTracking();
  const analytics = useAnalytics();

  // Add state for error handling and data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Load user data and daily content on mount
  useEffect(() => {
    loadUserData();
    fetchDailyContent();
  }, []);

  // Load user data from storage or navigation params
  const loadUserData = async () => {
    try {
      // Try to get user data from AsyncStorage first
      const storedUserData = await AsyncStorage.getItem('userProfile');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Non-critical error, don't show to user
    }
  };

  // Fetch daily horoscope and other content
  const fetchDailyContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowRetry(false);
      
      // Simulate fetching daily horoscope (replace with your actual API call)
      // const horoscope = await generateDailyHoroscope(userData?.zodiacSign);
      
      // For now, using mock data - replace with actual API call
      const mockHoroscope = {
        date: new Date().toDateString(),
        content: "Today brings new opportunities for growth and discovery.",
        luckyNumber: 7,
        color: "Purple"
      };
      
      setDailyHoroscope(mockHoroscope);
      
      // Cache for offline use
      await AsyncStorage.setItem(
        'cachedDailyHoroscope',
        JSON.stringify({
          data: mockHoroscope,
          date: new Date().toDateString(),
          zodiacSign: userData?.zodiacSign
        })
      );
      
      setIsOffline(false);
      
    } catch (error) {
      const handledError = ErrorService.handle(error);
      
      // If network error, try to load cached content
      if (handledError.type === ErrorType.NETWORK_ERROR) {
        try {
          const cached = await AsyncStorage.getItem('cachedDailyHoroscope');
          if (cached) {
            const { data, date } = JSON.parse(cached);
            // Check if cache is from today
            if (date === new Date().toDateString()) {
              setDailyHoroscope(data);
              setIsOffline(true); // Show offline indicator
              setError(null); // Clear error since we have cached data
              return;
            } else {
              // Cache is old
              setError('Unable to fetch new content. Showing yesterday\'s reading.');
              setDailyHoroscope(data);
              setIsOffline(true);
            }
          } else {
            // No cache available
            setError('No internet connection. Please connect to load your daily reading.');
            setIsOffline(true);
          }
        } catch (cacheError) {
          console.error('Failed to load cache:', cacheError);
          setError(handledError.message);
        }
      } else {
        // Non-network error
        setError(handledError.message);
      }
      
      // Show retry for recoverable errors
      if (handledError.isRecoverable) {
        setShowRetry(true);
      }
      
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchDailyContent();
  };

  // Retry handler
  const handleRetry = () => {
    setShowRetry(false);
    fetchDailyContent();
  };

  // Feature press with error handling
  const handleFeaturePress = async (feature: string, screen: string) => {
    try {
      // Track analytics
      analytics.trackFeatureUsed(feature);
      
      // Check if feature requires internet
      const onlineRequiredFeatures = ['astrology', 'compatibility', 'dream-interpreter'];
      
      if (onlineRequiredFeatures.includes(feature) && isOffline) {
        Alert.alert(
          'Internet Required',
          'This feature requires an internet connection. Please connect and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Retry', 
              onPress: async () => {
                await fetchDailyContent(); // Check connection
                if (!isOffline) {
                  navigation.navigate(screen as never);
                }
              }
            }
          ]
        );
        return;
      }
      
      // Navigate to the screen
      navigation.navigate(screen as never);
      
    } catch (error) {
      const handledError = ErrorService.handle(error);
      Alert.alert('Navigation Error', handledError.message);
    }
  };

  const handleZodiacCalculator = () => {
    try {
      analytics.trackEvent('Zodiac Calculator Clicked');
      // Navigate to calculator or show modal
      // navigation.navigate('ZodiacCalculator' as never);
      Alert.alert('Coming Soon', 'Zodiac Calculator will be available soon!');
    } catch (error) {
      console.error('Failed to open zodiac calculator:', error);
    }
  };

  const handleRequestReading = () => {
    try {
      analytics.trackEvent('Request Reading Clicked');
      
      if (isOffline) {
        Alert.alert(
          'Offline Mode',
          'You need an internet connection to request a reading.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      navigation.navigate('ReadingRequest' as never);
    } catch (error) {
      const handledError = ErrorService.handle(error);
      Alert.alert('Error', handledError.message);
    }
  };

  // Error banner component
  const ErrorBanner = () => {
    if (!error && !isOffline) return null;
    
    return (
      <View style={styles.errorBanner}>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={20} color="#F59E0B" />
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            {showRetry && (
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Welcome text with user name
  const getWelcomeText = () => {
    if (userData?.name) {
      return `Welcome, ${userData.name}!`;
    }
    return 'Welcome, Cosmic Traveler!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Error/Offline Banner */}
        <ErrorBanner />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>{getWelcomeText()}</Text>
              <Text style={styles.dateText}>Tuesday, August 5, 2025</Text>
              {userData?.zodiacSign && (
                <Text style={styles.zodiacText}>☆ {userData.zodiacSign} ☆</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.profileIcon}
              onPress={() => navigation.navigate('Profile' as never)}
            >
              <Ionicons name="person-circle" size={40} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading your cosmic insights...</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.zodiacButton}
            onPress={handleZodiacCalculator}
          >
            <Ionicons name="calculator" size={24} color="white" />
            <Text style={styles.zodiacButtonText}>Test Zodiac Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.requestButton, isOffline && styles.disabledButton]}
            onPress={handleRequestReading}
            disabled={isOffline}
          >
            <Ionicons name="sparkles" size={24} color="white" />
            <Text style={styles.requestButtonText}>Request a Reading</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Daily Report Card */}
        <TouchableOpacity 
          style={styles.dailyReportCard}
          onPress={() => {
            if (dailyHoroscope) {
              // Navigate to daily report details
              analytics.trackEvent('Daily Report Clicked');
            } else {
              handleRetry();
            }
          }}
        >
          <View style={styles.dailyReportHeader}>
            <Text style={styles.dailyReportTitle}>Daily Report</Text>
            <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.dailyReportDate}>Tuesday, August 5, 2025</Text>
          {dailyHoroscope && (
            <Text style={styles.horoscopePreview} numberOfLines={2}>
              {dailyHoroscope.content}
            </Text>
          )}
        </TouchableOpacity>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          <TouchableOpacity 
            style={[styles.featureCard, styles.astrologyCard]}
            onPress={() => handleFeaturePress('astrology', 'AstrologyScreen')}
          >
            <Ionicons name="star" size={40} color="white" />
            <Text style={styles.featureTitle}>Astrology</Text>
            <Text style={styles.featureSubtitle}>Get Your Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, styles.palmCard]}
            onPress={() => handleFeaturePress('palm-reading', 'PalmIntro')}
          >
            <Ionicons name="hand-left" size={40} color="white" />
            <Text style={styles.featureTitle}>Palm Reading</Text>
            <Text style={styles.featureSubtitle}>Scan Your Palm</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, styles.dreamCard]}
            onPress={() => handleFeaturePress('dream-interpreter', 'DreamInterpreter')}
          >
            <Ionicons name="moon" size={40} color="white" />
            <Text style={styles.featureTitle}>Dream Interpreter</Text>
            <Text style={styles.featureSubtitle}>Decode Dreams</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, styles.matchCard]}
            onPress={() => handleFeaturePress('compatibility', 'CompatibilityAnalysis')}
          >
            <Ionicons name="heart" size={40} color="white" />
            <Text style={styles.featureTitle}>Zodiac Match</Text>
            <Text style={styles.featureSubtitle}>Check Compatibility</Text>
          </TouchableOpacity>
        </View>

        {/* Add some bottom padding so content doesn't hide behind tab bar */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  zodiacText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginTop: 2,
    fontWeight: '600',
  },
  profileIcon: {
    padding: 5,
  },
  actionSection: {
    padding: 20,
    gap: 15,
  },
  zodiacButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  zodiacButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  requestButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dailyReportCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyReportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dailyReportDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  horoscopePreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  featureCard: {
    width: '47%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  astrologyCard: {
    backgroundColor: '#9C88FF',
  },
  palmCard: {
    backgroundColor: '#54A0FF',
  },
  dreamCard: {
    backgroundColor: '#48DBFB',
  },
  matchCard: {
    backgroundColor: '#FF6B6B',
  },
  featureTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  featureSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  // New styles for error handling
  errorBanner: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  offlineText: {
    color: '#92400E',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    marginLeft: 8,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
});

export default DashboardScreen;