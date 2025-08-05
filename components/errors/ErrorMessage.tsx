// src/components/errors/ErrorMessage.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onRetry,
  onDismiss,
  autoHide = false,
}) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (autoHide) {
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 5000);
    }
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.content, { borderLeftColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.button}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  content: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9d4edd',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});