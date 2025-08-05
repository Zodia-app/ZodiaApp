// src/screens/PalmReadingResultScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PalmReadingService, PalmReadingResult } from '../services/palmReadingService';
import { supabase } from '../lib/supabase';

export function PalmReadingResultScreen({ route, navigation }) {
  const { imageUri, handedness, readingType = 'detailed' } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<PalmReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    // Generate the reading once we have the user
    if (user !== null) {
      generateReading();
    }
  }, [user]);

  const generateReading = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await PalmReadingService.generateReading({
        userId: user?.id || 'anonymous',
        userName: user?.user_metadata?.name || 'Seeker',
        imageUri,
        handedness,
        dateOfBirth: user?.user_metadata?.date_of_birth,
        gender: user?.user_metadata?.gender,
        relationshipStatus: user?.user_metadata?.relationship_status,
        readingType,
      });

      setReading(result);
      
      // Commented out analytics - uncomment when you have AnalyticsService
      // AnalyticsService.track('Palm Reading Completed', {
      //   readingId: result.id,
      //   confidence: result.confidence,
      //   processingTime: result.processingTime,
      // });

    } catch (err) {
      console.error('Failed to generate reading:', err);
      setError('Unable to generate your palm reading. Please try again.');
      
      // AnalyticsService.track('Palm Reading Failed', {
      //   error: err.message,
      // });
    } finally {
      setLoading(false);
    }
  };

  const shareReading = async () => {
    try {
      const message = `🔮 My Palm Reading from Zodia:\n\n${
        reading?.formattedContent?.summary || 'Discover the secrets in your palm!'
      }\n\nGet your reading at Zodia app!`;

      await Share.share({ message });
      
      // Commented out analytics - uncomment when you have AnalyticsService
      // AnalyticsService.track('Palm Reading Shared', {
//   readingId: reading?.id,
// });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const saveReading = async () => {
    Alert.alert(
      'Reading Saved',
      'Your palm reading has been saved to your profile.',
      [{ text: 'OK' }]
    );
    
    // Commented out analytics - uncomment when you have AnalyticsService
    // AnalyticsService.track('Palm Reading Saved', {
    //   readingId: reading?.id,
    // });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.processingImage}
            />
            <ActivityIndicator size="large" color="#e94560" style={styles.loader} />
            <Text style={styles.loadingText}>Analyzing your palm...</Text>
            <Text style={styles.loadingSubtext}>
              Reading the lines of destiny written in your hand
            </Text>
            <View style={styles.loadingSteps}>
              <LoadingStep label="Capturing palm essence" completed />
              <LoadingStep label="Analyzing major lines" completed={!loading} />
              <LoadingStep label="Reading the mounts" completed={false} />
              <LoadingStep label="Interpreting patterns" completed={false} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e94560" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateReading}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const sections = reading?.formattedContent?.sections || [];

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Palm Reading</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={shareReading} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveReading} style={styles.headerButton}>
              <Ionicons name="bookmark-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Palm Image Preview */}
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.palmPreview} />
          <View style={styles.imageOverlay}>
            <Text style={styles.handednessLabel}>
              {handedness === 'right' ? 'Right Hand' : 'Left Hand'}
            </Text>
            <Text style={styles.confidenceLabel}>
              Confidence: {Math.round((reading?.confidence || 0) * 100)}%
            </Text>
          </View>
        </View>

        {/* Section Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
        >
          {sections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                activeSection === index && styles.activeTab
              ]}
              onPress={() => setActiveSection(index)}
            >
              <Text style={styles.tabIcon}>{section.icon}</Text>
              <Text style={[
                styles.tabText,
                activeSection === index && styles.activeTabText
              ]}>
                {section.heading}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reading Content */}
        <ScrollView style={styles.contentContainer}>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionHeading}>
              {sections[activeSection]?.heading}
            </Text>
            <Text style={styles.sectionText}>
              {sections[activeSection]?.content}
            </Text>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {activeSection > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setActiveSection(activeSection - 1)}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            {activeSection < sections.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonNext]}
                onPress={() => setActiveSection(activeSection + 1)}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <LinearGradient
              colors={['#e94560', '#c23652']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PalmCamera', { 
              handedness: handedness === 'right' ? 'left' : 'right' 
            })}
          >
            <Text style={styles.secondaryButtonText}>
              Read {handedness === 'right' ? 'Left' : 'Right'} Hand
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function LoadingStep({ label, completed }: { label: string; completed: boolean }) {
  return (
    <View style={styles.loadingStep}>
      <View style={[styles.stepIndicator, completed && styles.stepCompleted]}>
        {completed && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={[styles.stepLabel, completed && styles.stepLabelCompleted]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  processingImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
    opacity: 0.7,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingSteps: {
    width: 250,
  },
  loadingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  stepIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  stepLabel: {
    color: '#666',
    fontSize: 14,
  },
  stepLabelCompleted: {
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  palmPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#e94560',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  handednessLabel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  confidenceLabel: {
    color: '#aaa',
    fontSize: 10,
    textAlign: 'center',
  },
  tabContainer: {
    maxHeight: 80,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  tabText: {
    color: '#aaa',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#ddd',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  navButtonNext: {
    marginLeft: 'auto',
  },
  navButtonText: {
    color: '#fff',
    marginHorizontal: 5,
  },
  bottomActions: {
    padding: 20,
  },
  primaryButton: {
    marginBottom: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  secondaryButtonText: {
    color: '#e94560',
    fontSize: 16,
  },
});