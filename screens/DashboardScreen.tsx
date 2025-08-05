import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';

const DashboardScreen = () => {
  const navigation = useNavigation();
  useScreenTracking();
  const analytics = useAnalytics();

  const handleFeaturePress = (feature: string, screen: string) => {
    analytics.trackFeatureUsed(feature);
    navigation.navigate(screen as never);
  };

  const handleZodiacCalculator = () => {
    analytics.trackEvent('Zodiac Calculator Clicked');
    // Navigate to calculator or show modal
  };

  const handleRequestReading = () => {
    analytics.trackEvent('Request Reading Clicked');
    navigation.navigate('ReadingRequest' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome, Cosmic Traveler!</Text>
              <Text style={styles.dateText}>Tuesday, August 5, 2025</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon}>
              <Ionicons name="person-circle" size={40} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>

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
            style={styles.requestButton}
            onPress={handleRequestReading}
          >
            <Ionicons name="sparkles" size={24} color="white" />
            <Text style={styles.requestButtonText}>Request a Reading</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Daily Report Card */}
        <TouchableOpacity style={styles.dailyReportCard}>
          <View style={styles.dailyReportHeader}>
            <Text style={styles.dailyReportTitle}>Daily Report</Text>
            <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.dailyReportDate}>Tuesday, August 5, 2025</Text>
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
});

export default DashboardScreen;
