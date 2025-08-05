import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const DailyReportDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userData = route.params?.userData || {};
  
  const [expandedSection, setExpandedSection] = useState<string | null>('horoscope');

  // Mock data - replace with actual data from API/props
  const dailyReport = {
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    zodiacSign: userData.zodiacSign || 'Pisces',
    horoscope: {
      overall: "Today's cosmic energy brings exciting opportunities for personal growth. The alignment of Jupiter and Venus in your chart suggests favorable outcomes in both personal and professional spheres.",
      love: "Romance is in the air! Singles may encounter someone special, while those in relationships will find deeper connections. Communication is your key to harmony today.",
      career: "Professional success is within reach. Your creative ideas will be well-received by colleagues and superiors. Don't hesitate to share your innovative solutions.",
      health: "Your energy levels are high today. It's an excellent time to start a new fitness routine or healthy habit. Pay attention to hydration and rest.",
      lucky: {
        number: 7,
        color: 'Purple',
        time: '3:00 PM',
      }
    },
    moonCycle: {
      phase: 'Waxing Crescent',
      illumination: '23%',
      meaning: 'A time for setting intentions and planting seeds for future growth. Focus on new beginnings and fresh starts.',
      rituals: [
        'Write down your intentions for the lunar month',
        'Cleanse your space with sage or incense',
        'Charge your crystals under the moonlight'
      ]
    },
    tarotCard: {
      name: 'The Star',
      meaning: 'Hope, renewal, and spiritual guidance',
      interpretation: "The Star card indicates that you're entering a period of renewed hope and healing. Trust in the universe's plan and maintain your optimism. Your spiritual guides are supporting you.",
      advice: 'Stay true to your authentic self and trust your intuition. Help and healing are on the way.'
    },
    ritual: {
      title: 'Morning Gratitude Ritual',
      description: 'Start your day with positive energy by acknowledging three things you\'re grateful for.',
      steps: [
        'Light a white candle',
        'Take three deep breaths',
        'Write down three gratitudes',
        'Visualize your ideal day',
        'Close with a positive affirmation'
      ]
    },
    affirmation: "I am aligned with the energy of the universe and open to receiving abundance in all forms."
  };

  const handleShare = async () => {
    try {
      const message = `🌟 My Daily Cosmic Report - ${dailyReport.date}\n\n` +
        `Zodiac: ${dailyReport.zodiacSign}\n` +
        `Moon Phase: ${dailyReport.moonCycle.phase}\n` +
        `Today's Card: ${dailyReport.tarotCard.name}\n\n` +
        `${dailyReport.horoscope.overall}\n\n` +
        `Lucky Number: ${dailyReport.horoscope.lucky.number}\n` +
        `Lucky Color: ${dailyReport.horoscope.lucky.color}\n\n` +
        `Get your daily report at Zodia app!`;
      
      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Report</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Date and Zodiac Header */}
          <View style={styles.reportHeader}>
            <Text style={styles.zodiacSign}>☆ {dailyReport.zodiacSign} ☆</Text>
            <Text style={styles.reportDate}>{dailyReport.date}</Text>
          </View>

          {/* Daily Horoscope */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('horoscope')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.sectionTitle}>Daily Horoscope</Text>
              </View>
              <Ionicons 
                name={expandedSection === 'horoscope' ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#fff" 
              />
            </View>
            
            {expandedSection === 'horoscope' && (
              <View style={styles.sectionContent}>
                <Text style={styles.horoscopeText}>{dailyReport.horoscope.overall}</Text>
                
                <View style={styles.horoscopeCategories}>
                  <View style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>❤️</Text>
                    <Text style={styles.categoryTitle}>Love</Text>
                    <Text style={styles.categoryText}>{dailyReport.horoscope.love}</Text>
                  </View>
                  
                  <View style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>💼</Text>
                    <Text style={styles.categoryTitle}>Career</Text>
                    <Text style={styles.categoryText}>{dailyReport.horoscope.career}</Text>
                  </View>
                  
                  <View style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>💪</Text>
                    <Text style={styles.categoryTitle}>Health</Text>
                    <Text style={styles.categoryText}>{dailyReport.horoscope.health}</Text>
                  </View>
                </View>
                
                <View style={styles.luckyRow}>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Lucky Number</Text>
                    <Text style={styles.luckyValue}>{dailyReport.horoscope.lucky.number}</Text>
                  </View>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Lucky Color</Text>
                    <Text style={styles.luckyValue}>{dailyReport.horoscope.lucky.color}</Text>
                  </View>
                  <View style={styles.luckyItem}>
                    <Text style={styles.luckyLabel}>Lucky Time</Text>
                    <Text style={styles.luckyValue}>{dailyReport.horoscope.lucky.time}</Text>
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Moon Cycle */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('moon')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="moon" size={24} color="#B794F4" />
                <Text style={styles.sectionTitle}>Moon Cycle Guidance</Text>
              </View>
              <Ionicons 
                name={expandedSection === 'moon' ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#fff" 
              />
            </View>
            
            {expandedSection === 'moon' && (
              <View style={styles.sectionContent}>
                <View style={styles.moonInfo}>
                  <Text style={styles.moonPhase}>{dailyReport.moonCycle.phase}</Text>
                  <Text style={styles.moonIllumination}>Illumination: {dailyReport.moonCycle.illumination}</Text>
                </View>
                <Text style={styles.moonMeaning}>{dailyReport.moonCycle.meaning}</Text>
                
                <Text style={styles.ritualsTitle}>Recommended Rituals:</Text>
                {dailyReport.moonCycle.rituals.map((ritual, index) => (
                  <View key={index} style={styles.ritualItem}>
                    <Text style={styles.ritualBullet}>•</Text>
                    <Text style={styles.ritualText}>{ritual}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Daily Tarot */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('tarot')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.cardEmoji}>🎴</Text>
                <Text style={styles.sectionTitle}>Daily Tarot Card</Text>
              </View>
              <Ionicons 
                name={expandedSection === 'tarot' ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#fff" 
              />
            </View>
            
            {expandedSection === 'tarot' && (
              <View style={styles.sectionContent}>
                <Text style={styles.tarotName}>{dailyReport.tarotCard.name}</Text>
                <Text style={styles.tarotMeaning}>{dailyReport.tarotCard.meaning}</Text>
                <Text style={styles.tarotInterpretation}>{dailyReport.tarotCard.interpretation}</Text>
                
                <View style={styles.adviceCard}>
                  <Ionicons name="bulb" size={20} color="#FFD700" />
                  <Text style={styles.adviceText}>{dailyReport.tarotCard.advice}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Daily Ritual */}
          <TouchableOpacity 
            style={styles.sectionCard}
            onPress={() => toggleSection('ritual')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={24} color="#4ECDC4" />
                <Text style={styles.sectionTitle}>Daily Ritual</Text>
              </View>
              <Ionicons 
                name={expandedSection === 'ritual' ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#fff" 
              />
            </View>
            
            {expandedSection === 'ritual' && (
              <View style={styles.sectionContent}>
                <Text style={styles.ritualTitle}>{dailyReport.ritual.title}</Text>
                <Text style={styles.ritualDescription}>{dailyReport.ritual.description}</Text>
                
                <Text style={styles.stepsTitle}>Steps:</Text>
                {dailyReport.ritual.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Daily Affirmation */}
          <View style={styles.affirmationCard}>
            <Ionicons name="heart" size={24} color="#FF6B6B" />
            <Text style={styles.affirmationTitle}>Today's Affirmation</Text>
            <Text style={styles.affirmationText}>"{dailyReport.affirmation}"</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  shareButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  reportHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  zodiacSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  reportDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardEmoji: {
    fontSize: 24,
  },
  sectionContent: {
    marginTop: 15,
  },
  horoscopeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  horoscopeCategories: {
    gap: 15,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 15,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  luckyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
  },
  luckyItem: {
    alignItems: 'center',
  },
  luckyLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 5,
  },
  luckyValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  moonInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  moonPhase: {
    fontSize: 20,
    fontWeight: '600',
    color: '#B794F4',
  },
  moonIllumination: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 5,
  },
  moonMeaning: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  ritualsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ritualItem: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  ritualBullet: {
    color: '#B794F4',
    fontSize: 16,
    marginRight: 10,
  },
  ritualText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  tarotName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  tarotMeaning: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  tarotInterpretation: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  adviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  adviceText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  ritualDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  stepsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  affirmationCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  affirmationTitle: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
  },
  affirmationText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DailyReportDetailScreen;