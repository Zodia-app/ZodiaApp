import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

// Helper function to queue a reading (placeholder for now)
const queueReading = async (
  userId: string, 
  readingType: string,
  userZodiacSign?: string
) => {
  try {
    // TODO: Implement actual Supabase integration
    console.log('Queueing reading:', {
      user_id: userId,
      reading_type: readingType,
      zodiac_sign: userZodiacSign,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    
    // This is what the actual implementation will look like:
    /*
    const { data, error } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        reading_type: readingType,
        zodiac_sign: userZodiacSign,
        status: 'pending',
        is_paid: false, // Will be updated after payment
        priority: 0, // Default priority, paid users get higher priority
        created_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
    */
    
    // For now, return mock data
    return {
      id: 'mock-reading-id-' + Date.now(),
      reading_type: readingType,
      status: 'pending',
      estimated_completion: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error queueing reading:', error);
    throw error;
  }
};

// Helper function to check if user can request a free reading
const canUserGetFreeReading = async (userId: string) => {
  try {
    // TODO: Implement actual check with Supabase
    /*
    const { data, error } = await supabase
      .from('readings')
      .select('id')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .limit(1);
    
    if (error) throw error;
    
    // User gets 1 free reading (either astrology OR palm)
    return data.length === 0;
    */
    
    // For now, return true (eligible) until Supabase is connected
    return true;
  } catch (error) {
    console.error('Error checking free reading eligibility:', error);
    return false;
  }
};

const ReadingRequestScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  
  // Get user data from navigation params (if available)
  const userData = route?.params?.userData || { 
    name: 'Test User', 
    zodiacSign: 'Aries' 
  };

  // Reading types configuration
  const readingTypes = [
    {
      id: 'astrology',
      title: 'Astrology Reading',
      description: 'Discover your destiny through the stars and planets',
      price: 'Free Teaser / $4.99 Full',
      icon: '⭐',
      gradient: ['#7B68EE', '#9370DB'],
      features: [
        'Personal horoscope',
        'Birth chart analysis',
        'Future predictions',
        'Compatibility insights'
      ]
    },
    {
      id: 'palm',
      title: 'Palm Reading',
      description: 'Unlock secrets written in the lines of your palm',
      price: 'Free Teaser / $4.99 Full',
      icon: '🤚',
      gradient: ['#4169E1', '#6495ED'],
      features: [
        'Life line analysis',
        'Love & relationships',
        'Career insights',
        'Health predictions'
      ]
    },
    {
      id: 'clairvoyance',
      title: 'Clairvoyance Reading',
      description: 'Premium mystical insights from beyond the veil',
      price: '$34.99',
      icon: '🔮',
      gradient: ['#FFD700', '#FFA500'],
      premium: true,
      features: [
        '5-10 page detailed report',
        'Past life connections',
        'Spirit guide messages',
        'Future timeline reading'
      ]
    }
  ];

  const handleReadingSelection = async (readingType: string) => {
    setSelectedReading(readingType);
    
    try {
      // Use actual user data if available
      const userId = userData.id || 'mock-user-id';
      const userZodiacSign = userData.zodiacSign || 'Aries';
      
      // Check if this is a premium reading
      if (readingType === 'clairvoyance') {
        // Navigate directly to payment for premium readings
        navigation.navigate('PremiumPayment' as never, { 
          readingType: 'clairvoyance',
          price: 34.99,
          onSuccess: async () => {
            // Queue reading after successful payment
            await queueReading(userId, readingType, userZodiacSign);
          }
        } as never);
        return;
      }
      
      // For non-premium readings, check if user can get free reading
      const canGetFree = await canUserGetFreeReading(userId);
      
      if (canGetFree) {
        // Queue the free reading
        const reading = await queueReading(userId, readingType, userZodiacSign);
        
        // Navigate to appropriate screen
        switch (readingType) {
          case 'astrology':
            navigation.navigate('AstrologyReading' as never, {
              readingId: reading.id,
              isFreeReading: true,
              userData: userData,
            } as never);
            break;
          case 'palm':
            navigation.navigate('PalmCamera' as never, {
              readingId: reading.id,
              isFreeReading: true,
              userData: userData,
            } as never);
            break;
        }
      } else {
        // User has already used free reading, show payment screen
        navigation.navigate('PremiumPayment' as never, { 
          readingType,
          price: 4.99,
          onSuccess: async () => {
            // Queue reading after successful payment
            await queueReading(userId, readingType, userZodiacSign);
          }
        } as never);
      }
    } catch (error) {
      console.error('Error handling reading selection:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Reading</Text>
          <Text style={styles.subtitle}>
            Select a mystical path to unveil your future
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {readingTypes.map((reading) => (
            <TouchableOpacity
              key={reading.id}
              style={[
                styles.card,
                selectedReading === reading.id && styles.selectedCard,
                reading.premium && styles.premiumCard
              ]}
              onPress={() => handleReadingSelection(reading.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{reading.icon}</Text>
                {reading.premium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>PREMIUM</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardTitle}>{reading.title}</Text>
              <Text style={styles.cardDescription}>{reading.description}</Text>

              <View style={styles.featuresContainer}>
                {reading.features.map((feature, index) => (
                  <Text key={index} style={styles.feature}>
                    • {feature}
                  </Text>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.price}>{reading.price}</Text>
                <TouchableOpacity 
                  style={[
                    styles.selectButton,
                    reading.premium && styles.premiumButton
                  ]}
                  onPress={() => handleReadingSelection(reading.id)}
                >
                  <Text style={styles.selectButtonText}>
                    {reading.premium ? 'Unlock Premium' : 'Select Reading'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            1. Choose your preferred reading type{'\n'}
            2. Follow the guided process{'\n'}
            3. Receive your personalized reading within 2-3 hours{'\n'}
            4. Paid readings are prioritized for faster delivery
          </Text>
        </View>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#7B68EE',
  },
  premiumCard: {
    backgroundColor: '#1F1A0A',
    borderColor: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 48,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#B8B8B8',
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B68EE',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#7B68EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#FFD700',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#B8B8B8',
    lineHeight: 22,
  },
});

export default ReadingRequestScreen;