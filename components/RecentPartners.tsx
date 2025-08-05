import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext'; // Commented out for now
import { theme } from '../theme';

interface Partner {
  id: string;
  partner_name: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  zodiac_sign?: string;
}

interface RecentPartnersProps {
  onSelect: (partner: Partner) => void;
}

export default function RecentPartners({ onSelect }: RecentPartnersProps) {
  // const { user } = useAuth(); // Commented out for now
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentPartners();
  }, []);

  const loadRecentPartners = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No authenticated user');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('compatibility_partners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Calculate zodiac signs
      const partnersWithSigns = data.map(partner => ({
        ...partner,
        zodiac_sign: getZodiacSign(new Date(partner.birth_date)),
      }));
      
      setPartners(partnersWithSigns);
    } catch (error) {
      console.error('Error loading recent partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getZodiacSign = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const signs = [
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
    ];
    
    // Find matching sign
    for (const sign of signs) {
      if (
        (month === sign.start[0] && day >= sign.start[1]) ||
        (month === sign.end[0] && day <= sign.end[1])
      ) {
        return sign.name;
      }
    }
    
    return 'Capricorn'; // Default fallback
  };

  if (isLoading || partners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Partners</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {partners.map((partner) => (
          <TouchableOpacity
            key={partner.id}
            style={styles.partnerCard}
            onPress={() => onSelect(partner)}
          >
            <View style={styles.zodiacIcon}>
              <Text style={styles.zodiacEmoji}>
                {getZodiacEmoji(partner.zodiac_sign || '')}
              </Text>
            </View>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner.partner_name}
            </Text>
            <Text style={styles.partnerSign}>
              {partner.zodiac_sign}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getZodiacEmoji = (sign: string): string => {
  const emojis: { [key: string]: string } = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
  };
  return emojis[sign] || '✨';
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 20,
  },
  partnerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zodiacIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  zodiacEmoji: {
    fontSize: 24,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  partnerSign: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});