// src/screens/CompatibilityAnalysisScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Share,
  Alert,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components - let's add these back one by one
import { CompatibilityInput } from '../components/compatibility/CompatibilityInput';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { supabase } from '../lib/supabase';
import { generateCompatibilityAnalysis } from '../services/compatibilityService';
import { CompatibilityAnalysis } from '../types/compatibility';

const { width: screenWidth } = Dimensions.get('window');

const CompatibilityAnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as any;
  
  // State management
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Handle navigation params - automatically start analysis when coming from input screen
  useEffect(() => {
    if (routeParams?.readingId && routeParams?.partnerName) {
      const startAnalysisFromParams = async () => {
        try {
          setIsAnalyzing(true);
          
          // Get user data from Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Get user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          // Get the reading data to get partner details
          const { data: reading } = await supabase
            .from('readings')
            .select('*')
            .eq('id', routeParams.readingId)
            .single();

          if (!reading) {
            throw new Error('Reading not found');
          }

          // Create user objects for analysis
          const user1 = {
            name: userProfile?.name || 'You',
            birthDate: userProfile?.birth_date ? new Date(userProfile.birth_date) : new Date(),
          };

          const user2 = {
            name: reading.input_data?.partner_name || routeParams.partnerName,
            birthDate: reading.input_data?.partner_birth_date ? 
              new Date(reading.input_data.partner_birth_date) : new Date(),
          };

          // Start the analysis
          await handleAnalyze(user1, user2);
        } catch (error) {
          console.error('Error starting analysis from params:', error);
          setError('Unable to start analysis. Please try again.');
          setIsAnalyzing(false);
        }
      };

      startAnalysisFromParams();
    }
  }, [routeParams]);
  
  // Floating stars background animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(starsOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(starsOpacity, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Handle compatibility analysis
  const handleAnalyze = async (user1: any, user2: any) => {
    setIsAnalyzing(true);
    setError(null);
    setShowResults(false);
    
    try {
      // Generate the analysis
      const result = await generateCompatibilityAnalysis(user1, user2);
      setAnalysis(result);
      
      // Animate to results
      setTimeout(() => {
        setShowResults(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
      
    } catch (err) {
      console.error('Compatibility analysis error:', err);
      setError('Unable to analyze compatibility. Please try again.');
      Alert.alert(
        'Analysis Failed',
        'We couldn\'t complete the compatibility analysis. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle saving compatibility report
  const handleSave = async () => {
    if (!analysis) {
      Alert.alert('No Analysis', 'Please complete a compatibility analysis first.');
      return;
    }

    try {
      // Get current user from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to save compatibility reports.',
        );
        return;
      }

      // Save to AsyncStorage for now
      const localKey = `@compatibility_offline_${user.id}`;
      const offlineReports = await AsyncStorage.getItem(localKey);
      const reports = offlineReports ? JSON.parse(offlineReports) : [];
      reports.unshift({
        ...analysis,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(localKey, JSON.stringify(reports.slice(0, 5)));
      
      Alert.alert(
        'Saved!', 
        'Compatibility report saved to your profile.',
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Save Failed', 'Unable to save the report. Please try again.');
    }
  };
  
  // Handle sharing
  const handleShare = async () => {
    if (!analysis) return;
    
    try {
      const message = `🔮 Zodiac Compatibility Report\n\n` +
        `${analysis.user1.name} (${analysis.user1.zodiacSign}) & ` +
        `${analysis.user2.name} (${analysis.user2.zodiacSign})\n\n` +
        `Overall Compatibility: ${analysis.overallScore}%\n\n` +
        `Top Strength: ${analysis.strengths[0]}\n\n` +
        `Download Zodia to see your full compatibility analysis!`;
      
      await Share.share({
        message,
        title: 'Zodiac Compatibility Report',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };
  
  // Handle new analysis
  const handleNewAnalysis = () => {
    setShowResults(false);
    setAnalysis(null);
    setError(null);
  };

  // Loading messages for the loading indicator
  const loadingMessages = [
    "Aligning celestial bodies...",
    "Reading cosmic signatures...",
    "Analyzing star patterns...",
    "Consulting the zodiac wheel...",
    "Measuring cosmic harmony...",
    "Calculating soul resonance...",
    "Interpreting planetary aspects...",
    "Revealing destined connections..."
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mystical Header */}
        {!showResults && !routeParams?.readingId && (
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.1)', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <MaterialCommunityIcons name="creation" size={48} color="#9333EA" />
              <Text style={styles.headerTitle}>Cosmic Compatibility</Text>
              <Text style={styles.headerSubtitle}>
                Unveil the mysteries of your celestial connection
              </Text>
            </View>
          </LinearGradient>
        )}
        
        {/* Main Content */}
        {!showResults && !routeParams?.readingId ? (
          <>
            {/* Input Section - NOW ENABLED */}
            <CompatibilityInput
              onAnalyze={handleAnalyze}
              isLoading={isAnalyzing}
            />
            
            {/* Error Display */}
            {error && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={24} color="#E91E63" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </>
        ) : !showResults && routeParams?.readingId ? (
          /* Loading state when we have params but no results yet */
          <View style={styles.loadingContainer}>
            <AILoadingIndicator
              messages={loadingMessages}
              duration={8000}
              primaryColor="#9333EA"
            />
          </View>
        ) : (
          /* Results Display */
          <Animated.View
            style={[
              styles.resultsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {analysis && (
              <View style={styles.resultsContent}>
                {/* Main Score Display */}
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreTitle}>Compatibility Score</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreText}>{analysis.overallScore}%</Text>
                  </View>
                  <Text style={styles.namesText}>
                    {analysis.user1.name} ({analysis.user1.zodiacSign})
                  </Text>
                  <Text style={styles.andText}>&</Text>
                  <Text style={styles.namesText}>
                    {analysis.user2.name} ({analysis.user2.zodiacSign})
                  </Text>
                </View>

                {/* Sections */}
                <View style={styles.sectionsContainer}>
                  {analysis.sections.map((section, index) => (
                    <View key={index} style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.score !== undefined && (
                          <View style={styles.sectionScoreBox}>
                            <Text style={styles.sectionScore}>{section.score}%</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                  ))}

                  {/* Strengths */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>💪 Relationship Strengths</Text>
                    {analysis.strengths.map((strength, index) => (
                      <Text key={index} style={styles.listItem}>• {strength}</Text>
                    ))}
                  </View>

                  {/* Challenges */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>🌊 Potential Challenges</Text>
                    {analysis.challenges.map((challenge, index) => (
                      <Text key={index} style={styles.listItem}>• {challenge}</Text>
                    ))}
                  </View>

                  {/* Advice */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>💫 Cosmic Advice</Text>
                    {analysis.advice.map((advice, index) => (
                      <View key={index} style={styles.adviceBox}>
                        <Text style={styles.adviceText}>{advice}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={handleShare}
                  >
                    <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleSave}
                  >
                    <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={handleNewAnalysis}
                  >
                    <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>New</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        )}
        
        {/* Loading Overlay */}
        {isAnalyzing && (
          <View style={styles.loadingOverlay}>
            <AILoadingIndicator
              messages={loadingMessages}
              duration={8000}
              primaryColor="#9333EA"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
  },
  scoreTitle: {
    fontSize: 20,
    color: '#999',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderWidth: 3,
    borderColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  namesText: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
  },
  andText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 5,
  },
  sectionsContainer: {
    marginBottom: 20,
  },
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  sectionScoreBox: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sectionScore: {
    fontSize: 16,
    color: '#9333EA',
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
    marginTop: 8,
  },
  adviceBox: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#9333EA',
    padding: 12,
    marginTop: 10,
  },
  adviceText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  errorText: {
    color: '#E91E63',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
});

export default CompatibilityAnalysisScreen;