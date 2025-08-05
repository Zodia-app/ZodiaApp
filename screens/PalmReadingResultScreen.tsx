import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PalmReadingResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { images } = route.params || { images: [] };
  
  const [isLoading, setIsLoading] = useState(true);
  const [readingResult, setReadingResult] = useState<any>(null);

  useEffect(() => {
    // Simulate API call to get palm reading
    setTimeout(() => {
      setReadingResult({
        summary: "Your palms reveal a fascinating journey ahead",
        lifeLine: "Strong and deep, indicating vitality and enthusiasm for life",
        heartLine: "Curved and clear, showing emotional depth and capacity for love",
        headLine: "Well-defined, representing clear thinking and good decision-making",
        fateLine: "Prominent, suggesting significant life events and achievements ahead",
      });
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBackToDashboard = () => {
    navigation.navigate('MainTabs');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Analyzing your palms...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Palm Reading</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Preview */}
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <View style={styles.mockImage}>
              <Ionicons name="hand-left" size={40} color="#8B5CF6" />
            </View>
            <Text style={styles.imageLabel}>Left Palm</Text>
          </View>
          <View style={styles.imageWrapper}>
            <View style={styles.mockImage}>
              <Ionicons name="hand-right" size={40} color="#8B5CF6" />
            </View>
            <Text style={styles.imageLabel}>Right Palm</Text>
          </View>
        </View>

        {/* Reading Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Reading Summary</Text>
          <Text style={styles.summaryText}>{readingResult.summary}</Text>
        </View>

        {/* Detailed Reading */}
        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Life Line</Text>
          <Text style={styles.sectionText}>{readingResult.lifeLine}</Text>
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Heart Line</Text>
          <Text style={styles.sectionText}>{readingResult.heartLine}</Text>
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Head Line</Text>
          <Text style={styles.sectionText}>{readingResult.headLine}</Text>
        </View>

        <View style={styles.readingSection}>
          <Text style={styles.sectionTitle}>Fate Line</Text>
          <Text style={styles.sectionText}>{readingResult.fateLine}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton}>
            <Ionicons name="bookmark-outline" size={20} color="#8B5CF6" />
            <Text style={styles.saveButtonText}>Save Reading</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.dashboardButton} 
          onPress={handleBackToDashboard}
        >
          <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  mockImage: {
    width: 100,
    height: 100,
    backgroundColor: '#1E293B',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  summaryTitle: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
  },
  readingSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 20,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    gap: 8,
  },
  saveButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dashboardButton: {
    backgroundColor: '#475569',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PalmReadingResultScreen;
