// src/components/compatibility/CompatibilityInput.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getZodiacSign } from '../../utils/zodiacUtils';

interface CompatibilityInputProps {
  onAnalyze: (user1: UserData, user2: UserData) => void;
  isLoading?: boolean;
}

interface UserData {
  name: string;
  birthDate: string;
}

export const CompatibilityInput: React.FC<CompatibilityInputProps> = ({ 
  onAnalyze, 
  isLoading = false 
}) => {
  // State for User 1
  const [user1Name, setUser1Name] = useState('');
  const [user1Date, setUser1Date] = useState(new Date());
  const [user1Zodiac, setUser1Zodiac] = useState('');
  const [showUser1Picker, setShowUser1Picker] = useState(false);
  
  // State for User 2
  const [user2Name, setUser2Name] = useState('');
  const [user2Date, setUser2Date] = useState(new Date());
  const [user2Zodiac, setUser2Zodiac] = useState('');
  const [showUser2Picker, setShowUser2Picker] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<{
    user1Name?: string;
    user2Name?: string;
    user1Date?: string;
    user2Date?: string;
  }>({});
  
  // Animation values
  const buttonScale = new Animated.Value(1);
  const heartBeat = new Animated.Value(1);
  const glowOpacity = new Animated.Value(0.3);
  
  // Start heart animation
  useEffect(() => {
    const heartAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    heartAnimation.start();
    
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();
    
    return () => {
      heartAnimation.stop();
      glowAnimation.stop();
    };
  }, []);
  
  // Update zodiac signs when dates change
  useEffect(() => {
    setUser1Zodiac(getZodiacSign(user1Date));
  }, [user1Date]);
  
  useEffect(() => {
    setUser2Zodiac(getZodiacSign(user2Date));
  }, [user2Date]);
  
  // Validation function
  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};
    
    // Name validation
    if (!user1Name.trim()) {
      newErrors.user1Name = 'Please enter the first person\'s name';
    } else if (user1Name.trim().length < 2) {
      newErrors.user1Name = 'Name must be at least 2 characters';
    }
    
    if (!user2Name.trim()) {
      newErrors.user2Name = 'Please enter the second person\'s name';
    } else if (user2Name.trim().length < 2) {
      newErrors.user2Name = 'Name must be at least 2 characters';
    }
    
    // Date validation
    const today = new Date();
    const minDate = new Date(1900, 0, 1);
    
    if (user1Date > today) {
      newErrors.user1Date = 'Birth date cannot be in the future';
    } else if (user1Date < minDate) {
      newErrors.user1Date = 'Please enter a valid birth date';
    }
    
    if (user2Date > today) {
      newErrors.user2Date = 'Birth date cannot be in the future';
    } else if (user2Date < minDate) {
      newErrors.user2Date = 'Please enter a valid birth date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle analyze button press
  const handleAnalyze = () => {
    if (!validateInputs()) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }
    
    // Success animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onAnalyze(
      {
        name: user1Name.trim(),
        birthDate: user1Date.toISOString().split('T')[0],
      },
      {
        name: user2Name.trim(),
        birthDate: user2Date.toISOString().split('T')[0],
      }
    );
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Zodiac icon component
  const ZodiacIcon = ({ sign }: { sign: string }) => {
    const zodiacIcons: Record<string, string> = {
      Aries: 'zodiac-aries',
      Taurus: 'zodiac-taurus',
      Gemini: 'zodiac-gemini',
      Cancer: 'zodiac-cancer',
      Leo: 'zodiac-leo',
      Virgo: 'zodiac-virgo',
      Libra: 'zodiac-libra',
      Scorpio: 'zodiac-scorpio',
      Sagittarius: 'zodiac-sagittarius',
      Capricorn: 'zodiac-capricorn',
      Aquarius: 'zodiac-aquarius',
      Pisces: 'zodiac-pisces',
    };
    
    return (
      <MaterialCommunityIcons
        name={zodiacIcons[sign] || 'star'}
        size={24}
        color="#9333EA"
      />
    );
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cosmic Compatibility</Text>
          <Text style={styles.subtitle}>
            Discover the celestial connection between two souls
          </Text>
        </View>
        
        {/* User 1 Input */}
        <View style={styles.userSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={24} color="#9333EA" />
            <Text style={styles.sectionTitle}>First Person</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.user1Name && styles.inputError]}
              placeholder="Enter name"
              placeholderTextColor="#666"
              value={user1Name}
              onChangeText={(text) => {
                setUser1Name(text);
                if (errors.user1Name) {
                  setErrors({ ...errors, user1Name: undefined });
                }
              }}
              maxLength={50}
            />
            {errors.user1Name && (
              <Text style={styles.errorText}>{errors.user1Name}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowUser1Picker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#9333EA" />
            <Text style={styles.dateButtonText}>{formatDate(user1Date)}</Text>
            {user1Zodiac && <ZodiacIcon sign={user1Zodiac} />}
          </TouchableOpacity>
          
          {user1Zodiac && (
            <Text style={styles.zodiacText}>
              {user1Zodiac} • {getZodiacElement(user1Zodiac)} Sign
            </Text>
          )}
          
          {errors.user1Date && (
            <Text style={styles.errorText}>{errors.user1Date}</Text>
          )}
          
          {showUser1Picker && (
            <DateTimePicker
              value={user1Date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowUser1Picker(Platform.OS === 'ios');
                if (selectedDate) {
                  setUser1Date(selectedDate);
                  if (errors.user1Date) {
                    setErrors({ ...errors, user1Date: undefined });
                  }
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}
        </View>
        
        {/* Heart Divider */}
        <View style={styles.divider}>
          <Animated.View
            style={[
              styles.heartContainer,
              { transform: [{ scale: heartBeat }] }
            ]}
          >
            <MaterialCommunityIcons name="heart" size={32} color="#E91E63" />
          </Animated.View>
        </View>
        
        {/* User 2 Input */}
        <View style={styles.userSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={24} color="#9333EA" />
            <Text style={styles.sectionTitle}>Second Person</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.user2Name && styles.inputError]}
              placeholder="Enter name"
              placeholderTextColor="#666"
              value={user2Name}
              onChangeText={(text) => {
                setUser2Name(text);
                if (errors.user2Name) {
                  setErrors({ ...errors, user2Name: undefined });
                }
              }}
              maxLength={50}
            />
            {errors.user2Name && (
              <Text style={styles.errorText}>{errors.user2Name}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowUser2Picker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#9333EA" />
            <Text style={styles.dateButtonText}>{formatDate(user2Date)}</Text>
            {user2Zodiac && <ZodiacIcon sign={user2Zodiac} />}
          </TouchableOpacity>
          
          {user2Zodiac && (
            <Text style={styles.zodiacText}>
              {user2Zodiac} • {getZodiacElement(user2Zodiac)} Sign
            </Text>
          )}
          
          {errors.user2Date && (
            <Text style={styles.errorText}>{errors.user2Date}</Text>
          )}
          
          {showUser2Picker && (
            <DateTimePicker
              value={user2Date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowUser2Picker(Platform.OS === 'ios');
                if (selectedDate) {
                  setUser2Date(selectedDate);
                  if (errors.user2Date) {
                    setErrors({ ...errors, user2Date: undefined });
                  }
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}
        </View>
        
        {/* Analyze Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ scale: buttonScale }] }
          ]}
        >
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9333EA', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.analyzeButton}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Consulting the Stars...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="creation" size={24} color="white" />
                  <Text style={styles.buttonText}>Analyze Compatibility</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.buttonGlow,
              { opacity: glowOpacity }
            ]}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Helper function to get zodiac element
const getZodiacElement = (sign: string): string => {
  const elements: Record<string, string> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  return elements[sign] || 'Unknown';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Cinzel-SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#E91E63',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  zodiacText: {
    fontSize: 14,
    color: '#9333EA',
    marginTop: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#E91E63',
    marginTop: 4,
    marginLeft: 4,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 10,
  },
  heartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 50,
    padding: 12,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  buttonGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#9333EA',
    borderRadius: 50,
    zIndex: -1,
  },
});