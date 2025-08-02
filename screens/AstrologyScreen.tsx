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
import { Ionicons } from '@expo/vector-icons';
import { calculateZodiacSign } from '../utils/zodiac/calculator';
import { generateDailyHoroscope } from '../services/horoscope/horoscopeService';

const AstrologyScreen = ({ navigation, route }: any) => {
  const { userData } = route.params;
  const [loading, setLoading] = useState(true);
  const [zodiacInfo, setZodiacInfo] = useState<any>(null);
  const [dailyHoroscope, setDailyHoroscope] = useState<any>(null);

  useEffect(() => {
    loadAstrologyData();
  }, []);

  const loadAstrologyData = async () => {
    try {
      setLoading(true);
      
      // Calculate zodiac sign
      const zodiac = calculateZodiacSign(userData.birthDate);
      setZodiacInfo(zodiac);
      
      // Generate daily horoscope
      const horoscope = await generateDailyHoroscope(userData.birthDate);
      setDailyHoroscope(horoscope);
    } catch (error) {
      console.error('Error loading astrology data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9d4edd" />
          <Text style={styles.loadingText}>Reading the stars...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
            {userData.birthDate} • {zodiacInfo?.element} Sign
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

        {/* Daily Horoscope */}
        <View style={styles.horoscopeCard}>
          <Text style={styles.sectionTitle}>Today's Horoscope</Text>
          <Text style={styles.horoscopeDate}>{dailyHoroscope?.date}</Text>
          
          <View style={styles.horoscopeSection}>
            <Ionicons name="sunny" size={20} color="#9d4edd" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Overall Energy</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content.overallEnergy}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="heart" size={20} color="#e74c3c" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Love & Relationships</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content.loveRelationships}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="briefcase" size={20} color="#3498db" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Career & Money</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content.careerMoney}
              </Text>
            </View>
          </View>

          <View style={styles.horoscopeSection}>
            <Ionicons name="fitness" size={20} color="#2ecc71" />
            <View style={styles.horoscopeContent}>
              <Text style={styles.horoscopeLabel}>Health & Wellness</Text>
              <Text style={styles.horoscopeText}>
                {dailyHoroscope?.content.healthWellness}
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
                {dailyHoroscope?.content.luckyColor}
              </Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Number</Text>
              <Text style={styles.luckyValue}>
                {dailyHoroscope?.content.luckyNumber}
              </Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Time</Text>
              <Text style={styles.luckyValue}>
                {dailyHoroscope?.content.bestTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CompatibilityCheck', { userData, zodiacInfo })}
          >
            <Ionicons name="people" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Check Compatibility</Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9d4edd',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  zodiacCard: {
    backgroundColor: '#2d2d44',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  zodiacSymbol: {
    fontSize: 60,
    marginBottom: 10,
  },
  zodiacName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  zodiacDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  zodiacDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#9d4edd',
    fontWeight: 'bold',
  },
  horoscopeCard: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
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
    fontSize: 18,
    color: '#9d4edd',
    fontWeight: 'bold',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#9d4edd',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#9d4edd',
  },
});

export default AstrologyScreen;