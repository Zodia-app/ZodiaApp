import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ShareableCompatibilityCardProps {
  user1Name: string;
  user2Name: string;
  user1Sign: string;
  user2Sign: string;
  score: number;
  topStrength: string;
}

export const ShareableCompatibilityCard = React.forwardRef<View, ShareableCompatibilityCardProps>(
  ({ user1Name, user2Name, user1Sign, user2Sign, score, topStrength }, ref) => {
    
    const getZodiacIcon = (sign: string) => {
      const zodiacIcons: { [key: string]: string } = {
        'Aries': 'zodiac-aries',
        'Taurus': 'zodiac-taurus',
        'Gemini': 'zodiac-gemini',
        'Cancer': 'zodiac-cancer',
        'Leo': 'zodiac-leo',
        'Virgo': 'zodiac-virgo',
        'Libra': 'zodiac-libra',
        'Scorpio': 'zodiac-scorpio',
        'Sagittarius': 'zodiac-sagittarius',
        'Capricorn': 'zodiac-capricorn',
        'Aquarius': 'zodiac-aquarius',
        'Pisces': 'zodiac-pisces',
      };
      return zodiacIcons[sign] || 'star';
    };
    
    const getScoreColor = () => {
      if (score >= 80) return ['#4CAF50', '#66BB6A'];
      if (score >= 60) return ['#FFA726', '#FFB74D'];
      return ['#EF5350', '#E57373'];
    };
    
    return (
      <View ref={ref} style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>ZODIA</Text>
            <Text style={styles.subtitle}>Cosmic Compatibility Report</Text>
          </View>
          
          {/* Zodiac Signs */}
          <View style={styles.zodiacContainer}>
            <View style={styles.zodiacItem}>
              <MaterialCommunityIcons 
                name={getZodiacIcon(user1Sign)} 
                size={60} 
                color="#fff" 
              />
              <Text style={styles.userName}>{user1Name}</Text>
              <Text style={styles.signName}>{user1Sign}</Text>
            </View>
            
            <View style={styles.heartContainer}>
              <MaterialCommunityIcons name="heart" size={40} color="#E91E63" />
            </View>
            
            <View style={styles.zodiacItem}>
              <MaterialCommunityIcons 
                name={getZodiacIcon(user2Sign)} 
                size={60} 
                color="#fff" 
              />
              <Text style={styles.userName}>{user2Name}</Text>
              <Text style={styles.signName}>{user2Sign}</Text>
            </View>
          </View>
          
          {/* Score */}
          <LinearGradient
            colors={getScoreColor()}
            style={styles.scoreContainer}
          >
            <Text style={styles.scoreText}>{score}%</Text>
            <Text style={styles.scoreLabel}>Compatibility</Text>
          </LinearGradient>
          
          {/* Top Strength */}
          <View style={styles.strengthContainer}>
            <Text style={styles.strengthLabel}>Top Strength</Text>
            <Text style={styles.strengthText}>{topStrength}</Text>
          </View>
          
          {/* QR Code and Download */}
          <View style={styles.footer}>
            <View style={styles.qrContainer}>
              <QRCode
                value="https://zodia.app/download"
                size={80}
                backgroundColor="transparent"
                color="#fff"
              />
            </View>
            <View style={styles.downloadInfo}>
              <Text style={styles.downloadText}>Scan to download</Text>
              <Text style={styles.appNameSmall}>ZODIA</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: -9999,
    width: 1080,
    height: 1920,
  },
  card: {
    flex: 1,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 28,
    color: '#B794F4',
    marginTop: 10,
  },
  zodiacContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 60,
  },
  zodiacItem: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  userName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  signName: {
    fontSize: 24,
    color: '#9CA3AF',
    marginTop: 5,
  },
  heartContainer: {
    paddingHorizontal: 30,
  },
  scoreContainer: {
    paddingHorizontal: 80,
    paddingVertical: 40,
    borderRadius: 30,
    marginVertical: 40,
  },
  scoreText: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  strengthContainer: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: 60,
    paddingVertical: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.4)',
    marginVertical: 40,
    maxWidth: '90%',
  },
  strengthLabel: {
    fontSize: 24,
    color: '#B794F4',
    textAlign: 'center',
    marginBottom: 10,
  },
  strengthText: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
  },
  qrContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 20,
    marginRight: 30,
  },
  downloadInfo: {
    alignItems: 'flex-start',
  },
  downloadText: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  appNameSmall: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    marginTop: 5,
  },
});

export default ShareableCompatibilityCard;