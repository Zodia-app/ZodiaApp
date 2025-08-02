import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { calculateZodiacSign } from '../utils/zodiac/calculator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { supabase } from '../lib/supabase';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

const ProfileScreen = ({ navigation, route }: Props) => {
  const initialUserData = route?.params?.userData;
  const [userProfile, setUserProfile] = useState(initialUserData || null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from Supabase
  const fetchProfile = async () => {
    setProfileLoading(true);
    setError(null);
    
    try {
      // If we have initial data and no Supabase, use that
      if (!supabase && initialUserData) {
        setUserProfile(initialUserData);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist but we have initial data, use that
        if (profileError.code === 'PGRST116' && initialUserData) {
          setUserProfile(initialUserData);
          return;
        }
        throw profileError;
      }

      // Map database fields to our format
      setUserProfile({
        id: profile.id,
        name: profile.name,
        birthDate: profile.birth_date,
        gender: profile.gender,
        birthCity: profile.birth_city,
        relationshipStatus: profile.relationship_status,
        zodiacSign: profile.zodiac_sign
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Unable to load profile. Please try again.');
      
      // Fallback to initial data or defaults
      if (!userProfile) {
        setUserProfile(initialUserData || {
          name: 'User',
          birthDate: '1990-01-01',
          gender: 'Prefer not to say',
          birthCity: 'Unknown',
          relationshipStatus: 'Unknown'
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Use the imported calculateZodiacSign function
  const getZodiacDisplay = (birthDate: string) => {
    const zodiacInfo = calculateZodiacSign(birthDate);
    return zodiacInfo ? `${zodiacInfo.name} ${zodiacInfo.symbol}` : 'Unknown';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData: userProfile });
  };

  // Show loading state
  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading your profile..." />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage 
          message={error} 
          onRetry={fetchProfile} 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Error banner if there's an error but we have cached data */}
        {error && userProfile && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              ⚠️ Some data may be outdated
            </Text>
            <TouchableOpacity onPress={fetchProfile}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userProfile?.name || 'U')}</Text>
          </View>
          <Text style={styles.nameText}>{userProfile?.name || 'Unknown User'}</Text>
          <Text style={styles.zodiacText}>
            {getZodiacDisplay(userProfile?.birthDate || '')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Birth Date</Text>
              <Text style={styles.infoValue}>
                {userProfile?.birthDate || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {userProfile?.gender || 'Not set'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zodiac Sign</Text>
              <Text style={styles.infoValue}>
                {getZodiacDisplay(userProfile?.birthDate || '')}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Location</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Birth Place</Text>
              <Text style={styles.infoValue}>
                {userProfile?.birthCity || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Relationship</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {userProfile?.relationshipStatus || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#9d4edd',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 60,
  },
  errorBanner: {
    backgroundColor: '#3d2d44',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  errorBannerText: {
    color: '#ffa500',
    fontSize: 14,
  },
  retryText: {
    color: '#9d4edd',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9d4edd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  zodiacText: {
    fontSize: 18,
    color: '#9d4edd',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  infoLabel: {
    fontSize: 16,
    color: '#888',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: '#9d4edd',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;