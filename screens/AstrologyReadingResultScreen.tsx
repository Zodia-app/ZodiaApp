// screens/AstrologyReadingResultScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { astrologyService } from '../services/astrology/astrologyService';

const AstrologyReadingResultScreen = ({ navigation, route }: any) => {
  const { readingId, reading: initialReading, chartData } = route.params || {};
  const [reading, setReading] = useState(initialReading || '');
  const [isLoading, setIsLoading] = useState(!initialReading);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (!initialReading && readingId) {
      loadReading();
    } else if (initialReading) {
      parseReadingSections(initialReading);
    }
  }, [readingId, initialReading]);

  const loadReading = async () => {
    try {
      setIsLoading(true);
      const data = await astrologyService.getReading(readingId);
      if (data) {
        setReading(data.reading);
        parseReadingSections(data.reading);
      }
    } catch (error) {
      console.error('Error loading reading:', error);
      Alert.alert('Error', 'Failed to load your reading');
    } finally {
      setIsLoading(false);
    }
  };

  const parseReadingSections = (text: string) => {
    // Parse the reading into sections based on common patterns
    const sectionPatterns = [
      { title: 'Personal Overview', icon: 'person', color: '#9d4edd' },
      { title: 'Sun, Moon & Rising', icon: 'sunny', color: '#f39c12' },
      { title: 'Planetary Influences', icon: 'planet', color: '#3498db' },
      { title: 'Love & Relationships', icon: 'heart', color: '#e74c3c' },
      { title: 'Career & Purpose', icon: 'briefcase', color: '#27ae60' },
      { title: 'Personal Growth', icon: 'trending-up', color: '#8e44ad' },
      { title: 'Lucky Periods', icon: 'star', color: '#f1c40f' },
      { title: 'Cosmic Wisdom', icon: 'sparkles', color: '#e67e22' },
    ];

    // Split reading into paragraphs and group into sections
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    const parsedSections: any[] = [];
    let currentSection = { ...sectionPatterns[0], content: [] };
    let sectionIndex = 0;

    paragraphs.forEach((paragraph) => {
      // Check if paragraph might be a new section header
      const isHeader = paragraph.length < 100 && 
                      (paragraph.includes(':') || 
                       paragraph.match(/^[A-Z][^.!?]*$/));

      if (isHeader && sectionIndex < sectionPatterns.length - 1) {
        if (currentSection.content.length > 0) {
          parsedSections.push(currentSection);
          sectionIndex++;
          currentSection = { 
            ...sectionPatterns[Math.min(sectionIndex, sectionPatterns.length - 1)], 
            content: [] 
          };
        }
      }
      
      currentSection.content.push(paragraph);
    });

    if (currentSection.content.length > 0) {
      parsedSections.push(currentSection);
    }

    setSections(parsedSections);
  };

  const shareReading = async () => {
    try {
      const firstName = reading.split(' ')[0] || 'there';
      const message = `My personalized astrology reading from Zodia:\n\n"Dear ${firstName}, ${reading.substring(0, 300)}..."\n\nGet your cosmic insights with Zodia! 🌟`;
      
      await Share.share({
        message,
        title: 'My Zodia Astrology Reading'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderChartInfo = () => {
    if (!chartData || !chartData.planets) return null;

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Your Birth Chart</Text>
        <View style={styles.chartGrid}>
          {Object.entries(chartData.planets).map(([planet, data]: [string, any]) => (
            <View key={planet} style={styles.chartItem}>
              <Text style={styles.planetName}>{planet}</Text>
              <Text style={styles.planetSign}>{data.sign}</Text>
              <Text style={styles.planetDegree}>{data.degree}°</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#0f0f1e']}
          style={styles.loadingContainer}
        >
          <Ionicons name="sparkles" size={60} color="#9d4edd" />
          <Text style={styles.loadingText}>
            Loading your cosmic insights...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#0f0f1e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cosmic Reading</Text>
          <TouchableOpacity onPress={shareReading}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['#9d4edd', '#7c3aed']}
            style={styles.heroCard}
          >
            <Ionicons name="sparkles" size={50} color="#fff" />
            <Text style={styles.heroTitle}>Your Personal Astrology Reading</Text>
            <Text style={styles.heroSubtitle}>Written by Zodia, your cosmic guide</Text>
          </LinearGradient>

          {/* Chart Info */}
          {renderChartInfo()}

          {/* Reading Sections */}
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons 
                  name={section.icon as any} 
                  size={24} 
                  color={section.color} 
                />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionContent}>
                {section.content.map((paragraph: string, pIndex: number) => (
                  <Text key={pIndex} style={styles.paragraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => Alert.alert('Saved', 'Your reading has been saved!')}
            >
              <Ionicons name="bookmark" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save Reading</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.newReadingButton}
              onPress={() => navigation.navigate('AstrologyDetailedForm')}
            >
              <Ionicons name="refresh" size={20} color="#9d4edd" />
              <Text style={styles.newReadingButtonText}>New Reading</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for trusting Zodia with your cosmic journey 💫
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9d4edd',
    fontSize: 18,
    marginTop: 20,
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
  scrollContent: {
    paddingBottom: 30,
  },
  heroCard: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  chartCard: {
    backgroundColor: '#2d2d44',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartItem: {
    width: '30%',
    backgroundColor: '#1a1a2e',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  planetName: {
    fontSize: 12,
    color: '#888',
    textTransform: 'capitalize',
  },
  planetSign: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9d4edd',
    marginTop: 2,
  },
  planetDegree: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  sectionContent: {
    marginTop: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
  },
  newReadingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  newReadingButtonText: {
    color: '#9d4edd',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AstrologyReadingResultScreen;