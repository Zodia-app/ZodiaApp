import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface BirthTimePickerProps {
  value?: string; // HH:MM format (24-hour)
  onTimeChange: (time: string | null) => void;
  theme?: 'light' | 'dark' | 'gradient';
  disabled?: boolean;
  style?: any;
}

export const BirthTimePickerOptional: React.FC<BirthTimePickerProps> = ({
  value,
  onTimeChange,
  theme = 'light',
  disabled = false,
  style
}) => {
  const [includeTime, setIncludeTime] = useState(!!value);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    const defaultTime = new Date();
    defaultTime.setHours(12, 0, 0, 0); // Default to noon
    return defaultTime;
  });

  const handleToggleIncludeTime = (enabled: boolean) => {
    setIncludeTime(enabled);
    
    if (enabled) {
      // When enabling, set default time to current selection
      const timeString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      onTimeChange(timeString);
    } else {
      // When disabling, clear the time
      onTimeChange(null);
    }
  };

  const handleTimeChange = (_: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (time) {
      setSelectedTime(time);
      const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      onTimeChange(timeString);
    }
  };

  const formatTimeForDisplay = (time: Date): string => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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

  return (
    <View style={[styles.container, style]}>
      {/* Toggle Switch for Including Birth Time */}
      <View style={[styles.toggleContainer, themeStyles.toggleContainer]}>
        <View style={styles.toggleContent}>
          <View style={styles.iconRow}>
            <Ionicons 
              name="time" 
              size={20} 
              color={themeStyles.iconColor as string} 
              style={styles.icon} 
            />
            <Text style={[styles.toggleLabel, themeStyles.toggleLabel]}>
              Include Birth Time (Optional)
            </Text>
          </View>
          <Text style={[styles.toggleDescription, themeStyles.toggleDescription]}>
            For more accurate astrological compatibility analysis
          </Text>
        </View>
        
        <Switch
          value={includeTime}
          onValueChange={handleToggleIncludeTime}
          disabled={disabled}
          trackColor={{ 
            false: themeStyles.switchTrackFalse as string, 
            true: themeStyles.switchTrackTrue as string 
          }}
          thumbColor={includeTime ? themeStyles.switchThumbActive as string : themeStyles.switchThumbInactive as string}
        />
      </View>

      {/* Time Picker (only shown when includeTime is true) */}
      {includeTime && (
        <View style={[styles.timePickerSection, themeStyles.timePickerSection]}>
          <TouchableOpacity 
            style={[
              styles.timeButton, 
              themeStyles.timeButton,
              disabled && styles.disabled
            ]} 
            onPress={() => setShowTimePicker(true)}
            disabled={disabled}
          >
            <View style={styles.timeContent}>
              <Text style={[styles.timeLabel, themeStyles.timeLabel]}>
                Birth Time
              </Text>
              <Text style={[styles.timeValue, themeStyles.timeValue]}>
                {formatTimeForDisplay(selectedTime)}
              </Text>
              <Text style={[styles.timeNote, themeStyles.timeNote]}>
                24-hour: {selectedTime.getHours().toString().padStart(2, '0')}:{selectedTime.getMinutes().toString().padStart(2, '0')}
              </Text>
            </View>
            
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={themeStyles.iconColor as string} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.helpText, themeStyles.helpText]}>
            💡 Birth time enables calculation of rising sign, moon sign, and houses for enhanced compatibility analysis
          </Text>
        </View>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
          textColor={theme === 'light' ? '#000' : '#fff'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  toggleContainer: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  timePickerSection: {
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

// Light theme styles
const lightStyles = {
  toggleContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  iconColor: '#6b7280',
  toggleLabel: {
    color: '#374151',
  },
  toggleDescription: {
    color: '#6b7280',
  },
  switchTrackFalse: '#d1d5db',
  switchTrackTrue: '#8b5cf6',
  switchThumbActive: '#ffffff',
  switchThumbInactive: '#ffffff',
  timePickerSection: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  timeButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
  },
  timeLabel: {
    color: '#374151',
  },
  timeValue: {
    color: '#111827',
  },
  timeNote: {
    color: '#6b7280',
  },
  helpText: {
    color: '#8b5cf6',
  },
};

// Dark theme styles  
const darkStyles = {
  toggleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconColor: 'rgba(255, 255, 255, 0.8)',
  toggleLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggleDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  switchTrackFalse: 'rgba(255, 255, 255, 0.3)',
  switchTrackTrue: '#a78bfa',
  switchThumbActive: '#ffffff',
  switchThumbInactive: '#ffffff',
  timePickerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeValue: {
    color: '#ffffff',
  },
  timeNote: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  helpText: {
    color: '#a78bfa',
  },
};

// Gradient theme styles (for palm reading flow)
const gradientStyles = {
  toggleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconColor: 'rgba(255, 255, 255, 0.9)',
  toggleLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggleDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switchTrackFalse: 'rgba(255, 255, 255, 0.3)',
  switchTrackTrue: '#fcd34d',
  switchThumbActive: '#ffffff',
  switchThumbInactive: '#ffffff',
  timePickerSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timeLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeValue: {
    color: '#ffffff',
  },
  timeNote: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  helpText: {
    color: '#fcd34d',
  },
};