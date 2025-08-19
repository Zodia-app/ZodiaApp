import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const CompatibilityIntroScreen = () => {
  const navigation = useNavigation<any>();
  
  // For now, start without reading data - this will be passed from palm reading results
  const readingData = null;

  const handleStartCompatibility = () => {
    navigation.navigate('CreateProfile', { readingData });
  };

  const handleJoinWithCode = () => {
    navigation.navigate('JoinWithCode');
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
            <Text style={styles.emoji}>💕✨</Text>
            <Text style={styles.title}>Palm Reading Compatibility</Text>
            <Text style={styles.subtitle}>
              Find out how compatible you are with your bestie, crush, or partner! 💅
            </Text>
          </View>

          {/* What's New Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ What's This About?</Text>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>🤝</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Compare Your Palms</Text>
                <Text style={styles.featureDescription}>
                  AI analyzes both of your palm readings to find compatibility patterns! 🔮
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Get Your Scores</Text>
                <Text style={styles.featureDescription}>
                  Love, communication, life goals & energy compatibility scores! 💯
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>📱</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Share the Results</Text>
                <Text style={styles.featureDescription}>
                  Create shareable compatibility cards perfect for TikTok & Instagram! 🎥
                </Text>
              </View>
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💅 How It Works</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Create Your Profile</Text>
                  <Text style={styles.stepText}>
                    Quick setup with your palm reading data ✨
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Invite Your Person</Text>
                  <Text style={styles.stepText}>
                    Send them a code to join the compatibility check! 📲
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get Your Results</Text>
                  <Text style={styles.stepText}>
                    AI creates your personalized compatibility analysis! 🤖
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Share the Vibes</Text>
                  <Text style={styles.stepText}>
                    Post your compatibility card and watch the likes roll in! 📈
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Match Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💖 Perfect For</Text>
            <View style={styles.matchTypesGrid}>
              <View style={styles.matchType}>
                <Text style={styles.matchTypeEmoji}>💕</Text>
                <Text style={styles.matchTypeText}>Romantic Partners</Text>
              </View>
              <View style={styles.matchType}>
                <Text style={styles.matchTypeEmoji}>👯‍♀️</Text>
                <Text style={styles.matchTypeText}>Best Friends</Text>
              </View>
              <View style={styles.matchType}>
                <Text style={styles.matchTypeEmoji}>🤷‍♀️</Text>
                <Text style={styles.matchTypeText}>Talking Stages</Text>
              </View>
            </View>
          </View>

        </ScrollView>

        {/* Fixed Bottom CTAs */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartCompatibility}>
            <LinearGradient
              colors={['#F59E0B', '#EAB308', '#FCD34D']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Start Compatibility Check ✨</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinWithCode}>
            <Text style={styles.secondaryButtonText}>Join with Code 🔗</Text>
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
    paddingBottom: 140,
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
  stepNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F59E0B',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
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
  matchTypesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  matchType: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  matchTypeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  matchTypeText: {
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
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
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
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CompatibilityIntroScreen;