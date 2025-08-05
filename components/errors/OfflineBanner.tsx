// src/components/errors/OfflineBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfflineManager from '../../services/offlineManager';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    // Check initial connection
    setIsOffline(!OfflineManager.getIsOnline());
    setQueueCount(OfflineManager.getQueueLength());

    // Subscribe to network changes
    const unsubscribe = OfflineManager.onNetworkChange((online) => {
      setIsOffline(!online);
      setQueueCount(OfflineManager.getQueueLength());
      
      // Animate banner
      Animated.timing(slideAnim, {
        toValue: online ? -100 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#fff" />
        <Text style={styles.text}>Offline Mode</Text>
        {queueCount > 0 && (
          <Text style={styles.queueText}>({queueCount} pending)</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    zIndex: 9999,
    paddingTop: 50, // Account for status bar
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  queueText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.9,
  },
});