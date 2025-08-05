import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Astrology</Text>
          <View style={{ width: 24 }} />
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
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
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
});

export default AstrologyScreen;