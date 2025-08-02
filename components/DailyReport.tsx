import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  getDailyHoroscope,
  getDailyMoonGuidance,
  getDailyRitual,
  getDailyCard
} from '../services/horoscope/horoscopeService';

interface DailyReportProps {
  zodiacSign: string;
  userData?: any;
  defaultExpanded?: boolean;
}

export const DailyReport: React.FC<DailyReportProps> = ({
  zodiacSign,
  userData,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState({
    horoscope: '',
    moonGuidance: '',
    ritual: '',
    card: { name: '', meaning: '' },
  });

  useEffect(() => {
    loadDailyContent();
  }, [zodiacSign]);

  const loadDailyContent = async () => {
    try {
      const [horoscope, moonGuidance, ritual, card] = await Promise.all([
        getDailyHoroscope(zodiacSign, userData),
        getDailyMoonGuidance(),
        getDailyRitual(zodiacSign),
        getDailyCard()
      ]);
      
      setContent({ horoscope, moonGuidance, ritual, card });
    } catch (error) {
      console.error('Error loading daily content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDailyContent();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Daily Report</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</Text>
        </View>
        <Text style={styles.arrow}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6B46C1"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B46C1" />
              <Text style={styles.loadingText}>Consulting the cosmos...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Daily Horoscope */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>⭐</Text>
                  <Text style={styles.sectionTitle}>Daily Personalized Horoscope</Text>
                </View>
                <Text style={styles.sectionContent}>{content.horoscope}</Text>
              </View>
              
              {/* Moon Cycle */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>🌙</Text>
                  <Text style={styles.sectionTitle}>Moon Cycle Guidance</Text>
                </View>
                <Text style={styles.sectionContent}>{content.moonGuidance}</Text>
              </View>
              
              {/* Ritual */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>🕯️</Text>
                  <Text style={styles.sectionTitle}>Daily Ritual</Text>
                </View>
                <Text style={styles.sectionContent}>{content.ritual}</Text>
              </View>
              
              {/* Card Pull */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>🎴</Text>
                  <Text style={styles.sectionTitle}>Daily Tarot Card</Text>
                </View>
                <Text style={styles.cardName}>{content.card.name}</Text>
                <Text style={styles.sectionContent}>{content.card.meaning}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  arrow: {
    fontSize: 16,
    color: '#6B46C1',
    marginLeft: 10,
  },
  contentContainer: {
    maxHeight: 500,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 8,
  },
});