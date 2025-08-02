import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';

interface FullScreenLoaderProps {
  visible: boolean;
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  visible,
  message
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <LoadingSpinner message={message} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    minWidth: 200,
  },
});