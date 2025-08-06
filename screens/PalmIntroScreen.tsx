import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';

const PalmIntroScreen = () => {
  const navigation = useNavigation();
  useScreenTracking(); // Automatically track screen view
  const analytics = useAnalytics();

  const handleStartReading = () => {
    analytics.trackPalmReadingStarted();
    analytics.trackEvent('Palm Intro CTA Clicked');
    navigation.navigate('PalmCamera' as never);
  };

  const handleLearnMore = () => {
    analytics.trackEvent('Palm Intro Learn More Clicked');
    // Could navigate to a detailed guide or show a modal
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Palm Reading</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="hand-left" size={80} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Discover Your Destiny</Text>
          <Text style={styles.subtitle}>
            Your palm holds the secrets to your past, present, and future
          </Text>
        </View>

        {/* What You'll Learn Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Discover</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="heart" size={24} color="#8B5CF6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Love & Relationships</Text>
              <Text style={styles.infoText}>
                Understand your emotional nature and relationship patterns
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="trending-up" size={24} color="#8B5CF6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Life Path & Success</Text>
              <Text style={styles.infoText}>
                Discover your strengths and potential for achievement
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="fitness" size={24} color="#8B5CF6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Health & Vitality</Text>
              <Text style={styles.infoText}>
                Learn about your physical constitution and well-being
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="bulb" size={24} color="#8B5CF6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Mind & Wisdom</Text>
              <Text style={styles.infoText}>
                Uncover your intellectual abilities and decision-making style
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Take clear photos of both palms in good lighting
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Our AI analyzes your palm lines and patterns
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Receive your personalized palm reading report
            </Text>
          </View>
        </View>

        {/* Requirements Section */}
        <View style={styles.requirementsCard}>
          <Ionicons name="information-circle" size={20} color="#8B5CF6" />
          <Text style={styles.requirementsText}>
            You'll need: Clean hands, good lighting, and 2 minutes
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartReading}>
          <Text style={styles.primaryButtonText}>Start Palm Reading</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleLearnMore}>
          <Text style={styles.secondaryButtonText}>Learn More About Palmistry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#1E293B',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 15,
  },
  requirementsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  requirementsText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
  },
});

export default PalmIntroScreen;
