import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { compatibilityService } from '../../services/compatibilityService';

interface SocialCompatibilityResultProps {
  navigation: any;
  route: any;
}

interface CompatibilityData {
  partnerName: string;
  partnerCode: string;
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    description: string;
    emoji: string;
  }>;
  insights: string[];
  cosmicMessage: string;
}

export const SocialCompatibilityResult: React.FC<SocialCompatibilityResultProps> = ({ 
  navigation, 
  route 
}) => {
  const { userReading, partnerCode } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);

  useEffect(() => {
    generateCompatibilityFromCode();
  }, []);

  const generateCompatibilityFromCode = async () => {
    try {
      // Use the new AI-powered compatibility service
      console.log('Generating compatibility using AI service...');
      
      const result = await compatibilityService.generateCompatibility(
        userReading,
        partnerCode,
        'social'
      );
      
      if (result.success && result.data) {
        // AI analysis successful!
        console.log('AI compatibility analysis generated successfully');
        const analysisData = result.data;
        
        const data: CompatibilityData = {
          partnerName: analysisData.partnerName,
          partnerCode,
          overallScore: analysisData.overallScore,
          categories: analysisData.categories,
          insights: analysisData.insights,
          cosmicMessage: analysisData.cosmicMessage
        };
        
        setCompatibilityData(data);
        setLoading(false);
        return;
      } else {
        console.error('AI analysis failed:', result.error);
        throw new Error(result.error || 'AI analysis failed');
      }
      
    } catch (error) {
      console.error('Error generating compatibility:', error);
      
      // During testing: no fallback - show actual errors
      setLoading(false);
      Alert.alert(
        'Compatibility Analysis Failed', 
        `Failed to generate compatibility analysis: ${error.message || 'Unknown error'}`,
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
      return;
    }
};

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#F59E0B'; 
    if (score >= 70) return '#EF4444';
    return '#6B7280';
  };

  const getOverallLabel = (score: number) => {
    if (score >= 90) return 'Cosmic Soulmates! 🌟';
    if (score >= 80) return 'Amazing Connection! ✨';
    if (score >= 70) return 'Beautiful Harmony! 💫';
    return 'Growing Bond! 🌱';
  };

  const handleShare = async () => {
    if (!compatibilityData) return;
    
    try {
      const message = `✨ Just checked my compatibility with ${compatibilityData.partnerName} using Social Mode! We scored ${compatibilityData.overallScore}% - ${getOverallLabel(compatibilityData.overallScore)}\n\nThe universe has spoken through our palms! 🔮✋\n\n#PalmReading #SocialMode #ZodiaApp #CosmicCompatibility`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleGenerateMyCode = () => {
    navigation.navigate('SocialMode', { userReading });
  };

  if (loading || !compatibilityData) {
    return (
      <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>✨ Decoding your cosmic connection...</Text>
            <Text style={styles.loadingSubtext}>Reading the energy between your palms! 🔮</Text>
            <Text style={styles.codeText}>Code: {partnerCode}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F23', '#1A1B23', '#2D1B69']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Social Compatibility</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <View style={styles.resultHeader}>
            <Text style={styles.codeUsed}>Code: {compatibilityData.partnerCode}</Text>
            <Text style={styles.partnerConnection}>
              Your connection with {compatibilityData.partnerName}
            </Text>
          </View>

          {/* Overall Score */}
          <View style={styles.overallScoreSection}>
            <View style={styles.scoreCircle}>
              <Text style={styles.overallScore}>{compatibilityData.overallScore}%</Text>
              <Text style={styles.overallLabel}>
                {getOverallLabel(compatibilityData.overallScore)}
              </Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>✨ Compatibility Breakdown</Text>
            
            {compatibilityData.categories.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                  <View style={[styles.categoryScore, { backgroundColor: getScoreColor(category.score) }]}>
                    <Text style={styles.categoryScoreText}>{category.score}%</Text>
                  </View>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${category.score}%`,
                        backgroundColor: getScoreColor(category.score)
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Cosmic Insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>🔮 Palm Reading Insights</Text>
            
            {compatibilityData.insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightBullet}>✨</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* Cosmic Message */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>💫 Cosmic Message</Text>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>{compatibilityData.cosmicMessage}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.shareResultButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.shareResultButtonText}>Share Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.generateCodeButton} onPress={handleGenerateMyCode}>
              <Ionicons name="qr-code" size={20} color="#8B5CF6" />
              <Text style={styles.generateCodeButtonText}>Generate My Code</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  shareButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 10,
  },
  codeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 15,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeUsed: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
    letterSpacing: 1,
  },
  partnerConnection: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  overallScoreSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 3,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallScore: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  overallLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
  categoriesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryEmoji: {
    fontSize: 25,
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  categoryScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  categoryScoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightBullet: {
    fontSize: 14,
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    flex: 1,
  },
  messageSection: {
    marginBottom: 40,
  },
  messageCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    textAlign: 'center',
  },
  actionsSection: {
    gap: 15,
  },
  shareResultButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 10,
  },
  shareResultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateCodeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 10,
  },
  generateCodeButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});