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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your components
import { CompatibilityInput } from '../components/compatibility/CompatibilityInput';
import { AIReadingDisplay } from '../components/AIReadingDisplay';
import { AILoadingIndicator } from '../components/AILoadingIndicator';

// Import services and types
import { generateCompatibilityAnalysis } from '../services/compatibilityService';
import { CompatibilityAnalysis } from '../types/compatibility';
import { useAuth } from '../hooks/useAuth'; // Assuming you have auth context

const { width: screenWidth } = Dimensions.get('window');

export const CompatibilityAnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth(); // Get current user for saving
  
  // State management
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CompatibilityAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;
  
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
  
  // Format analysis for AIReadingDisplay
  const formatAnalysisContent = (): string => {
    if (!analysis) return '';
    
    let content = `# Cosmic Compatibility Report\n\n`;
    content += `## ${analysis.user1.name} & ${analysis.user2.name}\n\n`;
    content += `### Overall Compatibility: ${analysis.overallScore}%\n\n`;
    
    // Add compatibility meter visual
    const stars = Math.round(analysis.overallScore / 20);
    content += '⭐'.repeat(stars) + '☆'.repeat(5 - stars) + '\n\n';
    
    // Add sections
    analysis.sections.forEach(section => {
      content += `## ${section.title}`;
      if (section.score !== undefined) {
        content += ` - ${section.score}%`;
      }
      content += `\n\n${section.content}\n\n`;
    });
    
    // Add strengths
    content += `## 💪 Relationship Strengths\n\n`;
    analysis.strengths.forEach(strength => {
      content += `- ${strength}\n`;
    });
    content += '\n';
    
    // Add challenges
    content += `## 🌊 Potential Challenges\n\n`;
    analysis.challenges.forEach(challenge => {
      content += `- ${challenge}\n`;
    });
    content += '\n';
    
    // Add advice
    content += `## 💫 Cosmic Advice\n\n`;
    analysis.advice.forEach(advice => {
      content += `> ${advice}\n\n`;
    });
    
    return content;
  };
  
  // Handle saving compatibility report
  const handleSave = async () => {
    if (!analysis || !user) {
      Alert.alert('Unable to Save', 'Please log in to save compatibility reports.');
      return;
    }
    
    try {
      // Get existing saved reports
      const savedReportsJson = await AsyncStorage.getItem(`@compatibility_reports_${user.id}`);
      const savedReports = savedReportsJson ? JSON.parse(savedReportsJson) : [];
      
      // Add new report
      const newReport = {
        ...analysis,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };
      
      savedReports.unshift(newReport);
      
      // Keep only last 10 reports
      const reportsToSave = savedReports.slice(0, 10);
      
      await AsyncStorage.setItem(
        `@compatibility_reports_${user.id}`,
        JSON.stringify(reportsToSave)
      );
      
      Alert.alert('Saved!', 'Compatibility report saved to your profile.');
      
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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResults(false);
      setAnalysis(null);
      setError(null);
    });
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
      
      {/* Animated Background */}
      <Animated.View style={[styles.starsBackground, { opacity: starsOpacity }]}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * screenWidth,
                top: Math.random() * 600,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </Animated.View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mystical Header */}
        {!showResults && (
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
        {!showResults ? (
          <>
            {/* Input Section */}
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
              <AIReadingDisplay
                title={`${analysis.user1.name} & ${analysis.user2.name}`}
                subtitle={`${analysis.user1.zodiacSign} + ${analysis.user2.zodiacSign}`}
                content={formatAnalysisContent()}
                type="compatibility"
                primaryColor="#9333EA"
                onShare={handleShare}
                onSave={handleSave}
                onGenerateNew={handleNewAnalysis}
                metadata={{
                  overallScore: analysis.overallScore,
                  user1: analysis.user1,
                  user2: analysis.user2,
                }}
              />
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
  starsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 50,
    opacity: 0.8,
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
    fontFamily: 'Cinzel-Bold',
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
});