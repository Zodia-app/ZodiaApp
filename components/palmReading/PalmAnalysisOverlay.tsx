import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface PalmAnalysisOverlayProps {
  isVisible: boolean;
  hand: 'left' | 'right';
  onAnimationComplete: () => void;
}

interface PalmFeature {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: 'line' | 'mount';
  color: string;
  delay: number;
}

export const PalmAnalysisOverlay: React.FC<PalmAnalysisOverlayProps> = ({
  isVisible,
  hand,
  onAnimationComplete,
}) => {
  const [animations] = useState(new Map<string, Animated.Value>());
  const [labelAnimations] = useState(new Map<string, Animated.Value>());
  const [scanAnimation] = useState(new Animated.Value(0));

  // Palm features with realistic positioning
  const palmFeatures: PalmFeature[] = hand === 'left' ? [
    // Lines
    { id: 'lifeLine', name: 'Life Line', x: 25, y: 45, type: 'line', color: '#ff6b6b', delay: 0 },
    { id: 'heartLine', name: 'Heart Line', x: 20, y: 25, type: 'line', color: '#ff8cc8', delay: 200 },
    { id: 'headLine', name: 'Head Line', x: 30, y: 35, type: 'line', color: '#4ecdc4', delay: 400 },
    { id: 'fateLine', name: 'Fate Line', x: 50, y: 70, type: 'line', color: '#45b7d1', delay: 600 },
    
    // Mounts
    { id: 'mountJupiter', name: 'Mount of Jupiter', x: 35, y: 15, type: 'mount', color: '#96ceb4', delay: 800 },
    { id: 'mountSaturn', name: 'Mount of Saturn', x: 50, y: 12, type: 'mount', color: '#feca57', delay: 1000 },
    { id: 'mountApollo', name: 'Mount of Apollo', x: 65, y: 15, type: 'mount', color: '#ff9ff3', delay: 1200 },
    { id: 'mountVenus', name: 'Mount of Venus', x: 15, y: 55, type: 'mount', color: '#54a0ff', delay: 1400 },
  ] : [
    // Right hand (mirrored positions)
    { id: 'lifeLine', name: 'Life Line', x: 75, y: 45, type: 'line', color: '#ff6b6b', delay: 0 },
    { id: 'heartLine', name: 'Heart Line', x: 80, y: 25, type: 'line', color: '#ff8cc8', delay: 200 },
    { id: 'headLine', name: 'Head Line', x: 70, y: 35, type: 'line', color: '#4ecdc4', delay: 400 },
    { id: 'fateLine', name: 'Fate Line', x: 50, y: 70, type: 'line', color: '#45b7d1', delay: 600 },
    
    // Mounts (mirrored)
    { id: 'mountJupiter', name: 'Mount of Jupiter', x: 65, y: 15, type: 'mount', color: '#96ceb4', delay: 800 },
    { id: 'mountSaturn', name: 'Mount of Saturn', x: 50, y: 12, type: 'mount', color: '#feca57', delay: 1000 },
    { id: 'mountApollo', name: 'Mount of Apollo', x: 35, y: 15, type: 'mount', color: '#ff9ff3', delay: 1200 },
    { id: 'mountVenus', name: 'Mount of Venus', x: 85, y: 55, type: 'mount', color: '#54a0ff', delay: 1400 },
  ];

  useEffect(() => {
    if (isVisible) {
      startAnalysisAnimation();
    } else {
      resetAnimations();
    }
  }, [isVisible]);

  const startAnalysisAnimation = () => {
    // Initialize all animations
    palmFeatures.forEach(feature => {
      if (!animations.has(feature.id)) {
        animations.set(feature.id, new Animated.Value(0));
      }
      if (!labelAnimations.has(feature.id)) {
        labelAnimations.set(feature.id, new Animated.Value(0));
      }
    });

    // Start scanning animation first
    Animated.timing(scanAnimation, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Animate each feature with staggered delays
    const animationPromises = palmFeatures.map(feature => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const pointAnim = animations.get(feature.id)!;
          const labelAnim = labelAnimations.get(feature.id)!;

          // Animate the detection point
          Animated.sequence([
            Animated.timing(pointAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            // Then animate the label
            Animated.timing(labelAnim, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start(() => resolve());
        }, feature.delay);
      });
    });

    // When all animations complete
    Promise.all(animationPromises).then(() => {
      setTimeout(() => {
        onAnimationComplete();
      }, 1000);
    });
  };

  const resetAnimations = () => {
    animations.forEach(anim => anim.setValue(0));
    labelAnimations.forEach(anim => anim.setValue(0));
    scanAnimation.setValue(0);
  };

  if (!isVisible) return null;

  const imageHeight = (screenWidth - 40) * 1.2;

  return (
    <View style={[styles.overlay, { height: imageHeight }]}>
      {/* Scanning effect */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{
              translateY: scanAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, imageHeight],
              }),
            }],
            opacity: scanAnimation.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      />

      {/* Detection points and labels */}
      {palmFeatures.map(feature => {
        const pointAnim = animations.get(feature.id);
        const labelAnim = labelAnimations.get(feature.id);
        
        if (!pointAnim || !labelAnim) return null;

        const isRightSide = feature.x > 50;

        return (
          <View key={feature.id}>
            {/* Detection Point */}
            <Animated.View
              style={[
                styles.detectionPoint,
                {
                  left: `${feature.x}%`,
                  top: `${feature.y}%`,
                  backgroundColor: feature.color,
                  transform: [
                    { 
                      scale: pointAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.3, 1],
                      })
                    }
                  ],
                  opacity: pointAnim,
                },
              ]}
            >
              <View style={[styles.innerPoint, { backgroundColor: feature.color }]} />
              
              {/* Pulse rings */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    borderColor: feature.color,
                    transform: [
                      {
                        scale: pointAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 2],
                        })
                      }
                    ],
                    opacity: pointAnim.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 0.8, 0],
                    }),
                  },
                ]}
              />
            </Animated.View>

            {/* Feature Label */}
            <Animated.View
              style={[
                styles.featureLabel,
                {
                  left: isRightSide ? `${feature.x - 25}%` : `${feature.x + 5}%`,
                  top: `${feature.y + 3}%`,
                  transform: [
                    {
                      translateY: labelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }
                  ],
                  opacity: labelAnim,
                },
                isRightSide && styles.labelRight,
              ]}
            >
              <View style={[styles.labelContainer, { borderLeftColor: feature.color }]}>
                <Text style={styles.labelText}>{feature.name}</Text>
                <View style={[styles.labelIcon, { backgroundColor: feature.color }]}>
                  <Text style={styles.labelIconText}>
                    {feature.type === 'line' ? '━' : '●'}
                  </Text>
                </View>
              </View>
              
              {/* Connecting line to point */}
              <View 
                style={[
                  styles.connector,
                  { backgroundColor: feature.color },
                  isRightSide && styles.connectorRight,
                ]}
              />
            </Animated.View>
          </View>
        );
      })}

      {/* Analysis completion indicator */}
      <Animated.View
        style={[
          styles.completionBadge,
          {
            opacity: scanAnimation.interpolate({
              inputRange: [0.8, 1],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [{
              scale: scanAnimation.interpolate({
                inputRange: [0.8, 1],
                outputRange: [0.8, 1],
                extrapolate: 'clamp',
              })
            }]
          },
        ]}
      >
        <Text style={styles.completionText}>✨ Analysis Complete</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  detectionPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    marginTop: -8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  innerPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  pulseRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginLeft: -15,
    marginTop: -15,
  },
  featureLabel: {
    position: 'absolute',
    minWidth: 120,
    zIndex: 10,
  },
  labelRight: {
    alignItems: 'flex-end',
  },
  labelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 6,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  labelIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  labelIconText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  connector: {
    position: 'absolute',
    width: 2,
    height: 15,
    top: -15,
    left: 8,
  },
  connectorRight: {
    right: 8,
    left: 'auto',
  },
  completionBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});