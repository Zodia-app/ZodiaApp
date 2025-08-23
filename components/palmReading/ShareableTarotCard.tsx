import React from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Classic tarot card ratio

interface ShareableTarotCardProps {
  type: 'line' | 'mount' | 'overall' | 'lucky';
  title: string;
  subtitle?: string;
  description: string;
  meaning: string;
  insight?: string;
  userName: string;
  cardStyle?: ViewStyle;
  colors?: string[];
  icon?: string;
}

export const ShareableTarotCard: React.FC<ShareableTarotCardProps> = ({
  type,
  title,
  subtitle,
  description,
  meaning,
  insight,
  userName,
  cardStyle,
  colors = ['#1A1B23', '#2D1B69', '#8B5CF6'],
  icon = '✨'
}) => {
  
  const getCardDesign = () => {
    switch (type) {
      case 'line':
        return {
          borderColor: '#C084FC',
          accentColor: '#A855F7',
          iconBg: 'rgba(192, 132, 252, 0.2)',
          pattern: 'lines'
        };
      case 'mount':
        return {
          borderColor: '#F59E0B',
          accentColor: '#D97706',
          iconBg: 'rgba(245, 158, 11, 0.2)',
          pattern: 'mountains'
        };
      case 'overall':
        return {
          borderColor: '#10B981',
          accentColor: '#059669',
          iconBg: 'rgba(16, 185, 129, 0.2)',
          pattern: 'stars'
        };
      case 'lucky':
        return {
          borderColor: '#EF4444',
          accentColor: '#DC2626',
          iconBg: 'rgba(239, 68, 68, 0.2)',
          pattern: 'gems'
        };
      default:
        return {
          borderColor: '#8B5CF6',
          accentColor: '#7C3AED',
          iconBg: 'rgba(139, 92, 246, 0.2)',
          pattern: 'default'
        };
    }
  };

  const design = getCardDesign();

  const renderPattern = () => {
    switch (design.pattern) {
      case 'lines':
        return (
          <Svg style={styles.patternSvg} width={CARD_WIDTH} height={CARD_HEIGHT}>
            <Defs>
              <RadialGradient id="lineGradient" cx="50%" cy="50%" r="70%">
                <Stop offset="0%" stopColor={design.accentColor} stopOpacity="0.1" />
                <Stop offset="100%" stopColor={design.accentColor} stopOpacity="0.05" />
              </RadialGradient>
            </Defs>
            {Array.from({ length: 5 }, (_, i) => (
              <Path
                key={i}
                d={`M${CARD_WIDTH * 0.1} ${CARD_HEIGHT * (0.2 + i * 0.15)} Q${CARD_WIDTH * 0.5} ${CARD_HEIGHT * (0.15 + i * 0.15)} ${CARD_WIDTH * 0.9} ${CARD_HEIGHT * (0.2 + i * 0.15)}`}
                stroke="url(#lineGradient)"
                strokeWidth="1.5"
                fill="none"
              />
            ))}
          </Svg>
        );
      case 'mountains':
        return (
          <Svg style={styles.patternSvg} width={CARD_WIDTH} height={CARD_HEIGHT}>
            {Array.from({ length: 3 }, (_, i) => (
              <Path
                key={i}
                d={`M${CARD_WIDTH * (0.1 + i * 0.25)} ${CARD_HEIGHT * 0.8} L${CARD_WIDTH * (0.2 + i * 0.25)} ${CARD_HEIGHT * 0.6} L${CARD_WIDTH * (0.3 + i * 0.25)} ${CARD_HEIGHT * 0.8} Z`}
                fill={design.accentColor}
                fillOpacity="0.1"
              />
            ))}
          </Svg>
        );
      case 'stars':
        return (
          <Svg style={styles.patternSvg} width={CARD_WIDTH} height={CARD_HEIGHT}>
            {Array.from({ length: 8 }, (_, i) => (
              <Circle
                key={i}
                cx={CARD_WIDTH * (0.2 + (i % 3) * 0.3)}
                cy={CARD_HEIGHT * (0.2 + Math.floor(i / 3) * 0.2)}
                r="1.5"
                fill={design.accentColor}
                fillOpacity="0.3"
              />
            ))}
          </Svg>
        );
      case 'gems':
        return (
          <Svg style={styles.patternSvg} width={CARD_WIDTH} height={CARD_HEIGHT}>
            {Array.from({ length: 4 }, (_, i) => (
              <Path
                key={i}
                d={`M${CARD_WIDTH * (0.15 + i * 0.2)} ${CARD_HEIGHT * 0.3} L${CARD_WIDTH * (0.2 + i * 0.2)} ${CARD_HEIGHT * 0.2} L${CARD_WIDTH * (0.25 + i * 0.2)} ${CARD_HEIGHT * 0.3} L${CARD_WIDTH * (0.2 + i * 0.2)} ${CARD_HEIGHT * 0.4} Z`}
                fill={design.accentColor}
                fillOpacity="0.15"
              />
            ))}
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.cardContainer, cardStyle]}>
      <LinearGradient
        colors={colors.length >= 2 ? [colors[0], colors[1], ...colors.slice(2)] as const : ['#1A1B23', '#2D1B69'] as const}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Border */}
        <View style={[styles.border, { borderColor: design.borderColor }]} />
        
        {/* Pattern Overlay */}
        {renderPattern()}
        
        {/* Card Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: design.iconBg }]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Reading</Text>
              <Text style={styles.description}>{description}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meaning</Text>
              <Text style={styles.meaning}>{meaning}</Text>
            </View>

            {insight && (
              <>
                <View style={styles.divider} />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personal Insight</Text>
                  <Text style={styles.insight}>{insight}</Text>
                </View>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.appName}>Zodia Palm Reading</Text>
          </View>
        </View>

        {/* Corner Decorations */}
        <View style={[styles.cornerDecoration, styles.topLeft]} />
        <View style={[styles.cornerDecoration, styles.topRight]} />
        <View style={[styles.cornerDecoration, styles.bottomLeft]} />
        <View style={[styles.cornerDecoration, styles.bottomRight]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  border: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'solid',
  },
  patternSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A855F7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#F3F4F6',
    lineHeight: 22,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 20,
    textAlign: 'center',
  },
  insight: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
    alignSelf: 'center',
    width: '60%',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  appName: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
});