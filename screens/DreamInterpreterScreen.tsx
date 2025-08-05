import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DreamInterpreterScreen = () => {
  const navigation = useNavigation<any>();
  const [dreamDescription, setDreamDescription] = useState('');
  const [interpretation, setInterpretation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentDreams, setRecentDreams] = useState([
    { id: 1, title: 'Flying Dream', date: 'Aug 3, 2025', preview: 'I was flying over mountains...' },
    { id: 2, title: 'Water Dream', date: 'Aug 1, 2025', preview: 'Swimming in a clear ocean...' },
  ]);

  const handleInterpret = async () => {
    if (dreamDescription.length < 20) {
      Alert.alert('More Details Needed', 'Please describe your dream in more detail (at least 20 characters)');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockInterpretation = {
        title: 'Dream Analysis',
        mainThemes: ['Transformation', 'Freedom', 'Ambition'],
        symbolism: [
          { symbol: 'Flying', meaning: 'Desire for freedom or escaping limitations' },
          { symbol: 'Mountains', meaning: 'Obstacles or goals in your life' },
        ],
        interpretation: `Your dream suggests a strong desire for freedom and independence. The act of flying often represents liberation from constraints or a new perspective on life challenges. Mountains in your dream may symbolize ambitious goals or obstacles you're working to overcome.`,
        emotionalTone: 'Positive, Liberating',
        advice: 'This dream encourages you to pursue your ambitions and break free from limiting beliefs.',
        luckyNumbers: [3, 7, 21],
        date: new Date().toLocaleDateString(),
      };
      
      setInterpretation(mockInterpretation);
      setIsLoading(false);
      
      // Add to recent dreams
      const newDream = {
        id: Date.now(),
        title: dreamDescription.substring(0, 30) + '...',
        date: new Date().toLocaleDateString(),
        preview: dreamDescription.substring(0, 50) + '...',
      };
      setRecentDreams([newDream, ...recentDreams.slice(0, 4)]);
    }, 2000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClear = () => {
    setDreamDescription('');
    setInterpretation(null);
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dream Interpreter</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {!interpretation ? (
              <>
                <View style={styles.inputSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="moon" size={60} color="#48DBFB" />
                  </View>
                  
                  <Text style={styles.title}>Describe Your Dream</Text>
                  <Text style={styles.subtitle}>
                    Share the details you remember - emotions, symbols, colors, and events
                  </Text>

                  <TextInput
                    style={styles.dreamInput}
                    placeholder="I dreamed that I was..."
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={dreamDescription}
                    onChangeText={setDreamDescription}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />

                  <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Tips for Better Interpretation:</Text>
                    <Text style={styles.tipItem}>• Include emotions you felt</Text>
                    <Text style={styles.tipItem}>• Mention specific symbols or objects</Text>
                    <Text style={styles.tipItem}>• Note any recurring patterns</Text>
                    <Text style={styles.tipItem}>• Describe colors and atmosphere</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.interpretButton, isLoading && styles.disabledButton]}
                    onPress={handleInterpret}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#48DBFB', '#0099CC']}
                      style={styles.buttonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="sparkles" size={24} color="#fff" />
                          <Text style={styles.interpretButtonText}>Interpret Dream</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {recentDreams.length > 0 && (
                  <View style={styles.recentSection}>
                    <Text style={styles.recentTitle}>Recent Dreams</Text>
                    {recentDreams.map((dream) => (
                      <TouchableOpacity key={dream.id} style={styles.recentCard}>
                        <Ionicons name="moon-outline" size={20} color="#48DBFB" />
                        <View style={styles.recentContent}>
                          <Text style={styles.recentDreamTitle}>{dream.title}</Text>
                          <Text style={styles.recentDate}>{dream.date}</Text>
                          <Text style={styles.recentPreview} numberOfLines={1}>
                            {dream.preview}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.resultSection}>
                <View style={styles.resultHeader}>
                  <Ionicons name="sparkles" size={30} color="#FFD700" />
                  <Text style={styles.resultTitle}>{interpretation.title}</Text>
                  <Text style={styles.resultDate}>{interpretation.date}</Text>
                </View>

                <View style={styles.themesContainer}>
                  <Text style={styles.sectionTitle}>Main Themes</Text>
                  <View style={styles.themesRow}>
                    {interpretation.mainThemes.map((theme: string, index: number) => (
                      <View key={index} style={styles.themeTag}>
                        <Text style={styles.themeText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.interpretationCard}>
                  <Text style={styles.sectionTitle}>Interpretation</Text>
                  <Text style={styles.interpretationText}>
                    {interpretation.interpretation}
                  </Text>
                </View>

                <View style={styles.symbolismCard}>
                  <Text style={styles.sectionTitle}>Symbolism</Text>
                  {interpretation.symbolism.map((item: any, index: number) => (
                    <View key={index} style={styles.symbolItem}>
                      <Text style={styles.symbolName}>{item.symbol}:</Text>
                      <Text style={styles.symbolMeaning}>{item.meaning}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.adviceCard}>
                  <Ionicons name="bulb" size={24} color="#FFD700" />
                  <Text style={styles.adviceText}>{interpretation.advice}</Text>
                </View>

                <View style={styles.bottomInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Emotional Tone</Text>
                    <Text style={styles.infoValue}>{interpretation.emotionalTone}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Lucky Numbers</Text>
                    <Text style={styles.infoValue}>{interpretation.luckyNumbers.join(', ')}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.newDreamButton} onPress={handleClear}>
                  <Text style={styles.newDreamButtonText}>Interpret Another Dream</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    color: '#48DBFB',
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputSection: {
    marginTop: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(72, 219, 251, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  dreamInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(72, 219, 251, 0.3)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 150,
    marginBottom: 20,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  tipsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipItem: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginVertical: 3,
  },
  interpretButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  interpretButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  recentCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  recentContent: {
    flex: 1,
    marginLeft: 15,
  },
  recentDreamTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recentDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  recentPreview: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 5,
  },
  resultSection: {
    marginTop: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  resultDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 5,
  },
  themesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeTag: {
    backgroundColor: 'rgba(72, 219, 251, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  themeText: {
    color: '#48DBFB',
    fontSize: 14,
  },
  interpretationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  interpretationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  symbolismCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  symbolItem: {
    marginVertical: 8,
  },
  symbolName: {
    color: '#48DBFB',
    fontSize: 15,
    fontWeight: '600',
  },
  symbolMeaning: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 3,
  },
  adviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  adviceText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 5,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  newDreamButton: {
    backgroundColor: 'rgba(72, 219, 251, 0.2)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  newDreamButtonText: {
    color: '#48DBFB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DreamInterpreterScreen;