import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useScreenTracking, useAnalytics } from '../hooks/useAnalytics';


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

const handleLearnMore = () => {
  analytics.trackEvent('Palm Intro Learn More Clicked');
  // You can navigate to an educational screen or show a modal
  navigation.navigate('EducationalLibrary', { 
    initialCategory: 'palmistry',
    userData 
  });
};

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="hand-left" size={80} color="#8B5CF6" />
            </View>
            <Text style={styles.title}>Discover Your Destiny</Text>
            <Text style={styles.subtitle}>
              Your palms hold the secrets to your past, present, and future
            </Text>
          </View>

          {/* What You'll Discover Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Discover</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="heart" size={24} color="#e74c3c" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Heart Line</Text>
                <Text style={styles.featureDescription}>
                  Reveals your emotional life, relationships, and capacity for love
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="bulb" size={24} color="#f39c12" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Head Line</Text>
                <Text style={styles.featureDescription}>
                  Shows your intellectual abilities, decision-making style, and wisdom
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="fitness" size={24} color="#27ae60" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Life Line</Text>
                <Text style={styles.featureDescription}>
                  Indicates vitality, life changes, and physical well-being
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="star" size={24} color="#3498db" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Fate Line</Text>
                <Text style={styles.featureDescription}>
                  Reveals career path, success, and life's purpose
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="trending-up" size={24} color="#9b59b6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Success & Achievement</Text>
                <Text style={styles.featureDescription}>
                  Discover your strengths and potential for achievement
                </Text>
              </View>
            </View>
          </View>

          {/* How It Works Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Prepare Your Hands</Text>
                  <Text style={styles.stepText}>
                    Clean hands and good lighting ensure accuracy
                  </Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Capture Photos</Text>
                  <Text style={styles.stepText}>
                    Take clear photos of both palms with fingers spread
                  </Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>AI Analysis</Text>
                  <Text style={styles.stepText}>
                    Our AI analyzes your palm lines and patterns
                  </Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get Results</Text>
                  <Text style={styles.stepText}>
                    Receive your personalized palm reading report
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Requirements Section */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={24} color="#8B5CF6" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Quick Requirements</Text>
              <Text style={styles.tipText}>
                You'll need: Clean hands, good lighting, and just 2 minutes
              </Text>
            </View>
          </View>

          {/* Additional Info Cards */}
          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Ionicons name="time" size={20} color="#8B5CF6" />
              <Text style={styles.infoCardText}>2-3 min</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="camera" size={20} color="#8B5CF6" />
              <Text style={styles.infoCardText}>2 photos</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              <Text style={styles.infoCardText}>Private</Text>
            </View>
          </View>

          {/* Learn More Button */}
          <TouchableOpacity style={styles.learnMoreButton} onPress={handleLearnMore}>
            <Text style={styles.learnMoreText}>Learn More About Palmistry</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartReading}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Palm Reading</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
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
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  stepsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  stepText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepDivider: {
    height: 30,
    width: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    marginLeft: 19,
    marginVertical: 5,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tipContent: {
    flex: 1,
    marginLeft: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
  },
  infoCardText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 20,
  },
  learnMoreText: {
    color: '#8B5CF6',
    fontSize: 16,
    marginRight: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.98)',
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