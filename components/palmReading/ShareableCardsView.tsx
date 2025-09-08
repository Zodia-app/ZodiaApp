import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { ShareableTarotCard } from './ShareableTarotCard';

const { width: screenWidth } = Dimensions.get('window');

interface PalmReadingAnalysis {
  greeting?: string;
  overallPersonality: string;
  lines: {
    [key: string]: {
      name: string;
      description: string;
      meaning: string;
      personalizedInsight: string;
    }
  };
  mounts: {
    [key: string]: {
      name: string;
      prominence: string;
      meaning: string;
    }
  };
  specialMarkings: string[];
  handComparison?: string;
  futureInsights: string;
  personalizedAdvice: string;
  luckyElements?: {
    colors: string[];
    numbers: number[];
    days: string[];
  };
}

interface ShareableCardsViewProps {
  analysis: PalmReadingAnalysis;
  userName: string;
  onClose: () => void;
}

export const ShareableCardsView: React.FC<ShareableCardsViewProps> = ({ 
  analysis, 
  userName, 
  onClose 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const cardRefs = useRef<{ [key: number]: any }>({});

  // Create all shareable cards data
  const createCardsData = () => {
    const cards = [];

    // Overall Personality Card
    cards.push({
      type: 'overall' as const,
      title: 'Your Mystical Essence',
      subtitle: 'Overall Personality',
      description: analysis.overallPersonality,
      meaning: 'This reveals your core spiritual energy and life path vibration',
      icon: '🌟',
      colors: ['#1A1B23', '#059669', '#10B981']
    });

    // Line Cards
    const lineEmojis = {
      lifeLine: '💫',
      heartLine: '💕', 
      headLine: '🧠',
      marriageLine: '💍',
      fateLine: '🚀',
      successLine: '👑',
      travelLine: '✈️'
    };

    Object.entries(analysis.lines || {}).forEach(([key, line]) => {
      cards.push({
        type: 'line' as const,
        title: line.name,
        subtitle: 'Palm Line Reading',
        description: line.description,
        meaning: line.meaning,
        insight: line.personalizedInsight,
        icon: lineEmojis[key as keyof typeof lineEmojis] || '✨',
        colors: ['#1A1B23', '#2D1B69', '#8B5CF6']
      });
    });

    // Mount Cards
    const mountEmojis = {
      mars: '⚔️',
      jupiter: '👑',
      saturn: '📚',
      sun: '🎨',
      mercury: '💬',
      moon: '🌙',
      venus: '💖'
    };

    Object.entries(analysis.mounts || {}).forEach(([key, mount]) => {
      cards.push({
        type: 'mount' as const,
        title: mount.name,
        subtitle: 'Palm Mount Analysis',
        description: `Prominence: ${mount.prominence}`,
        meaning: mount.meaning,
        icon: mountEmojis[key as keyof typeof mountEmojis] || '🏔️',
        colors: ['#1A1B23', '#D97706', '#F59E0B']
      });
    });

    // Lucky Elements Card
    if (analysis.luckyElements) {
      cards.push({
        type: 'lucky' as const,
        title: 'Your Lucky Elements',
        subtitle: 'Cosmic Alignments',
        description: `Colors: ${analysis.luckyElements.colors?.join(', ')}`,
        meaning: `Numbers: ${analysis.luckyElements.numbers?.join(', ')} • Days: ${analysis.luckyElements.days?.join(', ')}`,
        icon: '🍀',
        colors: ['#1A1B23', '#DC2626', '#EF4444']
      });
    }

    // Future Insights Card
    cards.push({
      type: 'overall' as const,
      title: 'Future Insights',
      subtitle: 'What\'s Coming Next',
      description: analysis.futureInsights,
      meaning: 'The universe has revealed these glimpses of your path ahead',
      icon: '🔮',
      colors: ['#1A1B23', '#7C3AED', '#A855F7']
    });

    return cards;
  };

  const cards = createCardsData();

  const handleScreenshot = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permission to save cards');
        return;
      }

      const currentCard = cardRefs.current[currentCardIndex];
      if (!currentCard) {
        Alert.alert('Error', 'Card not ready for capture');
        return;
      }

      // Capture the card
      const uri = await captureRef(currentCard, {
        format: 'png',
        quality: 1,
      });

      // Save to photo library
      await MediaLibrary.saveToLibraryAsync(uri);
      
      Alert.alert(
        'Saved! ✨', 
        'Your mystical card has been saved to your photos! Ready to share your vibes? 📸',
        [
          { text: 'Share Now', onPress: () => handleShare() },
          { text: 'Done', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const currentCard = cards[currentCardIndex];
      await Share.share({
        message: `✨ Check out my ${currentCard.title} reading from Zodia Palm Reading! The universe has spoken... 🔮✋ #PalmReading #Mystical #ZodiaApp`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1B23', '#2D1B69']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shareable Cards</Text>
        <TouchableOpacity onPress={handleScreenshot} style={styles.saveButton}>
          <Ionicons name="download" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Card Counter */}
      <View style={styles.cardCounter}>
        <Text style={styles.counterText}>
          {currentCardIndex + 1} of {cards.length}
        </Text>
      </View>

      {/* Cards Container */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          ref={(ref: View) => {
            if (ref) {
              cardRefs.current[currentCardIndex] = ref;
            }
          }}
          style={styles.cardContainer}
        >
          <ShareableTarotCard
            {...cards[currentCardIndex]}
            userName={userName}
          />
        </View>
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.navigationControls}>
        <TouchableOpacity
          onPress={prevCard}
          style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
          disabled={currentCardIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentCardIndex === 0 ? '#666' : 'white'} 
          />
          <Text style={[styles.navButtonText, currentCardIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share" size={20} color="white" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextCard}
          style={[styles.navButton, currentCardIndex === cards.length - 1 && styles.navButtonDisabled]}
          disabled={currentCardIndex === cards.length - 1}
        >
          <Text style={[styles.navButtonText, currentCardIndex === cards.length - 1 && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={currentCardIndex === cards.length - 1 ? '#666' : 'white'} 
          />
        </TouchableOpacity>
      </View>

      {/* Card Preview Dots */}
      <View style={styles.dotsContainer}>
        {cards.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentCardIndex(index)}
            style={[
              styles.dot,
              index === currentCardIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    padding: 8,
  },
  cardCounter: {
    alignItems: 'center',
    marginBottom: 10,
  },
  counterText: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    alignItems: 'center',
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 5,
  },
  navButtonTextDisabled: {
    color: '#666',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#A855F7',
    width: 20,
  },
});