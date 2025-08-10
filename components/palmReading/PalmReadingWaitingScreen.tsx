import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PalmReadingWaitingScreen: React.FC<any> = ({ navigation, route }) => {
  const { readingData } = route.params || {};

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      navigation.navigate('PalmReadingResult', { readingData });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6B46C1" style={styles.loader} />
        <Text style={styles.title}>Analyzing Your Palms</Text>
        <Text style={styles.subtitle}>
          Our mystic readers are studying your palm lines...
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>🔮 Reading life lines</Text>
          <Text style={styles.infoText}>✨ Analyzing heart patterns</Text>
          <Text style={styles.infoText}>🌟 Interpreting fate paths</Text>
        </View>
        
        <Text style={styles.waitText}>
          This usually takes 10-15 seconds
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loader: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#6B46C1',
    marginVertical: 8,
  },
  waitText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});