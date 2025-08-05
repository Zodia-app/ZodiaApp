import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CompatibilityScoreProps {
  score: number;
  user1Name: string;
  user2Name: string;
  user1Sign: string;
  user2Sign: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({
  score,
  user1Name,
  user2Name,
  user1Sign,
  user2Sign,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for high scores
    if (score >= 80) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [score]);

  const getScoreColor = () => {
    if (score >= 80) return ['#4CAF50', '#66BB6A'];
    if (score >= 60) return ['#FFA726', '#FFB74D'];
    return ['#EF5350', '#E57373'];
  };

  const getZodiacIcon = (sign: string) => {
    const zodiacIcons: { [key: string]: string } = {
      'Aries': 'zodiac-aries',
      'Taurus': 'zodiac-taurus',
      'Gemini': 'zodiac-gemini',
      'Cancer': 'zodiac-cancer',
      'Leo': 'zodiac-leo',
      'Virgo': 'zodiac-virgo',
      'Libra': 'zodiac-libra',
      'Scorpio': 'zodiac-scorpio',
      'Sagittarius': 'zodiac-sagittarius',
      'Capricorn': 'zodiac-capricorn',
      'Aquarius': 'zodiac-aquarius',
      'Pisces': 'zodiac-pisces',
    };
    return zodiacIcons[sign] || 'star';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <LinearGradient
          colors={getScoreColor()}
          style={styles.circleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.innerCircle}>
            <Animated.View
              style={[
                styles.scoreContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scorePercent}>%</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Zodiac Signs */}
      <View style={styles.zodiacContainer}>
        <View style={styles.zodiacItem}>
          <MaterialCommunityIcons
            name={getZodiacIcon(user1Sign)}
            size={36}
            color="#fff"
          />
          <Text style={styles.userName}>{user1Name}</Text>
          <Text style={styles.signName}>{user1Sign}</Text>
        </View>

        <MaterialCommunityIcons
          name="heart"
          size={28}
          color="#E91E63"
          style={styles.heart}
        />

        <View style={styles.zodiacItem}>
          <MaterialCommunityIcons
            name={getZodiacIcon(user2Sign)}
            size={36}
            color="#fff"
          />
          <Text style={styles.userName}>{user2Name}</Text>
          <Text style={styles.signName}>{user2Sign}</Text>
        </View>
      </View>

      {/* Compatibility Label */}
      <Text style={styles.compatibilityLabel}>
        {score >= 80 ? 'Cosmic Connection!' :
         score >= 60 ? 'Strong Potential' :
         'Growing Together'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  circleContainer: {
    marginBottom: 30,
  },
  circleGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerCircle: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    borderRadius: 92,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  scorePercent: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    marginLeft: 2,
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth - 40,
  },
  zodiacItem: {
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  signName: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  heart: {
    marginHorizontal: 20,
  },
  compatibilityLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#B794F4',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default CompatibilityScore;