import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ImagePreviewProps {
  visible: boolean;
  imageUri: string;
  onConfirm: () => void;
  onRetake: () => void;
  isPalmValid?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  imageUri,
  onConfirm,
  onRetake,
  isPalmValid = true
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#0a0a0a']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Review Your Palm Photo</Text>
            {!isPalmValid && (
              <View style={styles.warning}>
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>
                  Please ensure your palm is clearly visible
                </Text>
              </View>
            )}
          </View>

          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {/* Guide overlay */}
            <View style={styles.guideOverlay}>
              <View style={styles.palmGuide}>
                <Text style={styles.guideText}>Palm should fill this area</Text>
              </View>
            </View>
          </View>

          <ScrollView style={styles.instructionsContainer}>
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>Quality Checklist:</Text>
              
              <View style={styles.checkItem}>
                <Ionicons 
                  name={isPalmValid ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={isPalmValid ? "#10b981" : "#ef4444"} 
                />
                <Text style={styles.checkText}>Good lighting - no dark shadows</Text>
              </View>
              
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.checkText}>Palm is flat and fully open</Text>
              </View>
              
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.checkText}>All major lines are visible</Text>
              </View>
              
              <View style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text style={styles.checkText}>Image is sharp and in focus</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
              <Ionicons name="camera-reverse" size={24} color="#fff" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.confirmButton, !isPalmValid && styles.disabledButton]} 
              onPress={onConfirm}
              disabled={!isPalmValid}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.buttonText}>Use This Photo</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    color: '#f59e0b',
    marginLeft: 8,
    fontSize: 14,
  },
  imageContainer: {
    height: 400,
    margin: 20,
    position: 'relative',
  },
  image: {
    flex: 1,
    borderRadius: 12,
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  palmGuide: {
    width: 200,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.5)',
    borderRadius: 100,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  instructionsContainer: {
    flex: 1,
    maxHeight: 150,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  instructionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  checkText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#9333ea',
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});