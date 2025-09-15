import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GenZPalmCompatibilityMeter from '../../components/GenZPalmCompatibilityMeter';

interface GenZCompatibilityScreenProps {
  navigation: any;
  route?: {
    params?: {
      userPalmReading?: any;
      partnerPalmReading?: any;
      compatibilityScore?: number;
      userName?: string;
      partnerName?: string;
    };
  };
}

export default function GenZCompatibilityScreen({ 
  navigation, 
  route 
}: GenZCompatibilityScreenProps) {
  const [compatibilityData, setCompatibilityData] = useState({
    userPalmReading: route?.params?.userPalmReading || null,
    partnerPalmReading: route?.params?.partnerPalmReading || null,
    compatibilityScore: route?.params?.compatibilityScore || Math.floor(Math.random() * 100) + 1,
    userName: route?.params?.userName || "You",
    partnerName: route?.params?.partnerName || "Your Crush",
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, []);

  const handleShare = () => {
    Alert.alert(
      'Share your vibe check! ✨',
      'Your compatibility result is about to be shared. Get ready for the notifications bestie!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share anyway 💅', onPress: () => console.log('Sharing compatibility result...') }
      ]
    );
  };

  const handleRetry = () => {
    Alert.alert(
      'Try again? 👀',
      'Want to check compatibility with someone else or retry with different readings?',
      [
        { text: 'Stay here', style: 'cancel' },
        { 
          text: 'New reading fr', 
          onPress: () => {
            setCompatibilityData({
              ...compatibilityData,
              compatibilityScore: Math.floor(Math.random() * 100) + 1
            });
          }
        },
        { 
          text: 'Back to dashboard', 
          onPress: () => navigation.navigate('CompatibilityDashboard')
        }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2d2d2d']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Gen Z Vibe Check</Text>
            <Text style={styles.headerSubtitle}>Real compatibility, no cap 💯</Text>
          </View>
          
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Compatibility Meter */}
        <View style={styles.meterContainer}>
          <GenZPalmCompatibilityMeter
            userPalmReading={compatibilityData.userPalmReading}
            partnerPalmReading={compatibilityData.partnerPalmReading}
            compatibilityScore={compatibilityData.compatibilityScore}
            userName={compatibilityData.userName}
            partnerName={compatibilityData.partnerName}
            onShare={handleShare}
            onRetry={handleRetry}
          />
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.disclaimer}>
            ✨ Based on palm reading + astrology analysis ✨
          </Text>
          <Text style={styles.disclaimerSub}>
            Your cosmic compatibility reading powered by the stars and your palms fr
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  disclaimerSub: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 300,
  },
});