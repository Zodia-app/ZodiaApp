import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { DailyReport } from '../components/DailyReport';
import { supabase } from '../lib/supabase';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';

const DashboardScreen = ({ navigation, route }: any) => {
  useScreenTracking(); // Automatically tracks screen view
  const analytics = useAnalytics();
  
  const { userData: initialUserData } = route.params || {};
  const [userData, setUserData] = useState(initialUserData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
=======
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const navigation = useNavigation();

  // Add state for error handling and data
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  const [error, setError] = useState<string | null>(null);

  // Get current date formatted nicely
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString(undefined, options);
  };

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setUserData({
        id: profile.id,
        name: profile.name || profile.full_name,
        zodiacSign: profile.zodiac_sign,
        birthDate: profile.birth_date ? new Date(profile.birth_date).toISOString() : null,
        timeOfBirth: profile.time_of_birth,
        placeOfBirth: profile.place_of_birth || profile.birth_city,
        gender: profile.gender,
        birthCity: profile.birth_city,
        relationshipStatus: profile.relationship_status,
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError('Unable to load your profile. Please try again.');
      
      // Fallback to default data if available
      if (!userData) {
        setUserData({ name: 'User', zodiacSign: 'Aries' });
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    await fetchUserData();
    setIsLoading(false);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  // Updated handleAstrologyPress with proper userData passing
  const handleAstrologyPress = async () => {
    analytics.trackFeatureUsed('astrology');
    
    try {
<<<<<<< HEAD
      // Ensure we have user data
      if (!userData || !userData.birthDate) {
=======
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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
        Alert.alert(
          'Complete Your Profile',
          'Please complete your profile with your birth date to access astrology readings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') }
          ]
        );
        return;
      }

      // Navigate with complete userData
      navigation.navigate('Astrology', {
        userData: {
          id: userData.id,
          name: userData.name || 'User',
          birthDate: userData.birthDate,
          timeOfBirth: userData.timeOfBirth,
          placeOfBirth: userData.placeOfBirth,
          gender: userData.gender,
          zodiacSign: userData.zodiacSign
        }
      });
    } catch (error) {
<<<<<<< HEAD
      console.error('Error navigating to astrology:', error);
      Alert.alert('Error', 'Unable to access astrology. Please try again.');
    }
  };

  const handlePalmReadingPress = () => {
    analytics.trackFeatureUsed('palm_reading');
    navigation.navigate('PalmIntro', { userData });
  };

  // Feature grid data
  const features = [
    {
      id: 'astrology',
      title: 'Astrology',
      subtitle: 'Get Your Reading',
      icon: 'star' as const,
      screen: 'Astrology',
      color: '#9b59b6',
      onPress: handleAstrologyPress,
    },
    {
      id: 'palm',
      title: 'Palm Reading',
      subtitle: 'Scan Your Palm',
      icon: 'hand-left' as const,
      screen: 'PalmIntro',
      color: '#3498db',
      onPress: handlePalmReadingPress,
    },
    {
      id: 'dream',
      title: 'Dream Interpreter',
      subtitle: 'Decode Dreams',
      icon: 'moon' as const,
      screen: 'DreamInterpreter',
      color: '#2ecc71',
    },
    {
      id: 'compatibility',
      title: 'Zodiac Match',
      subtitle: 'Check Compatibility',
      icon: 'heart' as const,
      screen: 'CompatibilityInput',
      color: '#e74c3c',
    },
    {
      id: 'education',
      title: 'Learn',
      subtitle: 'Educational Materials',
      icon: 'book' as const,
      screen: 'Education',
      color: '#f39c12',
    },
    {
      id: 'clairvoyance',
      title: 'Clairvoyance',
      subtitle: 'Spirit Guidance',
      icon: 'eye' as const,
      screen: 'Clairvoyance',
      color: '#95a5a6',
      disabled: true,
    },
  ];

  const handleFeaturePress = (feature: any) => {
    if (!feature.disabled) {
      // Use custom onPress if provided, otherwise use default navigation
      if (feature.onPress) {
        feature.onPress();
      } else {
        analytics.trackFeatureUsed(feature.id);
        // Fix for Astrology navigation
        const screenName = feature.id === 'astrology' ? 'Astrology' : feature.screen;
        navigation.navigate(screenName, { userData });
      }
    }
  };

  // Show loading state
  if (isLoading) {
=======
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
    
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your cosmic dashboard..." />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage 
          message={error} 
          onRetry={loadDashboard} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {userData?.name || 'Cosmic Traveler'}!</Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { 
          userData: {
            ...userData,
            birthDate: userData?.birthDate?.toString() || null
          }
        })}>
          <Ionicons name="person-circle" size={40} color="#6c5ce7" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6c5ce7"
            colors={['#6c5ce7']}
          />
        }
      >
        {/* Error banner if there's an error but we have cached data */}
        {error && userData && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              ⚠️ Some data may be outdated. Pull down to refresh.
            </Text>
          </View>
        )}

<<<<<<< HEAD
        {/* Test Button for Zodiac Calculator */}
        <View style={styles.testButtonContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => navigation.navigate('ZodiacTest')}
          >
            <Ionicons name="flask" size={20} color="white" />
            <Text style={styles.testButtonText}>Test Zodiac Calculator</Text>
=======
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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
          </TouchableOpacity>
        </View>

        {/* Request a Reading Button */}
        <View style={styles.requestReadingContainer}>
          <TouchableOpacity 
            style={styles.requestReadingButton}
            onPress={() => navigation.navigate('ReadingRequest' as never)}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={24} color="white" />
            <Text style={styles.requestReadingButtonText}>
              Request a Reading 🔮
            </Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

<<<<<<< HEAD
        {/* Daily Report Component */}
        <DailyReport
          zodiacSign={userData?.zodiacSign || 'Aries'}
          userData={userData}
          defaultExpanded={true}
        />

=======
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                { backgroundColor: feature.color },
                feature.disabled && styles.disabledCard,
              ]}
              onPress={() => handleFeaturePress(feature)}
              disabled={feature.disabled}
              activeOpacity={0.8}
            >
              <Ionicons name={feature.icon} size={32} color="white" />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
              {feature.disabled && (
                <Text style={styles.comingSoon}>Coming Soon</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
<<<<<<< HEAD
=======

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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <BottomNavItem 
          icon="home" 
          label="Dashboard" 
          active 
          onPress={() => {}} 
        />
        <BottomNavItem 
          icon="document-text" 
          label="Reports" 
          onPress={() => alert('Reports coming soon!')} 
        />
        <BottomNavItem 
          icon="person" 
          label="Profile" 
          onPress={() => navigation.navigate('Profile', { 
            userData: {
              ...userData,
              birthDate: userData?.birthDate?.toString() || null
            }
          })} 
        />
        <BottomNavItem 
          icon="menu" 
          label="More" 
          onPress={() => alert('More options coming soon!')} 
        />
      </View>
    </SafeAreaView>
  );
};

// Bottom Navigation Item Component
const BottomNavItem = ({ icon, label, active, onPress }: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  onPress: () => void 
}) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? "#6c5ce7" : "#95a5a6"} />
    <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  date: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  testButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
<<<<<<< HEAD
    padding: 12,
    borderRadius: 10,
=======
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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  requestReadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  requestReadingButton: {
    backgroundColor: '#7B68EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 15,
    shadowColor: '#7B68EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(123, 104, 238, 0.3)',
  },
  requestReadingButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
<<<<<<< HEAD
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
=======
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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
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
    padding: 10,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    aspectRatio: 1,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledCard: {
    opacity: 0.5,
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
    marginTop: 5,
    textAlign: 'center',
  },
  comingSoon: {
    position: 'absolute',
    bottom: 10,
    color: 'white',
    fontSize: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    padding: 5,
  },
  navLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
<<<<<<< HEAD
  activeNavLabel: {
    color: '#6c5ce7',
=======
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
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
});

export default DashboardScreen;