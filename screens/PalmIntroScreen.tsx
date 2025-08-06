import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
<<<<<<< HEAD
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
=======
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PalmIntroScreen = () => {
  const navigation = useNavigation<any>();

  const handleStartReading = () => {
    navigation.navigate('PalmCamera');
  };

  const handleBack = () => {
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    navigation.goBack();
  };

  return (
<<<<<<< HEAD
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
=======
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Palm Reading</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.introCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="hand-left" size={80} color="#54A0FF" />
            </View>
            
            <Text style={styles.title}>Discover Your Destiny</Text>
            <Text style={styles.subtitle}>
              Your palms hold the roadmap to your life's journey
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>What We'll Analyze</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.emoji}>❤️</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Heart Line</Text>
                <Text style={styles.featureDescription}>
                  Reveals your emotional life, relationships, and capacity for love
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.emoji}>🧠</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Head Line</Text>
                <Text style={styles.featureDescription}>
                  Shows your intellectual abilities, decision-making style, and wisdom
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.emoji}>⭐</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Life Line</Text>
                <Text style={styles.featureDescription}>
                  Indicates vitality, life changes, and physical well-being
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.emoji}>✨</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fate Line</Text>
                <Text style={styles.featureDescription}>
                  Reveals career path, success, and life's purpose
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Position your left palm in good lighting
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Capture a clear photo with fingers spread
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Repeat for your right palm
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Receive your personalized palm reading
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <Text style={styles.tipText}>
              <Text style={styles.tipTitle}>Pro Tip: </Text>
              Clean hands and good lighting ensure the most accurate reading!
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartReading}>
            <LinearGradient
              colors={['#54A0FF', '#0066CC']}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Palm Reading</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#0F172A',
=======
  },
  safeArea: {
    flex: 1,
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
<<<<<<< HEAD
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
=======
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
<<<<<<< HEAD
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    padding: 30,
=======
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  introCard: {
    alignItems: 'center',
    marginVertical: 20,
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  iconContainer: {
    width: 120,
    height: 120,
<<<<<<< HEAD
    backgroundColor: '#1E293B',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
=======
    borderRadius: 60,
    backgroundColor: 'rgba(84, 160, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
<<<<<<< HEAD
    color: '#E2E8F0',
=======
    color: '#fff',
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
<<<<<<< HEAD
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
=======
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoSection: {
    marginTop: 30,
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
<<<<<<< HEAD
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
=======
    color: '#fff',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  instructionsSection: {
    marginTop: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
  },
  stepNumber: {
    width: 30,
    height: 30,
<<<<<<< HEAD
    backgroundColor: '#8B5CF6',
    borderRadius: 15,
=======
    borderRadius: 15,
    backgroundColor: '#54A0FF',
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
<<<<<<< HEAD
    color: 'white',
=======
    color: '#fff',
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
<<<<<<< HEAD
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
=======
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    marginLeft: 10,
    lineHeight: 18,
  },
  tipTitle: {
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PalmIntroScreen;
>>>>>>> b00858738ffd6822fe1a7f83d28783415ccdda17
