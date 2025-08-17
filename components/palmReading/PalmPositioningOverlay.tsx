import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PalmPositioningOverlayProps {
  handType: 'left' | 'right';
  isVisible?: boolean;
}

export const PalmPositioningOverlay: React.FC<PalmPositioningOverlayProps> = ({ 
  handType, 
  isVisible = true 
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in the overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Simple rectangular outline for palm positioning
  const handPath = "M50 100 L250 100 L250 400 L50 400 Z";

  const overlayWidth = screenWidth * 0.8;
  const overlayHeight = screenHeight * 0.65;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }]
        }
      ]}
      pointerEvents="none"
    >
      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>
          Position your {handType} palm
        </Text>
        <Text style={styles.instructionSubtitle}>
          Position your palm within the rectangle below
        </Text>
      </View>

      {/* Hand Outline */}
      <View style={styles.handContainer}>
        <Svg 
          width={overlayWidth} 
          height={overlayHeight} 
          viewBox="0 0 300 500"
          style={styles.handOutline}
        >
          <Defs>
            <SvgLinearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#A855F7" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#C084FC" stopOpacity="0.4" />
            </SvgLinearGradient>
            <SvgLinearGradient id="handStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#FCD34D" stopOpacity="0.8" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={handPath}
            stroke="url(#handStroke)"
            strokeWidth="3"
            fill="url(#handGradient)"
            strokeDasharray="15,8"
          />
        </Svg>

        {/* Pulsing center indicator */}
        <Animated.View
          style={[
            styles.centerIndicator,
            {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  })
                }
              ],
              opacity: pulseAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.6, 1, 0.6],
              }),
            }
          ]}
        >
          <View style={styles.centerDot} />
          <View style={styles.centerRing} />
        </Animated.View>

        {/* Positioning guides */}
        <View style={[styles.positionGuide, styles.topGuide]}>
          <View style={styles.guideDot} />
          <Text style={styles.guideText}>Fingers</Text>
        </View>
        
        <View style={[styles.positionGuide, styles.centerGuide]}>
          <View style={styles.guideDot} />
          <Text style={styles.guideText}>Palm Center</Text>
        </View>
        
        <View style={[styles.positionGuide, styles.bottomGuide]}>
          <View style={styles.guideDot} />
          <Text style={styles.guideText}>Wrist</Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>Keep palm flat and open</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>📏</Text>
          <Text style={styles.tipText}>Fill the outline completely</Text>
        </View>
        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>☀️</Text>
          <Text style={styles.tipText}>Ensure good lighting</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  handContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handOutline: {
    opacity: 0.9,
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  centerRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FCD34D',
    opacity: 0.6,
  },
  positionGuide: {
    position: 'absolute',
    alignItems: 'center',
  },
  topGuide: {
    top: '20%',
    left: '50%',
    marginLeft: -30,
  },
  centerGuide: {
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -15,
  },
  bottomGuide: {
    bottom: '20%',
    left: '50%',
    marginLeft: -25,
  },
  guideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    marginBottom: 4,
  },
  guideText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
  },
  tipsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});