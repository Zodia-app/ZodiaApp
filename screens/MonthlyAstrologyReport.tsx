// screens/MonthlyAstrologyReport.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { generateMonthlyAstrologyReport, MonthlyReport, UserProfile } from '../services/horoscope/monthlyAstrologyService';
import { supabase } from '../lib/supabase';

const MonthlyAstrologyReport = ({ navigation, route }: any) => {
  const { userData } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      // Prepare user profile with all collected data
      const userProfile: UserProfile = {
        id: userData.id,
        firstName: userData.name?.split(' ')[0] || userData.firstName,
        fullName: userData.name || userData.fullName,
        birthDate: userData.birthDate,
        birthTime: userData.timeOfBirth,
        birthPlace: userData.placeOfBirth || userData.birthCity,
        gender: userData.gender,
        relationshipStatus: userData.relationshipStatus,
        currentGoals: userData.goals || [],
        currentStruggles: userData.struggles || [],
        zodiacSign: userData.zodiacSign
      };

      const monthlyReport = await generateMonthlyAstrologyReport(userProfile);
      setReport(monthlyReport);

      // Save report to database
      if (supabase && userData.id) {
        await supabase
          .from('astrology_reports')
          .insert({
            user_id: userData.id,
            report_type: 'monthly',
            month: monthlyReport.month,
            year: monthlyReport.year,
            content: JSON.stringify(monthlyReport),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Unable to generate your monthly report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const shareReport = async () => {
    if (!report) return;
    
    try {
      const message = `My ${report.month} ${report.year} Astrology Report by Zodia\n\n${report.overview}\n\nMonthly Affirmation: ${report.monthlyAffirmation}`;
      
      await Share.share({
        message,
        title: `${report.month} Astrology Report`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#0f0f1e']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#9d4edd" />
          <Text style={styles.loadingText}>Zodia is preparing your monthly cosmic guidance...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load report</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateReport}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#0f0f1e']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{report.month} {report.year}</Text>
          <TouchableOpacity onPress={shareReport}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title Card */}
          <LinearGradient
            colors={['#9d4edd', '#7c3aed']}
            style={styles.titleCard}
          >
            <Ionicons name="sparkles" size={40} color="#fff" />
            <Text style={styles.monthTitle}>Your {report.month} Cosmic Forecast</Text>
            <Text style={styles.subtitle}>Personalized insights by Zodia</Text>
          </LinearGradient>

          {/* Overview Section - Always Expanded */}
          <View style={styles.section}>
            <Text style={styles.overviewText}>{report.overview}</Text>
          </View>

          {/* Collapsible Sections */}
          <CollapsibleSection
            title="Love & Relationships"
            icon="heart"
            iconColor="#e74c3c"
            expanded={expandedSections.has('love')}
            onToggle={() => toggleSection('love')}
          >
            <View style={styles.sectionContent}>
              {report.love.single && (
                <>
                  <Text style={styles.subheading}>For Singles:</Text>
                  <Text style={styles.contentText}>{report.love.single}</Text>
                </>
              )}
              {report.love.relationship && (
                <>
                  <Text style={styles.subheading}>In Relationships:</Text>
                  <Text style={styles.contentText}>{report.love.relationship}</Text>
                </>
              )}
              <Text style={styles.subheading}>Love Advice:</Text>
              <Text style={styles.contentText}>{report.love.advice}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Career & Purpose"
            icon="briefcase"
            iconColor="#3498db"
            expanded={expandedSections.has('career')}
            onToggle={() => toggleSection('career')}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.subheading}>Opportunities:</Text>
              <Text style={styles.contentText}>{report.career.opportunities}</Text>
              <Text style={styles.subheading}>Challenges:</Text>
              <Text style={styles.contentText}>{report.career.challenges}</Text>
              <Text style={styles.subheading}>Advice:</Text>
              <Text style={styles.contentText}>{report.career.advice}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Health & Wellness"
            icon="fitness"
            iconColor="#2ecc71"
            expanded={expandedSections.has('health')}
            onToggle={() => toggleSection('health')}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.subheading}>Physical Health:</Text>
              <Text style={styles.contentText}>{report.health.physical}</Text>
              <Text style={styles.subheading}>Mental Wellbeing:</Text>
              <Text style={styles.contentText}>{report.health.mental}</Text>
              <Text style={styles.subheading}>Recommendations:</Text>
              <Text style={styles.contentText}>{report.health.recommendations}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Finance & Abundance"
            icon="cash"
            iconColor="#f39c12"
            expanded={expandedSections.has('finance')}
            onToggle={() => toggleSection('finance')}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.contentText}>{report.finance.overview}</Text>
              <Text style={styles.subheading}>Opportunities:</Text>
              <Text style={styles.contentText}>{report.finance.opportunities}</Text>
              <Text style={styles.subheading}>Cautions:</Text>
              <Text style={styles.contentText}>{report.finance.warnings}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title="Spiritual Growth"
            icon="star"
            iconColor="#9b59b6"
            expanded={expandedSections.has('spirituality')}
            onToggle={() => toggleSection('spirituality')}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.contentText}>{report.spirituality.growth}</Text>
              <Text style={styles.subheading}>Recommended Practices:</Text>
              <Text style={styles.contentText}>{report.spirituality.practices}</Text>
            </View>
          </CollapsibleSection>

          {/* Key Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="calendar" size={20} color="#9d4edd" /> Key Dates
            </Text>
            {report.keyDates.map((item, index) => (
              <View key={index} style={styles.keyDateItem}>
                <Text style={styles.keyDate}>{item.date}</Text>
                <Text style={styles.keyDateText}>{item.significance}</Text>
              </View>
            ))}
          </View>

          {/* Monthly Affirmation */}
          <LinearGradient
            colors={['#7c3aed', '#9d4edd']}
            style={styles.affirmationCard}
          >
            <Text style={styles.affirmationTitle}>Your Monthly Affirmation</Text>
            <Text style={styles.affirmationText}>"{report.monthlyAffirmation}"</Text>
          </LinearGradient>

          {/* Lucky Elements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="sparkles" size={20} color="#9d4edd" /> Lucky Elements
            </Text>
            <View style={styles.luckyGrid}>
              <LuckyElement title="Colors" items={report.luckyElements.colors} />
              <LuckyElement title="Numbers" items={report.luckyElements.numbers} />
              <LuckyElement title="Days" items={report.luckyElements.days} />
              <LuckyElement title="Crystals" items={report.luckyElements.crystals} />
            </View>
          </View>

          {/* Personal Message */}
          <View style={styles.personalMessageCard}>
            <Text style={styles.personalMessageText}>{report.personalMessage}</Text>
            <Text style={styles.signature}>With cosmic love,</Text>
            <Text style={styles.zodiaSignature}>Zodia ✨</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => Alert.alert('Saved', 'Report saved to your profile!')}
            >
              <Ionicons name="bookmark" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.newReportButton}
              onPress={() => navigation.navigate('AstrologyReading', { userData })}
            >
              <Ionicons name="refresh" size={20} color="#9d4edd" />
              <Text style={styles.newReportButtonText}>Daily Reading</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, iconColor, expanded, onToggle, children }: any) => (
  <TouchableOpacity style={styles.section} onPress={onToggle} activeOpacity={0.8}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Ionicons 
        name={expanded ? "chevron-up" : "chevron-down"} 
        size={20} 
        color="#888" 
      />
    </View>
    {expanded && children}
  </TouchableOpacity>
);

// Lucky Element Component
const LuckyElement = ({ title, items }: { title: string; items: any[] }) => (
  <View style={styles.luckyElement}>
    <Text style={styles.luckyTitle}>{title}</Text>
    {items.map((item, index) => (
      <Text key={index} style={styles.luckyItem}>{item}</Text>
    ))}
  </View>
);

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
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#9d4edd',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  titleCard: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  sectionContent: {
    marginTop: 15,
  },
  overviewText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9d4edd',
    marginTop: 15,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 10,
  },
  keyDateItem: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'flex-start',
  },
  keyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9d4edd',
    width: 100,
  },
  keyDateText: {
    fontSize: 15,
    color: '#ccc',
    flex: 1,
    marginLeft: 10,
  },
  affirmationCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  affirmationTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  luckyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  luckyElement: {
    width: '48%',
    marginBottom: 15,
  },
  luckyTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  luckyItem: {
    fontSize: 16,
    color: '#9d4edd',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  personalMessageCard: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  personalMessageText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    marginBottom: 15,
  },
  signature: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
  zodiaSignature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9d4edd',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 10,
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
  newReportButton: {
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
  newReportButtonText: {
    color: '#9d4edd',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MonthlyAstrologyReport;