import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReadingChoiceScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userData = route.params?.userData || {};
  
  const [selectedReading, setSelectedReading] = useState<'astrology' | 'palm' | null>(null);
  const scaleAstrology = new Animated.Value(1);
  const scalePalm = new Animated.Value(1);

  const handlePress = (type: 'astrology' | 'palm') => {
    setSelectedReading(type);
    
    // Animate the selection
    const scale = type === 'astrology' ? scaleAstrology : scalePalm;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after a short delay
    setTimeout(() => {
      if (type === 'astrology') {
        navigation.navigate('ReadingQueue', {
          readingType: 'astrology',
          userData,
        });
      } else {
        navigation.navigate('PalmIntroScreen', { userData });
      }
    }, 300);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.greeting}>
            {userData.name ? `${userData.name},` : 'Welcome,'}
          </Text>
          <Text style={styles.question}>
            Would you prefer an Astrology reading or a Palm reading today?
          </Text>

          <View style={styles.optionsContainer}>
            {/* Astrology Option */}
            <Animated.View style={{ transform: [{ scale: scaleAstrology }] }}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedReading === 'astrology' && styles.selectedCard,
                ]}
                onPress={() => handlePress('astrology')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedReading === 'astrology' ? ['#9C88FF', '#7C3AED'] : ['#2a2a3e', '#1e1e2e']}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="star" size={60} color="#FFC107" />
                  </View>
                  <Text style={styles.optionTitle}>Astrology Reading</Text>
                  <Text style={styles.optionDescription}>
                    Discover your cosmic blueprint through the stars
                  </Text>
                  <View style={styles.features}>
                    <Text style={styles.featureItem}>✓ Birth Chart Analysis</Text>
                    <Text style={styles.featureItem}>✓ Personality Insights</Text>
                    <Text style={styles.featureItem}>✓ Life Path Guidance</Text>
                  </View>
                  <View style={styles.waitTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#FFD700" />
                    <Text style={styles.waitTime}>Wait time: 2-4 hours</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Palm Reading Option */}
            <Animated.View style={{ transform: [{ scale: scalePalm }] }}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  selectedReading === 'palm' && styles.selectedCard,
                ]}
                onPress={() => handlePress('palm')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedReading === 'palm' ? ['#54A0FF', '#0066CC'] : ['#2a2a3e', '#1e1e2e']}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="hand-left" size={60} color="#54A0FF" />
                  </View>
                  <Text style={styles.optionTitle}>Palm Reading</Text>
                  <Text style={styles.optionDescription}>
                    Uncover secrets written in the lines of your hands
                  </Text>
                  <View style={styles.features}>
                    <Text style={styles.featureItem}>✓ Life Line Analysis</Text>
                    <Text style={styles.featureItem}>✓ Heart & Head Lines</Text>
                    <Text style={styles.featureItem}>✓ Mount Interpretations</Text>
                  </View>
                  <View style={styles.waitTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#54A0FF" />
                    <Text style={styles.waitTime}>Wait time: 1-3 hours</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Text style={styles.note}>
            You can always request additional readings later
          </Text>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  cardGradient: {
    padding: 25,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  featureItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginVertical: 3,
    textAlign: 'center',
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  waitTime: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  note: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});

export default ReadingChoiceScreen;