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

interface FriendCompatibilityResultProps {
  navigation: any;
  route: any;
}

interface CompatibilityScore {
  category: string;
  score: number;
  description: string;
  emoji: string;
}

export const FriendCompatibilityResult: React.FC<FriendCompatibilityResultProps> = ({ 
  navigation, 
  route 
}) => {
  const { userReading, friendData } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [compatibilityData, setCompatibilityData] = useState<any>(null);

  useEffect(() => {
    generateCompatibilityResults();
  }, []);

  const generateCompatibilityResults = async () => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock compatibility results based on palm reading data
    const results = {
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 range for fun
      userName: userReading?.userData?.name || 'You',
      friendName: friendData?.name || 'Your Friend',
      scores: [
        {
          category: 'Love & Romance',
          score: Math.floor(Math.random() * 20) + 80,
          description: 'Your romantic energies are totally aligned! 💕',
          emoji: '💕'
        },
        {
          category: 'Communication',
          score: Math.floor(Math.random() * 25) + 75,
          description: 'You two understand each other\'s vibes perfectly! 🗣️',
          emoji: '💬'
        },
        {
          category: 'Life Goals',
          score: Math.floor(Math.random() * 30) + 70,
          description: 'Your paths are destined to intertwine! ✨',
          emoji: '🎯'
        },
        {
          category: 'Energy Match',
          score: Math.floor(Math.random() * 25) + 75,
          description: 'Your auras complement each other beautifully! 🌟',
          emoji: '⚡'
        }
      ],
      insights: [
        'Your life lines suggest you\'ll support each other through major life changes!',
        'Both of your heart lines show deep emotional intelligence - perfect match!',
        'Your fate lines indicate you\'re meant to inspire each other\'s success!',
        'The mounts on your palms suggest incredible creative collaboration!'
      ],
      advice: 'Keep nurturing this beautiful connection! The stars have aligned to bring you two together. Share adventures, support each other\'s dreams, and watch your bond grow even stronger! ✨'
    };

    setCompatibilityData(results);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#F59E0B';
    if (score >= 70) return '#EF4444';
    return '#6B7280';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Cosmic Match! 🌟';
    if (score >= 80) return 'Amazing Vibes! ✨';
    if (score >= 70) return 'Great Connection! 💫';
    return 'Growing Together! 🌱';
  };

  const handleShare = async () => {
    try {
      if (!compatibilityData) return;
      
      const message = `✨ Just checked my compatibility with ${compatibilityData.friendName}! We scored ${compatibilityData.overallScore}% - ${getScoreLabel(compatibilityData.overallScore)} 💕\n\nThe universe has spoken through our palms! 🔮✋\n\n#PalmReading #Compatibility #ZodiaApp #BestieVibes`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleScanAnother = () => {
    navigation.navigate('FriendMode', { userReading });
  };

  if (loading || !compatibilityData) {
    return (
      <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>✨ The universe is calculating your cosmic connection...</Text>
            <Text style={styles.loadingSubtext}>Reading the energy between your palms! 🔮</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F23', '#1A1B23', '#2D1B69']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compatibility Results</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Score */}
          <View style={styles.overallScoreContainer}>
            <Text style={styles.namesText}>
              {compatibilityData.userName} × {compatibilityData.friendName}
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.overallScore}>{compatibilityData.overallScore}%</Text>
              <Text style={styles.scoreLabel}>
                {getScoreLabel(compatibilityData.overallScore)}
              </Text>
            </View>
          </View>

          {/* Category Scores */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>✨ Compatibility Breakdown</Text>
            
            {compatibilityData.scores.map((item: CompatibilityScore, index: number) => (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryDescription}>{item.description}</Text>
                  </View>
                  <View style={styles.categoryScore}>
                    <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
                      {item.score}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[getScoreColor(item.score), getScoreColor(item.score) + '80']}
                    style={[styles.progressFill, { width: `${item.score}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>🔮 Palm Reading Insights</Text>
            
            {compatibilityData.insights.map((insight: string, index: number) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightBullet}>✨</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          {/* Advice */}
          <View style={styles.adviceContainer}>
            <Text style={styles.sectionTitle}>💫 Cosmic Advice</Text>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceText}>{compatibilityData.advice}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Share Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleScanAnother}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
              <Text style={styles.secondaryButtonText}>Scan Another Friend</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  overallScoreContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  namesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
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
  scoreLabel: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
  },
  categoriesContainer: {
    marginTop: 30,
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
    fontSize: 30,
    marginRight: 15,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoryScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsContainer: {
    marginTop: 30,
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
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    flex: 1,
  },
  adviceContainer: {
    marginTop: 30,
  },
  adviceCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  adviceText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 40,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});