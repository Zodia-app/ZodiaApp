import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;

interface DatingDashboardProps {
  navigation: any;
  route: any;
}

interface Match {
  id: string;
  name: string;
  age: number;
  avatar: string;
  compatibilityScore: number;
  palmInsights: string[];
  distance: string;
  lastActive: string;
}

export const DatingDashboard: React.FC<DatingDashboardProps> = ({ navigation, route }) => {
  const { userProfile } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'recent'>('all');

  useEffect(() => {
    generateMatches();
  }, []);

  const generateMatches = async () => {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock matches based on user's palm reading
    const mockMatches: Match[] = [
      {
        id: '1',
        name: 'Luna',
        age: 24,
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        compatibilityScore: 94,
        palmInsights: ['Strong heart line compatibility', 'Aligned life goals', 'Creative energy match'],
        distance: '2.3 km away',
        lastActive: '2 hours ago'
      },
      {
        id: '2',
        name: 'Alex',
        age: 27,
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        compatibilityScore: 89,
        palmInsights: ['Intellectual connection', 'Travel line alignment', 'Communication harmony'],
        distance: '1.8 km away',
        lastActive: '1 day ago'
      },
      {
        id: '3',
        name: 'Maya',
        age: 23,
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        compatibilityScore: 87,
        palmInsights: ['Emotional depth match', 'Success line synergy', 'Spiritual alignment'],
        distance: '3.1 km away',
        lastActive: '3 hours ago'
      },
      {
        id: '4',
        name: 'Jordan',
        age: 26,
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        compatibilityScore: 82,
        palmInsights: ['Adventure compatibility', 'Balanced energy', 'Growth potential'],
        distance: '5.2 km away',
        lastActive: '6 hours ago'
      },
      {
        id: '5',
        name: 'Zara',
        age: 25,
        avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
        compatibilityScore: 79,
        palmInsights: ['Creative synergy', 'Independent spirits', 'Mutual inspiration'],
        distance: '1.2 km away',
        lastActive: '12 hours ago'
      }
    ];

    setMatches(mockMatches);
    setLoading(false);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#F59E0B';
    if (score >= 70) return '#EF4444';
    return '#6B7280';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 90) return 'Cosmic Match';
    if (score >= 85) return 'Amazing Vibes';
    if (score >= 80) return 'Great Connection';
    return 'Good Potential';
  };

  const filteredMatches = matches.filter(match => {
    switch (selectedFilter) {
      case 'high':
        return match.compatibilityScore >= 85;
      case 'recent':
        return match.lastActive.includes('hours');
      default:
        return true;
    }
  });

  const handleMatchPress = (match: Match) => {
    navigation.navigate('MatchProfile', { match, userProfile });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#EC4899', '#F97316', '#EAB308']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>✨ Finding your cosmic matches...</Text>
            <Text style={styles.loadingSubtext}>The universe is aligning perfect connections! 💫</Text>
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
          <Text style={styles.headerTitle}>Your Matches</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Match Count & Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.matchCount}>{filteredMatches.length} cosmic matches found! ✨</Text>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.activeFilter]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'high' && styles.activeFilter]}
              onPress={() => setSelectedFilter('high')}
            >
              <Text style={[styles.filterText, selectedFilter === 'high' && styles.activeFilterText]}>
                Top Matches
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'recent' && styles.activeFilter]}
              onPress={() => setSelectedFilter('recent')}
            >
              <Text style={[styles.filterText, selectedFilter === 'recent' && styles.activeFilterText]}>
                Recently Active
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Matches List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => handleMatchPress(match)}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.cardGradient}
              >
                {/* Avatar and Basic Info */}
                <View style={styles.matchHeader}>
                  <Image source={{ uri: match.avatar }} style={styles.avatar} />
                  
                  <View style={styles.matchInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.matchName}>{match.name}, {match.age}</Text>
                      <View style={[styles.compatibilityBadge, { backgroundColor: getCompatibilityColor(match.compatibilityScore) }]}>
                        <Text style={styles.compatibilityScore}>{match.compatibilityScore}%</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.compatibilityLabel}>
                      {getCompatibilityLabel(match.compatibilityScore)} ✨
                    </Text>
                    
                    <View style={styles.metaInfo}>
                      <Text style={styles.metaText}>📍 {match.distance}</Text>
                      <Text style={styles.metaText}>⏰ {match.lastActive}</Text>
                    </View>
                  </View>
                </View>

                {/* Palm Insights */}
                <View style={styles.insightsSection}>
                  <Text style={styles.insightsTitle}>🔮 Palm Compatibility Insights:</Text>
                  <View style={styles.insightsList}>
                    {match.palmInsights.map((insight, index) => (
                      <Text key={index} style={styles.insightItem}>• {insight}</Text>
                    ))}
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity style={styles.viewProfileButton}>
                  <Text style={styles.viewProfileText}>View Full Profile</Text>
                  <Ionicons name="chevron-forward" size={16} color="#EC4899" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {/* No Matches Message */}
          {filteredMatches.length === 0 && (
            <View style={styles.noMatchesContainer}>
              <Text style={styles.noMatchesEmoji}>🔮✨</Text>
              <Text style={styles.noMatchesTitle}>No matches yet!</Text>
              <Text style={styles.noMatchesText}>
                The universe is still finding your perfect cosmic connections. Check back soon! 💫
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.discoverButton}>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.discoverButtonText}>Discover More Matches</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
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
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCount: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilter: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  matchCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradient: {
    padding: 20,
  },
  matchHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  matchInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  matchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  compatibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityScore: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  insightsSection: {
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 14,
    color: '#A855F7',
    fontWeight: '600',
    marginBottom: 8,
  },
  insightsList: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  insightItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 3,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#EC4899',
    borderRadius: 15,
    paddingVertical: 12,
    gap: 8,
  },
  viewProfileText: {
    color: '#EC4899',
    fontSize: 16,
    fontWeight: '600',
  },
  noMatchesContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noMatchesEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  noMatchesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  noMatchesText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  discoverButton: {
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 10,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});