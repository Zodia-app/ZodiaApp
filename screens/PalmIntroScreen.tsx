import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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
    navigation.goBack();
  };

  return (
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
  introCard: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(84, 160, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  infoSection: {
    marginTop: 30,
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
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#54A0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
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