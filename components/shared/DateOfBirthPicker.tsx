import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TouchableWithoutFeedback 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DateOfBirthPickerProps {
  value?: string; // ISO date string
  onDateChange: (date: string, age: number, zodiacSign: string) => void;
  placeholder?: string;
  theme?: 'light' | 'dark' | 'gradient';
  required?: boolean;
  maxAge?: number;
  showZodiac?: boolean;
  showAge?: boolean;
  disabled?: boolean;
  style?: any;
  error?: string;
}

export const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  value,
  onDateChange,
  placeholder = "Select Date of Birth",
  theme = 'light',
  required = false,
  maxAge = 120,
  showZodiac = true,
  showAge = false,
  disabled = false,
  style,
  error
}) => {
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper functions
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getZodiacSign = (birthDate: Date): string => {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    const zodiacSigns = [
      { sign: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
      { sign: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
      { sign: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
      { sign: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
      { sign: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
      { sign: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
      { sign: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
      { sign: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
      { sign: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
      { sign: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
      { sign: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
      { sign: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
    ];
    
    for (const zodiac of zodiacSigns) {
      if (zodiac.sign === 'Capricorn') {
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
          return zodiac.sign;
        }
      } else {
        const [startMonth, startDay] = zodiac.start;
        const [endMonth, endDay] = zodiac.end;
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return zodiac.sign;
        }
      }
    }
    
    return 'Unknown';
  };

  const getZodiacEmoji = (sign: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return emojiMap[sign] || '🔮';
  };

  // Auto-close timer management
  const resetAutoCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowDatePicker(false);
    }, 10000); // 10 seconds
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDateChange = (_: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      const age = calculateAge(date);
      
      // Age validation removed - no minimum age requirement
      
      if (age > maxAge) {
        Alert.alert('Invalid Date', 'Please enter a valid birth date.');
        return;
      }

      const zodiacSign = getZodiacSign(date);
      const isoDate = date.toISOString().split('T')[0];
      
      onDateChange(isoDate, age, zodiacSign);
      resetAutoCloseTimer();
    } else {
      // User cancelled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowDatePicker(false);
    }
  };

  const handleTogglePicker = () => {
    if (disabled) return;
    
    const newState = !showDatePicker;
    setShowDatePicker(newState);
    
    if (newState) {
      resetAutoCloseTimer();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

  // Get theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return darkStyles;
      case 'gradient':
        return gradientStyles;
      default:
        return lightStyles;
    }
  };

  const themeStyles = getThemeStyles();

  const age = value ? calculateAge(new Date(value)) : null;
  const zodiacSign = value ? getZodiacSign(new Date(value)) : null;
  const hasValue = Boolean(value);

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, style]}>
        <TouchableOpacity 
          style={[
            styles.dateButton, 
            themeStyles.dateButton, 
            disabled && styles.disabled,
            error && styles.errorBorder
          ]} 
          onPress={handleTogglePicker}
          disabled={disabled}
        >
          <View style={styles.dateContent}>
            <View style={styles.iconRow}>
              <Ionicons 
                name="calendar" 
                size={20} 
                color={themeStyles.iconColor as string} 
                style={styles.icon} 
              />
              <Text style={[styles.dateLabel, themeStyles.dateLabel]}>
                Date of Birth {required && <Text style={styles.required}>*</Text>}
              </Text>
            </View>
            
            <Text style={[
              styles.dateValue, 
              themeStyles.dateValue,
              !hasValue && styles.placeholder
            ]}>
              {hasValue 
                ? selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : placeholder
              }
            </Text>
            
            {hasValue && (
              <View style={styles.detailsRow}>
                {showAge && age && (
                  <Text style={[styles.ageText, themeStyles.ageText]}>
                    Age: {age}
                  </Text>
                )}
                {showZodiac && zodiacSign && (
                  <Text style={[styles.zodiacSign, themeStyles.zodiacSign]}>
                    {getZodiacEmoji(zodiacSign)} {zodiacSign}
                  </Text>
                )}
              </View>
            )}
          </View>
          
          <Ionicons 
            name={showDatePicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={themeStyles.iconColor as string} 
          />
        </TouchableOpacity>
        
        {error && (
          <Text style={[styles.errorText, themeStyles.errorText]}>{error}</Text>
        )}
        
        {showDatePicker && (
          <View style={[styles.datePickerContainer, themeStyles.datePickerContainer]}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              textColor={theme === 'light' ? '#000' : '#fff'}
              style={styles.datePicker}
            />
            <TouchableOpacity 
              style={[styles.doneButton, themeStyles.doneButton]}
              onPress={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
                setShowDatePicker(false);
              }}
            >
              <Text style={[styles.doneButtonText, themeStyles.doneButtonText]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dateButton: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.6,
  },
  errorBorder: {
    borderColor: '#ef4444',
  },
  dateContent: {
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    color: '#ef4444',
  },
  dateValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholder: {
    fontWeight: '500',
    fontStyle: 'italic',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  zodiacSign: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  datePickerContainer: {
    borderRadius: 15,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
  },
  datePicker: {
    height: 200,
  },
  doneButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

// Light theme styles
const lightStyles = {
  dateButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  iconColor: '#6b7280',
  dateLabel: {
    color: '#374151',
  },
  dateValue: {
    color: '#111827',
  },
  ageText: {
    color: '#6b7280',
  },
  zodiacSign: {
    color: '#8b5cf6',
  },
  errorText: {
    color: '#ef4444',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  doneButton: {
    backgroundColor: '#8b5cf6',
  },
  doneButtonText: {
    color: '#ffffff',
  },
};

// Dark theme styles  
const darkStyles = {
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconColor: 'rgba(255, 255, 255, 0.8)',
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateValue: {
    color: '#ffffff',
  },
  ageText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  zodiacSign: {
    color: '#a78bfa',
  },
  errorText: {
    color: '#fca5a5',
  },
  datePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  doneButton: {
    backgroundColor: '#8b5cf6',
  },
  doneButtonText: {
    color: '#ffffff',
  },
};

// Gradient theme styles (for palm reading flow)
const gradientStyles = {
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconColor: 'rgba(255, 255, 255, 0.9)',
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateValue: {
    color: '#ffffff',
  },
  ageText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  zodiacSign: {
    color: '#fcd34d',
  },
  errorText: {
    color: '#fca5a5',
  },
  datePickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  doneButton: {
    backgroundColor: '#f59e0b',
  },
  doneButtonText: {
    color: '#ffffff',
  },
};