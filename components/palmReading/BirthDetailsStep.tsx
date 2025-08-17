import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { UserData } from '../../types/palmReading';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


interface BirthDetailsStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const BirthDetailsStep: React.FC<BirthDetailsStepProps> = ({ onNext, userData, setUserData }) => {
  const [date, setDate] = useState(userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = () => {
    setUserData({ 
      ...userData, 
      dateOfBirth: date.toISOString().split('T')[0]
    });
    onNext();
  };

  const getZodiacSign = (birthDate: Date) => {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Aquarius';
    return '♓ Pisces';
  };

  // Clear any existing timeout when component unmounts or date picker closes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Function to reset the auto-close timer
  const resetAutoCloseTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for 7 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setShowDatePicker(false);
    }, 7000);
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Reset the auto-close timer when user scrolls/changes date
      resetAutoCloseTimer();
    } else {
      // If user cancels/dismisses, close immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowDatePicker(false);
    }
  };

  const handleOutsidePress = () => {
    if (showDatePicker) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEnabled={!showDatePicker}
            bounces={false}
          >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>🎂</Text>
            <Text style={styles.title}>When were you born?</Text>
            <Text style={styles.subtitle}>We'll use your zodiac sign for context</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => {
                const newShowState = !showDatePicker;
                setShowDatePicker(newShowState);
                
                // If opening the picker, start the auto-close timer
                if (newShowState) {
                  resetAutoCloseTimer();
                } else {
                  // If closing manually, clear any timer
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                }
              }}
            >
              <View style={styles.dateContent}>
                <Text style={styles.dateLabel}>Date of Birth</Text>
                <Text style={styles.dateValue}>{date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</Text>
                <Text style={styles.zodiacSign}>{getZodiacSign(date)}</Text>
              </View>
            </TouchableOpacity>
            
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  textColor="white"
                  style={styles.datePicker}
                />
                <TouchableOpacity 
                  style={styles.closeDatePicker}
                  onPress={() => {
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.closeDatePickerText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <LinearGradient
            colors={['#F59E0B', '#EAB308', '#FCD34D']}
            style={styles.button}
          >
            <TouchableOpacity style={styles.buttonInner} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Continue ✨</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  buttonContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: screenHeight < 700 ? 40 : 60,
  },
  emoji: {
    fontSize: screenHeight < 700 ? 50 : 60,
    marginBottom: screenHeight < 700 ? 16 : 20,
  },
  title: {
    fontSize: screenHeight < 700 ? 28 : 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: screenHeight < 700 ? 16 : 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateContainer: {
    marginBottom: 40,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  datePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 250,
    overflow: 'hidden',
  },
  datePicker: {
    backgroundColor: 'transparent',
    height: 180,
  },
  closeDatePicker: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeDatePickerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateContent: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  zodiacSign: {
    fontSize: 24,
    color: '#FCD34D',
    fontWeight: '800',
  },
  button: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonInner: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  error: {
    color: '#FCD34D',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});