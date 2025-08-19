import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { UserProfileService } from '../../services/compatibility/userProfileService';
import { UserProfile, CompatibilityMatch, MatchInvitation } from '../../types/compatibility';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const CompatibilityDashboard = () => {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [sentInvitations, setSentInvitations] = useState<MatchInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<MatchInvitation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userProfile, userMatches, sentInvites, receivedInvites] = await Promise.all([
        UserProfileService.getProfile(),
        UserProfileService.getCompatibilityMatches(),
        UserProfileService.getSentInvitations(),
        UserProfileService.getReceivedInvitations()
      ]);

      setProfile(userProfile);
      setMatches(userMatches);
      setSentInvitations(sentInvites);
      setReceivedInvitations(receivedInvites);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCreateInvite = () => {
    if (!profile) {
      navigation.navigate('CreateProfile');
      return;
    }
    navigation.navigate('CreateInvite');
  };

  const handleJoinWithCode = () => {
    navigation.navigate('JoinWithCode');
  };

  const handleViewMatch = (match: CompatibilityMatch) => {
    navigation.navigate('CompatibilityResult', { matchId: match.id });
  };

  const getMatchPartnerName = (match: CompatibilityMatch) => {
    if (!profile) return 'Unknown';
    return match.initiator?.user_id === profile.user_id 
      ? match.partner?.name 
      : match.initiator?.name;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '✨';
    if (score >= 70) return '💫';
    if (score >= 60) return '⭐';
    return '💛';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color="white" />
            <Text style={styles.loadingText}>Loading your compatibility dashboard...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#8B5CF6', '#A855F7', '#C084FC']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="white" />
          }
        >
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Hey {profile?.name || 'there'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Ready to discover some cosmic connections?
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateInvite}>
              <LinearGradient
                colors={['#F59E0B', '#EAB308']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionEmoji}>✨</Text>
                <Text style={styles.actionText}>Create Invite</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleJoinWithCode}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionEmoji}>🔗</Text>
                <Text style={styles.actionText}>Join with Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Received Invitations */}
          {receivedInvitations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💌 Pending Invites</Text>
              {receivedInvitations.map((invite) => (
                <TouchableOpacity 
                  key={invite.id} 
                  style={styles.inviteCard}
                  onPress={() => navigation.navigate('AcceptInvite', { inviteCode: invite.invite_code })}
                >
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteFromText}>
                      {invite.from_user?.name} wants to check compatibility!
                    </Text>
                    <Text style={styles.inviteTypeText}>
                      {invite.match_type === 'romantic' ? '💕 Romantic' : 
                       invite.match_type === 'friendship' ? '👯‍♀️ Friendship' : '🤝 Platonic'}
                    </Text>
                    {invite.message && (
                      <Text style={styles.inviteMessage}>"{invite.message}"</Text>
                    )}
                  </View>
                  <Text style={styles.inviteArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Your Matches */}
          {matches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔮 Your Compatibility Matches</Text>
              {matches.map((match) => (
                <TouchableOpacity 
                  key={match.id} 
                  style={styles.matchCard}
                  onPress={() => handleViewMatch(match)}
                >
                  <View style={styles.matchHeader}>
                    <Text style={styles.matchPartnerText}>
                      {getMatchPartnerName(match)}
                    </Text>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreText, { color: getScoreColor(match.overall_score || 0) }]}>
                        {match.overall_score || 0}%
                      </Text>
                      <Text style={styles.scoreEmoji}>
                        {getScoreEmoji(match.overall_score || 0)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.matchType}>
                    <Text style={styles.matchTypeText}>
                      {match.match_type === 'romantic' ? '💕 Romantic Match' : 
                       match.match_type === 'friendship' ? '👯‍♀️ Friendship Match' : '🤝 Platonic Match'}
                    </Text>
                  </View>

                  {match.compatibility_analysis?.vibe_summary && (
                    <Text style={styles.matchPreview} numberOfLines={2}>
                      {match.compatibility_analysis.vibe_summary}
                    </Text>
                  )}

                  <View style={styles.matchFooter}>
                    <Text style={styles.matchDate}>
                      {new Date(match.created_at).toLocaleDateString()}
                    </Text>
                    {match.is_public && (
                      <Text style={styles.sharedBadge}>📱 Shared</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sent Invitations */}
          {sentInvitations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📤 Sent Invites</Text>
              {sentInvitations.map((invite) => (
                <View key={invite.id} style={styles.sentInviteCard}>
                  <View style={styles.inviteContent}>
                    <Text style={styles.inviteCodeText}>
                      Code: {invite.invite_code}
                    </Text>
                    <Text style={styles.inviteStatusText}>
                      Status: {invite.status === 'pending' ? '⏳ Waiting' : 
                               invite.status === 'accepted' ? '✅ Accepted' : '❌ Expired'}
                    </Text>
                    <Text style={styles.inviteTypeText}>
                      {invite.match_type === 'romantic' ? '💕 Romantic' : 
                       invite.match_type === 'friendship' ? '👯‍♀️ Friendship' : '🤝 Platonic'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {matches.length === 0 && sentInvitations.length === 0 && receivedInvitations.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyTitle}>No matches yet!</Text>
              <Text style={styles.emptyText}>
                Create an invite or join with a code to start discovering your compatibility with others.
              </Text>
            </View>
          )}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  inviteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inviteContent: {
    flex: 1,
  },
  inviteFromText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  inviteTypeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  inviteMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  inviteArrow: {
    fontSize: 20,
    color: 'white',
    marginLeft: 12,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchPartnerText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreEmoji: {
    fontSize: 16,
  },
  matchType: {
    marginBottom: 8,
  },
  matchTypeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  matchPreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sharedBadge: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sentInviteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inviteCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  inviteStatusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});

export default CompatibilityDashboard;