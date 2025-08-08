// src/screens/PalmReadingResultScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Mock palm reading data
const mockPalmReading = {
  summary: "Your palms reveal a creative and intuitive nature with strong leadership qualities.",
  sections: [
    {
      icon: "❤️",
      heading: "Heart Line",
      content: "Your heart line shows deep emotional intelligence and capacity for meaningful connections. You approach relationships with both passion and wisdom, seeking genuine bonds rather than superficial connections. There's an indication of a transformative love experience that will shape your emotional growth."
    },
    {
      icon: "🧠",
      heading: "Head Line",
      content: "A well-defined head line indicates sharp analytical abilities combined with creative thinking. You have the rare ability to balance logic with intuition, making you an excellent problem solver. Your mind seeks knowledge and understanding, always questioning and exploring new concepts."
    },
    {
      icon: "⭐",
      heading: "Life Line",
      content: "Your life line suggests vitality and resilience. You possess the strength to overcome challenges and the flexibility to adapt to change. Major life transitions are ahead, but you're well-equipped to handle them with grace and determination."
    },
    {
      icon: "✨",
      heading: "Fate Line",
      content: "A prominent fate line reveals a strong sense of purpose and destiny. Your career path may involve helping or inspiring others. Success will come through perseverance and staying true to your authentic self. Leadership roles are highly favorable."
    },
    {
      icon: "🏔️",
      heading: "Mounts Analysis",
      content: "The Mount of Venus shows warmth and passion for life. Mount of Jupiter indicates ambition and desire for achievement. Your Mount of Saturn suggests wisdom beyond your years, while the Mount of Apollo reveals artistic talents waiting to be expressed."
    }
  ],
  confidence: 0.85
};

export function PalmReadingResultScreen({ route, navigation }) {
  const { isMockData = false } = route.params || {};
  const [loading, setLoading] = useState(!isMockData);
  const [reading, setReading] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (isMockData) {
      // Use mock data immediately
      setReading(mockPalmReading);
      setLoading(false);
    } else {
      // Simulate loading for real implementation
      setTimeout(() => {
        setReading(mockPalmReading);
        setLoading(false);
      }, 2000);
    }
  }, [isMockData]);

  const shareReading = async () => {
    try {
      const message = `🔮 My Palm Reading from Zodia:\n\n${
        reading?.summary || 'Discover the secrets in your palm!'
      }\n\nGet your reading at Zodia app!`;

      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const saveReading = () => {
    Alert.alert(
      'Reading Saved',
      'Your palm reading has been saved to your profile.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Ionicons name="hand-left" size={60} color="#e94560" />
            <Text style={styles.loadingText}>Analyzing your palm lines...</Text>
            <Text style={styles.loadingSubtext}>
              Reading the story written in your hands
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const sections = reading?.sections || [];

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Palm Reading</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={shareReading} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveReading} style={styles.headerButton}>
              <Ionicons name="bookmark-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Ionicons name="sparkles" size={24} color="#FFD700" />
          <Text style={styles.summaryText}>{reading?.summary}</Text>
        </View>

        {/* Section Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {sections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                activeSection === index && styles.activeTab
              ]}
              onPress={() => setActiveSection(index)}
            >
              <Text style={styles.tabIcon}>{section.icon}</Text>
              <Text style={[
                styles.tabText,
                activeSection === index && styles.activeTabText
              ]}>
                {section.heading}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reading Content */}
        <ScrollView style={styles.contentContainer}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionHeading}>
              {sections[activeSection]?.heading}
            </Text>
            <Text style={styles.sectionText}>
              {sections[activeSection]?.content}
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {activeSection > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setActiveSection(activeSection - 1)}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {activeSection < sections.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonNext]}
                onPress={() => setActiveSection(activeSection + 1)}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Demo Notice if applicable */}
          {isMockData && (
            <View style={styles.demoNotice}>
              <Ionicons name="information-circle" size={20} color="#FFC107" />
              <Text style={styles.demoText}>
                This is a sample reading. In the full version, your actual palm lines would be analyzed.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <LinearGradient
              colors={['#e94560', '#c23652']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    alignItems: 'center',
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  tabContainer: {
    maxHeight: 80,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  tabText: {
    color: '#aaa',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#ddd',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  navButtonNext: {
    marginLeft: 'auto',
  },
  navButtonText: {
    color: '#fff',
    marginHorizontal: 5,
  },
  demoNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  demoText: {
    flex: 1,
    color: '#FFC107',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  bottomActions: {
    padding: 20,
  },
  primaryButton: {
    marginBottom: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});