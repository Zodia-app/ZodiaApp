import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
import { LinearGradient } from 'expo-linear-gradient';
import { calculateZodiacSign } from '../utils/zodiac/calculator';
import { generateDailyHoroscope, generateAIHoroscope } from '../services/horoscope/horoscopeService';
import { supabase } from '../lib/supabase';

const AstrologyScreen = ({ navigation, route }: any) => {
  // Safely access route params with optional chaining
  const routeUserData = route?.params?.userData;
  const [userData, setUserData] = useState(routeUserData);
  const [loading, setLoading] = useState(true);
  const [zodiacInfo, setZodiacInfo] = useState<any>(null);
  const [dailyHoroscope, setDailyHoroscope] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    // If no userData from route, fetch from Supabase
    if (!userData) {
      fetchUserData();
    } else {
      loadAstrologyData();
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const fetchedUserData = {
            id: profile.id,
            name: profile.full_name || profile.name || 'User',
            birthDate: profile.birth_date,
            timeOfBirth: profile.time_of_birth,
            placeOfBirth: profile.place_of_birth || profile.birth_city,
            gender: profile.gender,
            zodiacSign: profile.zodiac_sign
          };
          setUserData(fetchedUserData);
          loadAstrologyData(fetchedUserData);
        } else {
          // No profile found
          showProfileAlert();
        }
      } else {
        // No user logged in
        showLoginAlert();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      Alert.alert('Error', 'Unable to load user data. Please try again.');
    }
  };

  const showProfileAlert = () => {
    Alert.alert(
      'Complete Your Profile',
      'Please complete your profile to access astrology readings.',
      [
        { 
          text: 'Go to Profile', 
          onPress: () => navigation.navigate('Profile') 
        }
      ],
      { cancelable: false }
    );
  };

  const showLoginAlert = () => {
    Alert.alert(
      'Login Required',
      'Please login to access astrology readings.',
      [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('Login') 
        }
      ],
      { cancelable: false }
    );
  };

  const loadAstrologyData = async (userDataToUse = userData) => {
    try {
      setLoading(true);
      
      // Ensure we have birthDate
      if (!userDataToUse?.birthDate) {
        throw new Error('Birth date is required for astrology reading');
      }
      
      // Calculate zodiac sign
      const zodiac = calculateZodiacSign(userDataToUse.birthDate);
      setZodiacInfo(zodiac);
      
      // Generate daily horoscope (basic version)
      const horoscope = await generateDailyHoroscope(userDataToUse.birthDate);
      setDailyHoroscope(horoscope);
    } catch (error) {
      console.error('Error loading astrology data:', error);
      Alert.alert('Error', 'Unable to generate astrology reading. Please ensure your birth date is set in your profile.');
    } finally {
      setLoading(false);
    }
  };

  const generateAIReading = async () => {
    try {
      setIsGeneratingAI(true);
      
      // Prepare user context for AI
      const userContext = {
        name: userData.name,
        zodiacSign: zodiacInfo.name,
        birthDate: userData.birthDate,
        timeOfBirth: userData.timeOfBirth,
        placeOfBirth: userData.placeOfBirth,
        gender: userData.gender,
        element: zodiacInfo.element,
        rulingPlanet: zodiacInfo.rulingPlanet,
        modality: zodiacInfo.modality
      };

      // Generate AI horoscope
      const aiHoroscope = await generateAIHoroscope(userContext);
      
      // Update the daily horoscope with AI-generated content
      setDailyHoroscope({
        ...dailyHoroscope,
        content: {
          ...dailyHoroscope.content,
          ...aiHoroscope
        },
        isAIGenerated: true
      });

      Alert.alert('Success', 'Your personalized AI reading has been generated!');
    } catch (error) {
      console.error('Error generating AI reading:', error);
      Alert.alert('Error', 'Unable to generate AI reading. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
=======
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AstrologyScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Safely get userData with fallback
  const userData = route.params?.userData || {};
  
  const [loading, setLoading] = useState(true);
  const [zodiacInfo, setZodiacInfo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(userData);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // If no userData from params, try to load from storage
      if (!userData.zodiacSign) {
        const storedData = await AsyncStorage.getItem('userProfile');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setUserProfile(parsed);
          loadZodiacInfo(parsed.zodiacSign || 'Aries');
        } else {
          // Use default zodiac sign if no user data
          loadZodiacInfo('Aries');
        }
      } else {
        loadZodiacInfo(userData.zodiacSign);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Load with default sign
      loadZodiacInfo('Aries');
    }
  };

  const loadZodiacInfo = (sign: string) => {
    // Mock zodiac information
    const mockZodiacInfo = {
      sign: sign || 'Aries',
      element: getElement(sign),
      ruler: getRuler(sign),
      traits: getTraits(sign),
      compatibility: getCompatibility(sign),
      todaysForecast: {
        overall: 4,
        love: 5,
        career: 3,
        health: 4,
        message: "Today brings opportunities for growth and self-discovery. Your natural leadership qualities will shine through."
      }
    };

    setTimeout(() => {
      setZodiacInfo(mockZodiacInfo);
      setLoading(false);
    }, 1000);
  };

  const getElement = (sign: string) => {
    const elements: any = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
    };
    return elements[sign] || 'Fire';
  };

  const getRuler = (sign: string) => {
    const rulers: any = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury',
      Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
      Libra: 'Venus', Scorpio: 'Pluto', Sagittarius: 'Jupiter',
      Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune'
    };
    return rulers[sign] || 'Mars';
  };

  const getTraits = (sign: string) => {
    return ['Creative', 'Passionate', 'Independent', 'Adventurous', 'Loyal'];
  };

  const getCompatibility = (sign: string) => {
    return ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'];
  };

  const handleRequestReading = () => {
    navigation.navigate('ReadingQueue', {
      readingType: 'astrology',
      userData: userProfile
    });
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C88FF" />
          <Text style={styles.loadingText}>Loading your cosmic profile...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // If no userData after loading, show error state
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#9d4edd" />
          <Text style={styles.errorText}>Unable to load user data</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.errorButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Astrology</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Zodiac Sign Card */}
        <View style={styles.zodiacCard}>
          <Text style={styles.zodiacSymbol}>{zodiacInfo?.symbol}</Text>
          <Text style={styles.zodiacName}>{zodiacInfo?.name}</Text>
          <Text style={styles.zodiacDate}>
            {new Date(userData.birthDate).toLocaleDateString()} • {zodiacInfo?.element} Sign
          </Text>
          
          <View style={styles.zodiacDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Element</Text>
              <Text style={styles.detailValue}>{zodiacInfo?.element}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ruling Planet</Text>
              <Text style={styles.detailValue}>{zodiacInfo?.rulingPlanet}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Modality</Text>
              <Text style={styles.detailValue}>{zodiacInfo?.modality}</Text>
            </View>
          </View>
        </View>

        {/* AI Generation Button */}
        {!dailyHoroscope?.isAIGenerated && (
          <TouchableOpacity
            style={styles.aiButton}
            onPress={generateAIReading}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.aiButtonText}>Generate AI-Powered Reading</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Daily Horoscope */}
        <View style={styles.horoscopeCard}>
          <View style={styles.horoscopeHeader}>
            <Text style={styles.sectionTitle}>Today's Horoscope</Text>
            {dailyHoroscope?.isAIGenerated && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#fff" />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>
          <Text style={styles.horoscopeDate}>{dailyHoroscope?.date}</Text>
          
          <View style={styles.horoscopeSection}>
            <Ionicons name="sunny" size={20} color="#9d4edd" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Overall Energy</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content?.overallEnergy || 'Loading...'}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="heart" size={20} color="#e74c3c" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Love & Relationships</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content?.loveRelationships || 'Loading...'}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="briefcase" size={20} color="#3498db" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Career & Money</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content?.careerMoney || 'Loading...'}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="fitness" size={20} color="#2ecc71" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Health & Wellness</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content?.healthWellness || 'Loading...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lucky Elements */}
        <View style={styles.luckyCard}>
          <Text style={styles.sectionTitle}>Today's Lucky Elements</Text>
          <View style={styles.luckyGrid}>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Color</Text>
              <Text style={styles.luckyValue}>
                {dailyHoroscope?.content?.luckyColor || '-'}
              </Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Number</Text>
              <Text style={styles.luckyValue}>
                {dailyHoroscope?.content?.luckyNumber || '-'}
              </Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Time</Text>
              <Text style={styles.luckyValue}>
                {dailyHoroscope?.content?.bestTime || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AstrologyReading', { userData })}
          >
            <Ionicons name="book" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Get Full Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('CompatibilityAnalysis', { userData, zodiacInfo })}
          >
            <Ionicons name="people" size={24} color="#9d4edd" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Check Compatibility
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('WeeklyHoroscope', { userData, zodiacInfo })}
          >
            <Ionicons name="calendar" size={24} color="#9d4edd" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Weekly Forecast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthlyReportButton}
            onPress={() => navigation.navigate('MonthlyAstrologyReport', { userData })}
          >
            <LinearGradient
              colors={['#7c3aed', '#9d4edd']}
              style={styles.monthlyButtonGradient}
            >
              <Ionicons name="book-outline" size={24} color="#fff" />
              <Text style={styles.monthlyButtonText}>Get Full Monthly Report</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
=======
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Astrology</Text>
          <View style={{ width: 24 }} />
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Zodiac Sign Card */}
          <View style={styles.zodiacCard}>
            <Text style={styles.zodiacSymbol}>♈</Text>
            <Text style={styles.zodiacName}>{zodiacInfo.sign}</Text>
            <View style={styles.zodiacDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Element</Text>
                <Text style={styles.detailValue}>{zodiacInfo.element}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ruler</Text>
                <Text style={styles.detailValue}>{zodiacInfo.ruler}</Text>
              </View>
            </View>
          </View>

          {/* Today's Forecast */}
          <View style={styles.forecastCard}>
            <Text style={styles.sectionTitle}>Today's Forecast</Text>
            <Text style={styles.forecastMessage}>{zodiacInfo.todaysForecast.message}</Text>
            
            <View style={styles.ratingContainer}>
              <RatingItem label="Overall" rating={zodiacInfo.todaysForecast.overall} />
              <RatingItem label="Love" rating={zodiacInfo.todaysForecast.love} />
              <RatingItem label="Career" rating={zodiacInfo.todaysForecast.career} />
              <RatingItem label="Health" rating={zodiacInfo.todaysForecast.health} />
            </View>
          </View>

          {/* Personality Traits */}
          <View style={styles.traitsCard}>
            <Text style={styles.sectionTitle}>Your Key Traits</Text>
            <View style={styles.traitsContainer}>
              {zodiacInfo.traits.map((trait: string, index: number) => (
                <View key={index} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Compatibility */}
          <View style={styles.compatibilityCard}>
            <Text style={styles.sectionTitle}>Best Compatibility</Text>
            <View style={styles.compatibilityList}>
              {zodiacInfo.compatibility.map((sign: string, index: number) => (
                <TouchableOpacity key={index} style={styles.compatibilityItem}>
                  <Text style={styles.compatibilitySign}>{sign}</Text>
                  <Ionicons name="heart" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Request Full Reading Button */}
          <TouchableOpacity style={styles.requestButton} onPress={handleRequestReading}>
            <LinearGradient
              colors={['#9C88FF', '#7C3AED']}
              style={styles.requestButtonGradient}
            >
              <Ionicons name="sparkles" size={24} color="#fff" />
              <Text style={styles.requestButtonText}>Get Full Birth Chart Reading</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const RatingItem = ({ label, rating }: { label: string; rating: number }) => (
  <View style={styles.ratingItem}>
    <Text style={styles.ratingLabel}>{label}</Text>
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={16}
          color={star <= rating ? '#FFD700' : '#666'}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#9d4edd',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  zodiacCard: {
    backgroundColor: 'rgba(156, 136, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(156, 136, 255, 0.3)',
  },
  zodiacSymbol: {
    fontSize: 60,
    marginBottom: 10,
  },
  zodiacName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  zodiacDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: '#9C88FF',
    fontSize: 16,
    fontWeight: '600',
  },
<<<<<<< HEAD
  aiButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  horoscopeCard: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
=======
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  horoscopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sectionTitle: {
<<<<<<< HEAD
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  horoscopeDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  horoscopeSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  horoscopeContent: {
    flex: 1,
    marginLeft: 15,
  },
  horoscopeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  horoscopeText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  luckyCard: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  luckyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  luckyItem: {
    alignItems: 'center',
  },
  luckyLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  luckyValue: {
=======
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  forecastMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingItem: {
    width: '48%',
    marginBottom: 15,
  },
  ratingLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  traitsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  traitBadge: {
    backgroundColor: 'rgba(156, 136, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  traitText: {
    color: '#9C88FF',
    fontSize: 14,
  },
  compatibilityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  compatibilityList: {
    gap: 10,
  },
  compatibilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  compatibilitySign: {
    color: '#fff',
    fontSize: 16,
  },
  requestButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  requestButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  monthlyReportButton: {
    marginTop: 10,
  },
  monthlyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
  },
  monthlyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
});

export default AstrologyScreen;