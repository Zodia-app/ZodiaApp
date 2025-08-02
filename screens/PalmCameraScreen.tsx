import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PalmCameraScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={80} color="#4169E1" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Palm Reading Camera</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            This feature will allow you to:
          </Text>
          <Text style={styles.feature}>• Take a photo of your palm</Text>
          <Text style={styles.feature}>• Get AI-powered palm analysis</Text>
          <Text style={styles.feature}>• Discover life, love, and career insights</Text>
          <Text style={styles.feature}>• Save readings to your profile</Text>
        </View>

        {/* Placeholder Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#4169E1" />
          <Text style={styles.infoText}>
            Camera functionality will be implemented in Task #27
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 30,
    backgroundColor: '#1A1A1A',
    borderRadius: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#4169E1',
    fontSize: 18,
    marginBottom: 30,
  },
  descriptionContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
  },
  description: {
    color: '#B8B8B8',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  feature: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#4169E1',
  },
  infoText: {
    color: '#B8B8B8',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  backButton: {
    backgroundColor: '#4169E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PalmCameraScreen;