import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const loadingMessages = [
  "Consulting the stars...",
  "Aligning celestial bodies...",
  "Reading cosmic energies...",
  "Channeling universal wisdom...",
  "Interpreting astral patterns..."
];

export const AILoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        <Text style={styles.star}>✨</Text>
        <Text style={styles.star}>🌟</Text>
        <Text style={styles.star}>⭐</Text>
      </View>
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {loadingMessages[messageIndex]}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  message: {
    fontSize: 16,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
});