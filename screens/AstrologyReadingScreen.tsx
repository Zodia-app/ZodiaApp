import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { supabase } from '../lib/supabase';
import { queueReading } from '../services/readingQueueService';

// Helper function to generate a valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const AstrologyReadingScreen = ({ navigation, route }: any) => {
  const { userData: routeUserData } = route.params || {};
  const [userData, setUserData] = useState(routeUserData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [horoscopeContent, setHoroscopeContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Fetch user data if not provided
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (profile) {
              setUserData({
                id: profile.id,
                name: profile.full_name,
                zodiacSign: profile.zodiac_sign,
                birthDate: profile.birth_date,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Use test data with proper UUID if fetch fails
          setUserData({
            id: generateUUID(), // Generate proper UUID for test user
            name: 'Test User',
            zodiacSign: 'Aries',
            birthDate: new Date('1990-01-01')
          });
        }
      }
    };

    fetchUserData();
  }, [userData]);

  // Handle reading submission with queue system
  const handleSubmitReading = async () => {
    try {
      if (!userData || !userData.id) {
        Alert.alert('Error', 'Please complete your profile first', [
          { text: 'OK', onPress: () => navigation.navigate('Profile') }
        ]);
        return;
      }

      // The queueReading service will handle UUID validation/generation
      const reading = await queueReading(
        userData.id,
        'astrology_full',
        { 
          questions: selectedQuestions,
          zodiacSign: userData.zodiacSign,
          userName: userData.name 
        },
        false // true if paid
      );
      
      // Navigate to queue status screen
      navigation.navigate('ReadingQueue', { readingId: reading.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to queue reading. Please try again.');
      console.error('Queue reading error:', error);
    }
  };

  // Mock AI horoscope generation function
  const generateAIHoroscope = async (userData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock horoscope based on zodiac sign
    const horoscopes: { [key: string]: string } = {
      'Aries': `Today brings fresh energy and new beginnings, ${userData.name}. As an Aries, your natural leadership qualities will shine brightly. The planetary alignment suggests it's an excellent time to start that project you've been contemplating. Your ruling planet Mars energizes your ambitions, making this a powerful day for taking action. In relationships, be mindful of your fiery nature - channel it into passion rather than impatience. Financial opportunities may present themselves, but careful consideration is advised. Trust your instincts, they're particularly sharp today.`,
      
      'Taurus': `Stability and comfort are your themes today, ${userData.name}. Venus, your ruling planet, encourages you to indulge in life's pleasures while maintaining your practical nature. A financial opportunity may arise - your natural prudence will serve you well. In love, express your feelings through actions rather than words. Your steadfast nature is appreciated by those around you. Take time to enjoy nature or artistic pursuits today.`,
      
      'Gemini': `Communication is key today, ${userData.name}. Mercury enhances your natural wit and charm, making this an ideal day for important conversations. Your dual nature allows you to see multiple perspectives - use this gift wisely. Social opportunities abound, and networking could lead to exciting prospects. In romance, intellectual connection deepens emotional bonds. Stay curious and open-minded.`,
      
      'Cancer': `Emotional wisdom guides you today, ${userData.name}. The Moon, your ruling planet, heightens your intuition and empathy. Trust your gut feelings about people and situations. Family and home matters may require attention - your nurturing nature will resolve any conflicts. Creative pursuits are especially favored. Take time for self-care and emotional replenishment.`,
      
      'Leo': `Your charisma is magnetic today, ${userData.name}. The Sun illuminates your natural leadership abilities and creative talents. This is an excellent time to showcase your skills and take center stage. Romance is highlighted - your warmth and generosity attract admirers. Be mindful not to let pride interfere with important relationships. Financial luck may come through creative ventures.`,
      
      'Virgo': `Precision and analysis serve you well today, ${userData.name}. Mercury sharpens your already keen eye for detail. Work projects benefit from your methodical approach. Health matters come into focus - consider starting a new wellness routine. In relationships, your practical support is valued more than grand gestures. Financial planning yields long-term benefits.`,
      
      'Libra': `Balance and harmony guide your day, ${userData.name}. Venus enhances your natural charm and diplomatic skills. Relationships of all kinds flourish under your thoughtful attention. Creative and artistic pursuits bring joy and possibly recognition. Avoid overthinking decisions - trust your sense of balance. Partnership opportunities may arise in both personal and professional spheres.`,
      
      'Scorpio': `Transformation is your theme today, ${userData.name}. Pluto's influence brings hidden truths to light and opportunities for deep change. Your intuitive powers are at their peak - trust what you sense beneath the surface. Intimate relationships deepen through honest communication. Financial investments made now may yield future rewards. Embrace the power of letting go.`,
      
      'Sagittarius': `Adventure beckons today, ${userData.name}. Jupiter expands your horizons and brings optimism to all endeavors. Travel, education, or philosophical pursuits satisfy your quest for meaning. Your enthusiasm is contagious - share your vision with others. Love may come through shared adventures or learning experiences. Financial opportunities arise through expansion and risk-taking.`,
      
      'Capricorn': `Achievement is within reach today, ${userData.name}. Saturn rewards your hard work and discipline with tangible progress. Career matters are especially favored - your leadership abilities are recognized. Set long-term goals with confidence. In relationships, reliability and commitment strengthen bonds. Financial stability improves through careful planning and patience.`,
      
      'Aquarius': `Innovation drives your day, ${userData.name}. Uranus sparks original thinking and unconventional solutions. Your humanitarian instincts guide you toward meaningful contributions. Friendships and group activities bring fulfillment. Technology may play a significant role in achieving your goals. Embrace your uniqueness - it's your greatest asset.`,
      
      'Pisces': `Intuition and creativity flow freely today, ${userData.name}. Neptune enhances your natural empathy and artistic abilities. Dreams and meditation provide valuable insights. Your compassionate nature draws others seeking comfort and understanding. Creative projects flourish under this influence. Trust your inner wisdom over logic in making decisions.`,
      
      'Default': `The stars align favorably for you today, ${userData.name}. Your ${userData.zodiacSign} nature is enhanced by current planetary positions. This is a time of opportunity and growth. Trust in your abilities and remain open to new experiences. Love, career, and personal development all show positive potential. Remember to stay grounded while reaching for the stars.`
    };
    
    return horoscopes[userData.zodiacSign] || horoscopes['Default'];
  };

  const generateHoroscope = async () => {
    if (!userData) {
      setError('User data not found. Please complete your profile first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const horoscope = await generateAIHoroscope(userData);
      setHoroscopeContent(horoscope);
      setHasGenerated(true);
      
      // Optionally save to Supabase (only if user has valid UUID)
      if (supabase && userData.id && userData.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        try {
          await supabase
            .from('horoscopes')
            .insert({
              user_id: userData.id,
              content: horoscope,
              zodiac_sign: userData.zodiacSign,
              created_at: new Date().toISOString()
            });
        } catch (dbError) {
          console.log('Failed to save horoscope to database:', dbError);
          // Don't show error to user as horoscope was generated successfully
        }
      }
    } catch (err: any) {
      setError('Unable to generate horoscope. Please try again.');
      console.error('Horoscope generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first load if userData exists
  useEffect(() => {
    if (userData && !hasGenerated && !horoscopeContent) {
      generateHoroscope();
    }
  }, [userData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNewReading = () => {
    setHoroscopeContent('');
    setHasGenerated(false);
    generateHoroscope();
  };

  // Toggle question selection (for future use)
  const toggleQuestion = (question: string) => {
    setSelectedQuestions(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Astrology Reading</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        {userData && (
          <View style={styles.userInfo}>
            <Text style={styles.zodiacSign}>{userData.zodiacSign}</Text>
            <Text style={styles.userName}>Reading for {userData.name}</Text>
          </View>
        )}

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {isGenerating ? (
            <AILoadingIndicator />
          ) : error ? (
            <ErrorMessage 
              message={error} 
              onRetry={generateHoroscope} 
            />
          ) : horoscopeContent ? (
            <>
              <View style={styles.horoscopeCard}>
                <Text style={styles.horoscopeTitle}>Your Personal Reading</Text>
                <Text style={styles.horoscopeContent}>{horoscopeContent}</Text>
                
                <View style={styles.metaInfo}>
                  <Text style={styles.metaText}>
                    Generated on {new Date().toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.newReadingButton}
                onPress={handleNewReading}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.newReadingText}>Generate New Reading</Text>
              </TouchableOpacity>

              {/* Add Queue Reading Button */}
              <TouchableOpacity 
                style={[styles.newReadingButton, { backgroundColor: '#6B46C1' }]}
                onPress={handleSubmitReading}
              >
                <Ionicons name="book" size={20} color="#FFFFFF" />
                <Text style={styles.newReadingText}>Get Full Reading</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles" size={64} color="#9d4edd" />
              <Text style={styles.emptyStateText}>
                Ready to discover what the stars have in store for you?
              </Text>
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateHoroscope}
              >
                <Text style={styles.generateButtonText}>
                  Generate My Reading
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Additional Features */}
        {horoscopeContent && (
          <View style={styles.additionalFeatures}>
            <TouchableOpacity style={styles.featureButton}>
              <Ionicons name="heart" size={24} color="#9d4edd" />
              <Text style={styles.featureText}>Love & Relationships</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureButton}>
              <Ionicons name="briefcase" size={24} color="#9d4edd" />
              <Text style={styles.featureText}>Career & Finance</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureButton}>
              <Ionicons name="fitness" size={24} color="#9d4edd" />
              <Text style={styles.featureText}>Health & Wellness</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  zodiacSign: {
    fontSize: 48,
    color: '#9d4edd',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    color: '#B8B8B8',
    marginTop: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  horoscopeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  horoscopeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  horoscopeContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E0E0E0',
  },
  metaInfo: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  newReadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9d4edd',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  newReadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#B8B8B8',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  generateButton: {
    backgroundColor: '#9d4edd',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalFeatures: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  featureText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
});

export default AstrologyReadingScreen;