import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MysticalCameraViewProps {
  onCameraReady: (camera: CameraView) => void;
  currentHandType: 'left' | 'right';
  isCapturing?: boolean;
}

export const MysticalCameraView: React.FC<MysticalCameraViewProps> = ({ 
  onCameraReady, 
  currentHandType, 
  isCapturing = false 
}) => {
  const sparkleAnimations = useRef<Animated.Value[]>([]);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  // Initialize sparkle animations
  useEffect(() => {
    sparkleAnimations.current = Array.from({ length: 8 }, () => new Animated.Value(0));
  }, []);

  // Generate mystical particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 4 + 2,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sparkle animation loop
  useEffect(() => {
    const animateSparkles = () => {
      const animations = sparkleAnimations.current.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        )
      );

      Animated.parallel(animations).start();
    };

    animateSparkles();
  }, []);

  // Pulse animation for palm area
  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    pulse();
  }, []);

  // Shimmer effect
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Capturing effect
  useEffect(() => {
    if (isCapturing) {
      // Flash effect when capturing
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCapturing]);

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={styles.camera}
        facing="back"
        ref={onCameraReady}
      />
      
      {/* Mystical Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        
        {/* Constellation Pattern */}
        <Svg style={StyleSheet.absoluteFillObject} width={screenWidth} height={screenHeight}>
          <Defs>
            <RadialGradient id="starGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
            </RadialGradient>
          </Defs>
          
          {/* Constellation lines */}
          <Path
            d={`M${screenWidth * 0.2} ${screenHeight * 0.3} L${screenWidth * 0.4} ${screenHeight * 0.2} L${screenWidth * 0.6} ${screenHeight * 0.35} L${screenWidth * 0.8} ${screenHeight * 0.25}`}
            stroke="#A855F7"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <Path
            d={`M${screenWidth * 0.1} ${screenHeight * 0.7} L${screenWidth * 0.3} ${screenHeight * 0.8} L${screenWidth * 0.7} ${screenHeight * 0.75} L${screenWidth * 0.9} ${screenHeight * 0.65}`}
            stroke="#C084FC"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          
          {/* Constellation stars */}
          {[
            { x: screenWidth * 0.2, y: screenHeight * 0.3 },
            { x: screenWidth * 0.4, y: screenHeight * 0.2 },
            { x: screenWidth * 0.6, y: screenHeight * 0.35 },
            { x: screenWidth * 0.8, y: screenHeight * 0.25 },
            { x: screenWidth * 0.1, y: screenHeight * 0.7 },
            { x: screenWidth * 0.3, y: screenHeight * 0.8 },
            { x: screenWidth * 0.7, y: screenHeight * 0.75 },
            { x: screenWidth * 0.9, y: screenHeight * 0.65 },
          ].map((star, index) => (
            <Circle
              key={index}
              cx={star.x}
              cy={star.y}
              r="2"
              fill="url(#starGradient)"
              opacity="0.7"
            />
          ))}
        </Svg>

        {/* Floating Particles */}
        {particles.map((particle, index) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                opacity: sparkleAnimations.current[index % sparkleAnimations.current.length],
                transform: [
                  {
                    scale: sparkleAnimations.current[index % sparkleAnimations.current.length],
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Mystical Palm Area Highlight */}
        <Animated.View
          style={[
            styles.palmHighlight,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(168, 85, 247, 0.2)', 'rgba(192, 132, 252, 0.1)']}
            style={styles.palmGradient}
          />
        </Animated.View>

        {/* Shimmer Effect */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [
                {
                  translateX: shimmerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-screenWidth, screenWidth],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Instagram-style text overlay */}
        <View style={styles.textOverlay}>
          <Text style={styles.mysticalText}>
            ✨ Hold your {currentHandType} palm steady ✨
          </Text>
          <Text style={styles.subText}>
            The universe is reading your energy...
          </Text>
        </View>

        {/* Capture Flash Overlay */}
        {isCapturing && (
          <View style={styles.flashOverlay}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'rgba(139, 92, 246, 0.6)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  palmHighlight: {
    position: 'absolute',
    top: screenHeight * 0.35,
    left: screenWidth * 0.2,
    width: screenWidth * 0.6,
    height: screenHeight * 0.3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  palmGradient: {
    flex: 1,
    borderRadius: 18,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  textOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mysticalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
});