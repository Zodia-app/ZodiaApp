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
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const navigation = useNavigation();

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
      
      // For now, using mock data - replace with actual API call
      const mockHoroscope = {
        date: new Date().toDateString(),
        content: "Today brings new opportunities for growth and discovery. The alignment of the stars suggests a favorable time for new beginnings and creative pursuits. Trust your intuition.",
        luckyNumber: 7,
        color: "Purple",
        moonPhase: "Waxing Crescent",
        ritual: "Light a white candle and set your intentions for the day",
        tarotCard: "The Star - Hope and renewal are on the horizon"
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
      
    } catch (error: any) {
      // Simple error handling without ErrorService
      console.error('Failed to fetch daily content:', error);
      
      // Try to load cached content
      try {
        const cached = await AsyncStorage.getItem('cachedDailyHoroscope');
        if (cached) {
          const { data, date } = JSON.parse(cached);
          setDailyHoroscope(data);
          setIsOffline(true);
          if (date !== new Date().toDateString()) {
            setError('Showing cached content from previous day');
          }
        } else {
          setError('Unable to load daily content. Please check your connection.');
          setShowRetry(true);
        }
      } catch (cacheError) {
        console.error('Failed to load cache:', cacheError);
        setError('Unable to load content. Please try again.');
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

  // Feature press handler
  const handleFeaturePress = async (feature: string, screen: string) => {
    try {
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
      Alert.alert('Navigation Error', 'Unable to open this feature. Please try again.');
    }
  };

  const handleZodiacCalculator = () => {
    try {
      Alert.alert('Coming Soon', 'Zodiac Calculator will be available soon!');
    } catch (error) {
      console.error('Failed to open zodiac calculator:', error);
    }
  };

  const handleRequestReading = () => {
    try {
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
      Alert.alert('Error', 'Unable to request reading. Please try again.');
    }
  };

  const handleDailyReportPress = () => {
    // Show expanded daily report
    if (!dailyHoroscope) {
      handleRetry();
      return;
    }

    Alert.alert(
      'Daily Report',
      `${dailyHoroscope.content}\n\n🌙 Moon Phase: ${dailyHoroscope.moonPhase}\n🎴 Tarot: ${dailyHoroscope.tarotCard}\n✨ Ritual: ${dailyHoroscope.ritual}\n🎨 Color: ${dailyHoroscope.color}\n🔢 Lucky Number: ${dailyHoroscope.luckyNumber}`,
      [{ text: 'OK' }]
    );
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

        {/* Daily Report Card - Enhanced */}
        <TouchableOpacity 
          style={styles.dailyReportCard}
          onPress={handleDailyReportPress}
        >
          <View style={styles.dailyReportHeader}>
            <Text style={styles.dailyReportTitle}>✨ Daily Report</Text>
            <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.dailyReportDate}>Tuesday, August 5, 2025</Text>
          
          {dailyHoroscope && (
            <>
              <Text style={styles.horoscopePreview} numberOfLines={3}>
                {dailyHoroscope.content}
              </Text>
              
              <View style={styles.dailyHighlights}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>🌙</Text>
                  <Text style={styles.highlightText}>{dailyHoroscope.moonPhase}</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>🎴</Text>
                  <Text style={styles.highlightText}>Daily Card</Text>
                </View>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>✨</Text>
                  <Text style={styles.highlightText}>Ritual</Text>
                </View>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.zodiacButton}
            onPress={handleZodiacCalculator}
          >
            <Ionicons name="calculator" size={24} color="white" />
            <Text style={styles.zodiacButtonText}>Zodiac Calculator</Text>
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
            onPress={() => handleFeaturePress('palm-reading', 'PalmCamera')}
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

        {/* Educational Section */}
        <View style={styles.educationalSection}>
          <Text style={styles.sectionTitle}>📚 Learn & Explore</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.educationalCard}>
              <Text style={styles.educationalEmoji}>♈</Text>
              <Text style={styles.educationalTitle}>Zodiac Signs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.educationalCard}>
              <Text style={styles.educationalEmoji}>🔮</Text>
              <Text style={styles.educationalTitle}>Palmistry 101</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.educationalCard}>
              <Text style={styles.educationalEmoji}>🌙</Text>
              <Text style={styles.educationalTitle}>Moon Phases</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Add some bottom padding */}
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
    marginTop: 20,
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
    marginTop: 12,
    lineHeight: 20,
  },
  dailyHighlights: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  highlightItem: {
    flex: 1,
    alignItems: 'center',
  },
  highlightIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 11,
    color: '#666',
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
  educationalSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  educationalCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 12,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  educationalEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  educationalTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Error handling styles
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