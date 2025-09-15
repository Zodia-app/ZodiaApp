import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Share,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface GenZCompatibilityLevel {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  gradient: string[];
  vibe: string;
}

const COMPATIBILITY_LEVELS: GenZCompatibilityLevel[] = [
  {
    id: 1,
    title: "TOXIC ☠️",
    subtitle: "RUN bestie",
    emoji: "☠️",
    minScore: 0,
    maxScore: 12,
    gradient: ['#ff0000', '#8b0000'],
    vibe: "For those relationships that are straight-up dangerous fr"
  },
  {
    id: 2,
    title: "NAH FAM 🚫",
    subtitle: "Not it chief",
    emoji: "🚫",
    minScore: 13,
    maxScore: 25,
    gradient: ['#ff4444', '#cc0000'],
    vibe: "When the vibes are completely off bestie"
  },
  {
    id: 3,
    title: "MEH ENERGY 😐",
    subtitle: "Could be worse",
    emoji: "😐",
    minScore: 26,
    maxScore: 37,
    gradient: ['#ffa500', '#ff8c00'],
    vibe: "The lukewarm 'it's complicated' zone"
  },
  {
    id: 4,
    title: "LOWKEY CUTE 🥺",
    subtitle: "Some potential",
    emoji: "🥺",
    minScore: 38,
    maxScore: 50,
    gradient: ['#ffb347', '#ffa500'],
    vibe: "When there's a spark worth exploring ngl"
  },
  {
    id: 5,
    title: "GOOD VIBES ✨",
    subtitle: "We see you",
    emoji: "✨",
    minScore: 51,
    maxScore: 62,
    gradient: ['#90ee90', '#32cd32'],
    vibe: "Actually sweet compatibility, no cap"
  },
  {
    id: 6,
    title: "MAIN CHARACTER ENERGY 👑",
    subtitle: "Power couple alert",
    emoji: "👑",
    minScore: 63,
    maxScore: 75,
    gradient: ['#9370db', '#8a2be2'],
    vibe: "Giving serious relationship goals fr fr"
  },
  {
    id: 7,
    title: "SOULMATE STATUS 💕",
    subtitle: "It's giving forever",
    emoji: "💕",
    minScore: 76,
    maxScore: 87,
    gradient: ['#ff69b4', '#ff1493'],
    vibe: "The stars have aligned bestie ✨"
  },
  {
    id: 8,
    title: "MAKE BABIES 👶",
    subtitle: "ICONIC couple",
    emoji: "👶",
    minScore: 88,
    maxScore: 100,
    gradient: ['#ffd700', '#ffb347'],
    vibe: "Ultimate destiny-level compatibility, periodt"
  }
];

interface GenZPalmCompatibilityMeterProps {
  userPalmReading?: any;
  partnerPalmReading?: any;
  compatibilityScore: number;
  userName?: string;
  partnerName?: string;
  onShare?: () => void;
  onRetry?: () => void;
}

export default function GenZPalmCompatibilityMeter({
  userPalmReading,
  partnerPalmReading,
  compatibilityScore,
  userName = "You",
  partnerName = "Crush",
  onShare,
  onRetry
}: GenZPalmCompatibilityMeterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  const finalLevel = COMPATIBILITY_LEVELS.find(level => 
    compatibilityScore >= level.minScore && compatibilityScore <= level.maxScore
  ) || COMPATIBILITY_LEVELS[4];

  useEffect(() => {
    if (isRevealing) {
      const timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= finalLevel.id - 1) {
            clearInterval(timer);
            setTimeout(() => setShowFinalResult(true), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(timer);
    }
  }, [isRevealing, finalLevel.id]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (isRevealing) {
      pulse.start();
    }
    
    return () => pulse.stop();
  }, [isRevealing, pulseAnim]);

  useEffect(() => {
    if (showFinalResult) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showFinalResult, scaleAnim, opacityAnim]);

  const startReading = () => {
    setIsRevealing(true);
  };

  const handleShare = async () => {
    const shareContent = {
      message: `OMG just got my palm reading compatibility! ${finalLevel.title} ${finalLevel.emoji}\n\n"${finalLevel.vibe}"\n\nTry it yourself! 👀✨`,
      url: 'https://zodiaapp.com',
    };

    try {
      await Share.share(shareContent);
      onShare?.();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderAvatar = (name: string, isUser: boolean) => (
    <View style={styles.avatarContainer}>
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.partnerAvatar]}>
        <Text style={styles.avatarEmoji}>{isUser ? '👤' : '💕'}</Text>
      </View>
      <Text style={styles.avatarName}>{name}</Text>
    </View>
  );

  const renderCompatibilityScale = () => (
    <View style={styles.scaleContainer}>
      {COMPATIBILITY_LEVELS.map((level, index) => {
        const isActive = index <= currentStep;
        const isFinal = index === finalLevel.id - 1;
        
        return (
          <Animated.View
            key={level.id}
            style={[
              styles.scaleLevel,
              {
                transform: [{ scale: (isActive && isFinal && showFinalResult) ? scaleAnim : 1 }],
                opacity: isActive ? 1 : 0.3,
              }
            ]}
          >
            <LinearGradient
              colors={isActive ? level.gradient : ['#333', '#555']}
              style={styles.levelGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.levelEmoji}>{level.emoji}</Text>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
            </LinearGradient>
            
            {isActive && isFinal && showFinalResult && (
              <Animated.View
                style={[
                  styles.pulseEffect,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: opacityAnim,
                  }
                ]}
              >
                <LinearGradient
                  colors={[...level.gradient, 'transparent']}
                  style={styles.pulseGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );

  const renderFinalResult = () => (
    <Animated.View
      style={[
        styles.finalResultContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <LinearGradient
        colors={finalLevel.gradient}
        style={styles.finalResultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.finalEmoji}>{finalLevel.emoji}</Text>
        <Text style={styles.finalTitle}>{finalLevel.title}</Text>
        <Text style={styles.finalSubtitle}>{finalLevel.subtitle}</Text>
        <Text style={styles.finalVibe}>"{finalLevel.vibe}"</Text>
        <Text style={styles.finalScore}>{compatibilityScore}% Compatible</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.buttonText}>Share that tea ☕</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Try again bestie</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#0f0f0f', '#1a1a1a', '#2d2d2d']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {!showFinalResult ? (
        <>
          <Text style={styles.title}>Palm Reading Compatibility</Text>
          <Text style={styles.subtitle}>Let the stars spill the tea ✨</Text>
          
          <View style={styles.avatarRow}>
            {renderAvatar(userName, true)}
            <Animated.View style={[styles.heartContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.heartEmoji}>💖</Text>
            </Animated.View>
            {renderAvatar(partnerName, false)}
          </View>
          
          {!isRevealing ? (
            <TouchableOpacity style={styles.startButton} onPress={startReading}>
              <LinearGradient
                colors={['#ff69b4', '#ff1493']}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startButtonText}>Reveal the vibes ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            renderCompatibilityScale()
          )}
        </>
      ) : (
        renderFinalResult()
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    backgroundColor: '#4a90e2',
  },
  partnerAvatar: {
    backgroundColor: '#e24a90',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  avatarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartEmoji: {
    fontSize: 40,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scaleContainer: {
    width: '100%',
    maxWidth: 300,
  },
  scaleLevel: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  levelGradient: {
    padding: 12,
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 12,
    color: '#eee',
    textAlign: 'center',
  },
  pulseEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  pulseGradient: {
    flex: 1,
    borderRadius: 12,
  },
  finalResultContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  finalResultGradient: {
    padding: 30,
    alignItems: 'center',
  },
  finalEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  finalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  finalSubtitle: {
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
    marginBottom: 16,
  },
  finalVibe: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  finalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});