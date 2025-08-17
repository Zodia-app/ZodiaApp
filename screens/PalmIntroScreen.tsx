import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useScreenTracking, useAnalytics } from '../hooks';


const PalmIntroScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userData } = route.params || {};
  useScreenTracking(); // Automatically track screen view
  const analytics = useAnalytics();

  const handleStartReading = () => {
    analytics.trackPalmReadingStarted();
    analytics.trackEvent('Palm Intro CTA Clicked');
    navigation.navigate('PalmReadingForm', { userData });
  };



  return (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Discover Your Destiny</Text>
            <Text style={styles.subtitle}>
              Your palms hold the secrets ✨ Get your personalized AI reading now!
            </Text>
          </View>

          {/* What You'll Discover Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Discover</Text>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>💖</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Heart Line</Text>
                <Text style={styles.featureDescription}>
                  Your love life, relationships & emotional connections ✨
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🧠</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Head Line</Text>
                <Text style={styles.featureDescription}>
                  Intelligence, creativity & decision-making style 🎯
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Life Line</Text>
                <Text style={styles.featureDescription}>
                  Energy, vitality & major life changes 🌟
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🎯</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fate Line</Text>
                <Text style={styles.featureDescription}>
                  Career success & life's purpose 🚀
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>💍</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Marriage Line</Text>
                <Text style={styles.featureDescription}>
                  Partnerships, romance & commitment 💕
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🏆</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Success Line</Text>
                <Text style={styles.featureDescription}>
                  Fame, recognition & achievements 👑
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>✈️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Travel Line</Text>
                <Text style={styles.featureDescription}>
                  Adventures, journeys & exploration 🌍
                </Text>
              </View>
            </View>
          </View>

          {/* How It Works Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Super Quick & Easy</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <Text style={styles.stepEmoji}>📱</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>1. Enter Your Name</Text>
                  <Text style={styles.stepText}>
                    Just your name & date of birth for personalization ✨
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepEmoji}>📸</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>2. Snap Both Palms</Text>
                  <Text style={styles.stepText}>
                    Quick photos with our guided camera overlay 🎯
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepEmoji}>🤖</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>3. AI Magic Happens</Text>
                  <Text style={styles.stepText}>
                    Advanced AI analyzes your unique palm patterns 🔮
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepEmoji}>🎉</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>4. Get Your Reading</Text>
                  <Text style={styles.stepText}>
                    Detailed insights about your personality & future! 🌟
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureItemEmoji}>⚡</Text>
              <Text style={styles.featureItemText}>2 min reading</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureItemEmoji}>🔒</Text>
              <Text style={styles.featureItemText}>100% Private</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureItemEmoji}>🎯</Text>
              <Text style={styles.featureItemText}>AI Powered</Text>
            </View>
          </View>

        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartReading}>
            <LinearGradient
              colors={['#F59E0B', '#EAB308', '#FCD34D']}
              style={styles.buttonGradient}
            >
              <Text style={styles.startButtonText}>Start My Reading ✨</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontWeight: '500',
  },
  stepsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureItemEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureItemText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.95)',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default PalmIntroScreen;