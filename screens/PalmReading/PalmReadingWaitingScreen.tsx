import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PalmReadingWaitingScreen: React.FC<any> = ({ navigation, route }) => {
  const { readingData } = route.params || {};

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      navigation.navigate('PalmReadingResult', { readingData });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.title}>Processing Your Palm Reading</Text>
        <Text style={styles.subtitle}>
          Our mystic readers are analyzing your palm lines...
        </Text>
        <Text style={styles.waitTime}>
          Estimated wait time: 2-3 minutes
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  waitTime: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});