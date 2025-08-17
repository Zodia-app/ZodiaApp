import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserData } from '../../types/palmReading';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


interface NameStepProps {
  onNext: () => void;
  userData: Partial<UserData>;
  setUserData: (data: Partial<UserData>) => void;
}

export const NameStep: React.FC<NameStepProps> = ({ onNext, userData, setUserData }) => {
  const [name, setName] = useState(userData.name || '');
  const [error, setError] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setUserData({ ...userData, name: name.trim() });
    onNext();
  };

  const handleNameChange = (text: string) => {
    setName(text);
    setError('');
    // Show continue button only if text is entered
    setShowContinue(text.trim().length > 0);
  };

  const handleSubmitEditing = () => {
    if (name.trim()) {
      setShowContinue(true);
      Keyboard.dismiss();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.emoji}>✨</Text>
              <Text style={styles.title}>What's your name?</Text>
              <Text style={styles.subtitle}>Let's personalize your palm reading</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                returnKeyType="done"
                onSubmitEditing={handleSubmitEditing}
                blurOnSubmit={false}
              />
              
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </View>
          
          {showContinue && (
            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={['#F59E0B', '#EAB308', '#FCD34D']}
                style={styles.button}
              >
                <TouchableOpacity 
                  style={styles.buttonInner} 
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>Continue ✨</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: 'white',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    fontWeight: '600',
    minHeight: 58,
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
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});