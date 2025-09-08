import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzeWithAI } from '../../services/palmReading/aiPalmAnalysisService';
import { ShareableCardsView } from '../../components/palmReading/ShareableCardsView';

interface PalmReadingAnalysis {
  greeting?: string;
  overallPersonality: string;
  lines: {
    [key: string]: {
      name: string;
      description: string;
      meaning: string;
      personalizedInsight: string;
    }
  };
  mounts: {
    [key: string]: {
      name: string;
      prominence: string;
      meaning: string;
    }
  };
  specialMarkings: string[];
  handComparison?: string;
  futureInsights: string;
  personalizedAdvice: string;
  luckyElements?: {
    colors: string[];
    numbers: number[];
    days: string[];
  };
}

// Client-side greeting enhancement to add uniqueness while cache clears
const enhanceGreeting = (originalGreeting: string, name?: string, zodiacSign?: string) => {
  // If it's the old cached template, replace with unique alternatives
  if (originalGreeting.includes('MAIN CHARACTER ENERGY')) {
    const uniqueGreetings = [
      `${name}, bestie! 💅 Your palm reading just hit different and it's absolutely iconic! ✨`,
      `${name}, gorgeous! 💅 Your reading is serving pure magic and I'm here for it! ✨`,
      `${name}, queen/king! 💅 Your palm reading is giving legendary vibes and it's everything! ✨`,
      `${name}, stunning! 💅 This reading is about to change your whole perspective! ✨`,
      `${name}, beautiful soul! 💅 Your palm reading is pure fire and totally you! ✨`
    ];
    
    // Use name length + zodiac to pick consistent but varied greeting
    const nameLength = name?.length || 0;
    const zodiacLength = zodiacSign?.length || 0;
    const index = (nameLength + zodiacLength) % uniqueGreetings.length;
    return uniqueGreetings[index];
  }
  
  // Return original if it's already unique
  return originalGreeting;
};

export const PalmReadingResult: React.FC<any> = ({ navigation, route }) => {
  const { readingResult, readingData } = route.params || {};
  const { userData, palmData, nextAction, compatibilityCode } = readingData || {};
  const [analysis, setAnalysis] = useState<PalmReadingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareableCards, setShowShareableCards] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  useEffect(() => {
    // Handle post-reading navigation for deep links
    if (nextAction === 'compatibility' && compatibilityCode && analysis) {
      // Auto-navigate to compatibility with the code after reading is complete
      setTimeout(() => {
        navigation.navigate('SocialMode', {
          userReading: { userData, palmData, readingResult: analysis },
          prefilledCode: compatibilityCode,
          autoEnterMode: true
        });
      }, 2000); // Give user 2 seconds to see their results first
    }
  }, [analysis, nextAction, compatibilityCode]);

const loadAnalysis = async () => {
  try {
    // Check if we already have a result from the service
    if (readingResult?.reading || readingResult?.reading_content) {
      console.log('=== USING EXISTING READING RESULT ===');
      let readingContent = readingResult.reading || readingResult.reading_content;
      console.log('Reading content type:', typeof readingContent);
      console.log('Reading content keys:', Object.keys(readingContent || {}));
      console.log('Full reading content:', JSON.stringify(readingContent, null, 2));
      
      // Fix data structure if needed - move misplaced fields from mounts to root
      if (readingContent?.mounts) {
        const { mounts } = readingContent;
        
        // Move misplaced fields from mounts to root level
        if (mounts.futureInsights && !readingContent.futureInsights) {
          readingContent.futureInsights = mounts.futureInsights;
          delete mounts.futureInsights;
        }
        if (mounts.personalizedAdvice && !readingContent.personalizedAdvice) {
          readingContent.personalizedAdvice = mounts.personalizedAdvice;
          delete mounts.personalizedAdvice;
        }
        if (mounts.handComparison && !readingContent.handComparison) {
          readingContent.handComparison = mounts.handComparison;
          delete mounts.handComparison;
        }
        if (mounts.specialMarkings && !readingContent.specialMarkings) {
          readingContent.specialMarkings = mounts.specialMarkings;
          delete mounts.specialMarkings;
        }
        if (mounts.luckyElements && !readingContent.luckyElements) {
          readingContent.luckyElements = mounts.luckyElements;
          delete mounts.luckyElements;
        }
        
        console.log('=== FIXED READING CONTENT ===');
        console.log('Fixed content keys:', Object.keys(readingContent || {}));
      }
      
      setAnalysis(readingContent);
      setLoading(false);
      return;
    }
    
    // Fallback: generate new analysis if no result provided
    console.log('=== GENERATING NEW ANALYSIS ===');
    console.log('readingData:', readingData);
    console.log('userData:', userData);
    console.log('palmData:', palmData);
    
    // Check if palm images exist before calling AI
    if (!palmData?.leftPalmImage || !palmData?.rightPalmImage) {
      throw new Error('Palm images are missing. Please retake the photos.');
    }
    
    const result = await analyzeWithAI(userData, palmData);
    console.log('=== RECEIVED ANALYSIS RESULT ===');
    console.log('result type:', typeof result);
    console.log('result keys:', Object.keys(result || {}));
    console.log('Full result:', JSON.stringify(result, null, 2));
    setAnalysis(result);
  } catch (error) {
    console.error('Error analyzing palm:', error);
    Alert.alert('Analysis Failed', `${(error as Error).message}\n\nPlease try taking the photos again.`);
  } finally {
    setLoading(false);
  }
};

  if (loading || !analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Analyzing your palm lines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Detailed Palm Analysis</Text>
        
        {/* Display AI-generated greeting with client-side uniqueness enhancement */}
        {analysis.greeting ? (
          <View style={styles.greetingCard}>
            <Text style={styles.greetingText}>{enhanceGreeting(analysis.greeting, userData?.name, userData?.zodiacSign)}</Text>
          </View>
        ) : (
          <Text style={styles.greeting}>Hello {userData?.name},</Text>
        )}
        
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>{analysis.overallPersonality}</Text>
        </View>

        <Text style={styles.sectionTitle}>📏 Complete Lines Analysis (7 Lines)</Text>
        
        {analysis.lines && Object.values(analysis.lines).map((line, index) => line && (
          <View key={index} style={styles.lineCard}>
            <Text style={styles.lineName}>{line.name}</Text>
            <Text style={styles.lineDescription}>{line.description}</Text>
            <Text style={styles.lineMeaning}>{line.meaning}</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightLabel}>Personal Insight:</Text>
              <Text style={styles.insightText}>{line.personalizedInsight}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>🏔️ Complete Mounts Analysis (7 Mounts)</Text>
        
        {analysis.mounts && Object.entries(analysis.mounts)
          .filter(([key, mount]) => {
            // Filter out non-mount objects and ensure it's a proper mount
            return mount && 
                   typeof mount === 'object' && 
                   mount.name && 
                   mount.prominence && 
                   mount.meaning && 
                   key.trim() !== "" &&
                   !Array.isArray(mount) &&
                   typeof mount.name === 'string' &&
                   typeof mount.prominence === 'string' &&
                   typeof mount.meaning === 'string';
          })
          .map(([key, mount], index) => (
            <View key={key || index} style={styles.mountCard}>
              <Text style={styles.mountName}>{mount.name}</Text>
              <View style={styles.prominenceContainer}>
                <Text style={styles.prominenceLabel}>Prominence:</Text>
                <Text style={styles.prominenceValue}>{mount.prominence}</Text>
              </View>
              <Text style={styles.mountMeaning}>{mount.meaning}</Text>
            </View>
          ))}

        <Text style={styles.sectionTitle}>✨ Special Markings</Text>
        
        <View style={styles.markingsCard}>
          {analysis.specialMarkings && analysis.specialMarkings
            .filter(marking => marking && marking.trim() !== '') // Filter out empty markings
            .map((marking, index) => (
              <Text key={index} style={styles.marking}>• {marking}</Text>
            ))}
        </View>

        <Text style={styles.sectionTitle}>🔮 Future Insights</Text>
        
        <View style={styles.futureCard}>
          <Text style={styles.futureText}>{analysis.futureInsights}</Text>
        </View>

        <Text style={styles.sectionTitle}>💡 Personalized Advice</Text>
        
        <View style={styles.adviceCard}>
          <Text style={styles.adviceText}>{analysis.personalizedAdvice}</Text>
        </View>

        {/* Hand Comparison Section */}
        {analysis.handComparison && (
          <>
            <Text style={styles.sectionTitle}>🤲 Hand Comparison</Text>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonText}>{analysis.handComparison}</Text>
            </View>
          </>
        )}

        {/* Lucky Elements Section */}
        {analysis.luckyElements && (
          <>
            <Text style={styles.sectionTitle}>🍀 Your Lucky Elements</Text>
            <View style={styles.luckyCard}>
              {analysis.luckyElements.colors && analysis.luckyElements.colors.length > 0 && (
                <View style={styles.luckySection}>
                  <Text style={styles.luckyLabel}>Lucky Colors:</Text>
                  <Text style={styles.luckyText}>{analysis.luckyElements.colors.join(', ')}</Text>
                </View>
              )}
              {analysis.luckyElements.numbers && analysis.luckyElements.numbers.length > 0 && (
                <View style={styles.luckySection}>
                  <Text style={styles.luckyLabel}>Lucky Numbers:</Text>
                  <Text style={styles.luckyText}>{analysis.luckyElements.numbers.join(', ')}</Text>
                </View>
              )}
              {analysis.luckyElements.days && analysis.luckyElements.days.length > 0 && (
                <View style={styles.luckySection}>
                  <Text style={styles.luckyLabel}>Lucky Days:</Text>
                  <Text style={styles.luckyText}>{analysis.luckyElements.days.join(', ')}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Share Cards Button */}
        <TouchableOpacity
          style={styles.shareCardsButton}
          onPress={() => setShowShareableCards(true)}
        >
          <Text style={styles.shareCardsButtonText}>✨ Create Shareable Cards 📸</Text>
          <Text style={styles.shareCardsSubText}>Turn your reading into Instagram-worthy cards!</Text>
        </TouchableOpacity>

        {/* Compatibility Options */}
        <View style={styles.compatibilitySection}>
          <Text style={styles.compatibilityTitle}>✨ Ready for Something Even Cooler?</Text>
          <Text style={styles.compatibilityDescription}>
            Check your compatibility with friends, partners, or crushes using your palm reading!
          </Text>
          
          <View style={styles.compatibilityButtons}>
            <TouchableOpacity
              style={styles.friendModeButton}
              onPress={() => navigation.navigate('FriendModeScreen', { 
                userReading: { userData, palmData, readingResult: analysis } 
              })}
            >
              <Text style={styles.friendModeButtonText}>👫 Friend</Text>
              <Text style={styles.friendModeSubText}>In-person</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datingModeButton}
              onPress={() => navigation.navigate('DatingMode', { 
                userReading: { userData, palmData, readingResult: analysis } 
              })}
            >
              <Text style={styles.datingModeButtonText}>💕 Dating</Text>
              <Text style={styles.datingModeSubText}>Find love</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialModeButton}
              onPress={() => navigation.navigate('SocialMode', { 
                userReading: { userData, palmData, readingResult: analysis } 
              })}
            >
              <Text style={styles.socialModeButtonText}>🔗 Social</Text>
              <Text style={styles.socialModeSubText}>Share code</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>

      {/* Shareable Cards Modal */}
      <Modal
        visible={showShareableCards}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {analysis && (
          <ShareableCardsView
            analysis={analysis}
            userName={userData?.name || 'Mystic Soul'}
            onClose={() => setShowShareableCards(false)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  greetingCard: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  greetingText: {
    fontSize: 16,
    color: '#0369a1',
    lineHeight: 24,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#6B46C1',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  overviewText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 16,
  },
  lineCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 8,
  },
  lineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  lineMeaning: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 22,
  },
  insightBox: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  mountCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6B46C1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  mountName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 8,
  },
  prominenceContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prominenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginRight: 8,
    flex: 0,
  },
  prominenceValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  mountMeaning: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '400',
  },
  markingsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  marking: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  futureCard: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  futureText: {
    fontSize: 16,
    color: '#0369a1',
    lineHeight: 24,
  },
  adviceCard: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  adviceText: {
    fontSize: 16,
    color: '#92400e',
    lineHeight: 24,
  },
  comparisonCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  comparisonText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  luckyCard: {
    backgroundColor: '#fefce8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#facc15',
  },
  luckySection: {
    marginBottom: 12,
  },
  luckyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a16207',
    marginBottom: 4,
  },
  luckyText: {
    fontSize: 16,
    color: '#713f12',
    lineHeight: 22,
  },
  compatibilitySection: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
  },
  compatibilityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  compatibilityDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  compatibilityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  friendModeButton: {
    backgroundColor: '#10B981',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  friendModeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  friendModeSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  datingModeButton: {
    backgroundColor: '#EC4899',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  datingModeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  datingModeSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  socialModeButton: {
    backgroundColor: '#F59E0B',
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  socialModeButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  socialModeSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  shareCardsButton: {
    backgroundColor: '#8B5CF6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareCardsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  shareCardsSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
});