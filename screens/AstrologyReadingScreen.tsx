import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { supabase } from '../lib/supabase';

const AstrologyReadingScreen = ({ navigation, route }: any) => {
  const { userData } = route.params || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [horoscopeContent, setHoroscopeContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Mock AI horoscope generation function
  // Replace this with your actual OpenAI API call
  const generateAIHoroscope = async (userData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock horoscope based on zodiac sign
    const horoscopes: { [key: string]: string } = {
      'Aries': `Today brings fresh energy and new beginnings, ${userData.name}. As an Aries, your natural leadership qualities will shine brightly. The planetary alignment suggests it's an excellent time to start that project you've been contemplating. Your ruling planet Mars energizes your ambitions, making this a powerful day for taking action. In relationships, be mindful of your fiery nature - channel it into passion rather than impatience. Financial opportunities may present themselves, but careful consideration is advised. Trust your instincts, they're particularly sharp today.`,
      
      'Taurus': `Stability and comfort are your themes today, ${userData.name}. Venus, your ruling planet, encourages you to indulge in life's pleasures while maintaining your practical nature. A financial opportunity may arise - your natural prudence will serve you well. In love, express your feelings through actions rather than words. Your steadfast nature is appreciated by those around you. Take time to enjoy nature or artistic pursuits today.`,
      
      'Gemini': `Communication is key today, ${userData.name}. Mercury enhances your natural wit and charm, making this an ideal day for important conversations. Your dual nature allows you to see multiple perspectives - use this gift wisely. Social opportunities abound, and networking could lead to exciting prospects. In romance, intellectual connection deepens emotional bonds. Stay curious and open-minded.`,
      
      // Add more zodiac signs...
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
      
      // Optionally save to Supabase
      if (supabase && userData.id) {
        await supabase
          .from('horoscopes')
          .insert({
            user_id: userData.id,
            content: horoscope,
            zodiac_sign: userData.zodiacSign,
            created_at: new Date().toISOString()
          });
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  additionalFeatures: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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