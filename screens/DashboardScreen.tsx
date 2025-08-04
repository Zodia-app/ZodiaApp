import { DailyReport } from '../components/DailyReport';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { supabase } from '../lib/supabase';

const DashboardScreen = ({ navigation, route }: any) => {
  const { userData: initialUserData } = route.params || {};
  const [userData, setUserData] = useState(initialUserData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Fetch user data from Supabase
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
        name: profile.name,
        zodiacSign: profile.zodiac_sign,
        birthDate: profile.birth_date,
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
    // Add any other dashboard data fetching here
    setIsLoading(false);
  };

  // Pull to refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  // Feature grid data
  const features = [
    {
      id: 'astrology',
      title: 'Astrology',
      subtitle: 'Get Your Reading',
      icon: 'star' as const,
      screen: 'AstrologyIntro',
      color: '#9b59b6',
    },
    {
      id: 'palm',
      title: 'Palm Reading',
      subtitle: 'Scan Your Palm',
      icon: 'hand-left' as const,
      screen: 'PalmIntro',
      color: '#3498db',
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
      screen: 'Compatibility',
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
      switch (feature.id) {
        case 'astrology':
          navigation.navigate('Astrology', { userData });
          break;
        case 'compatibility':
          navigation.navigate('Compatibility');
          break;
        case 'palm':
          navigation.navigate('PalmIntro', { userData });
          break;
        case 'dream':
          navigation.navigate('DreamInterpreter');
          break;
        case 'education':
          navigation.navigate('Education');
          break;
        default:
          alert(`${feature.title} feature coming soon!`);
      }
    }
  };

  // Show loading state
  if (isLoading) {
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
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { userData })}>
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

        {/* Test Button for Zodiac Calculator */}
        <View style={styles.testButtonContainer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => navigation.navigate('ZodiacTest')}
          >
            <Ionicons name="flask" size={20} color="white" />
            <Text style={styles.testButtonText}>Test Zodiac Calculator</Text>
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

        {/* Daily Report Component */}
        <DailyReport
          zodiacSign={userData?.zodiacSign || 'Aries'}
          userData={userData}
          defaultExpanded={true}
        />

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
          onPress={() => navigation.navigate('Profile', { userData })} 
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
    padding: 12,
    borderRadius: 10,
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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
  activeNavLabel: {
    color: '#6c5ce7',
  },
});

export default DashboardScreen;