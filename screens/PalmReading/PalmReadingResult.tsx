import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { analyzePalmReading, PalmReadingAnalysis } from '../../services/palmReading/palmAnalysisService';

export const PalmReadingResult: React.FC<any> = ({ navigation, route }) => {
  const { readingData } = route.params || {};
  const { userData, palmData } = readingData || {};
  const [analysis, setAnalysis] = useState<PalmReadingAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const result = await analyzePalmReading(userData, palmData);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing palm:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={styles.loadingText}>Analyzing your palm lines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Detailed Palm Analysis</Text>
        <Text style={styles.greeting}>Hello {userData?.name},</Text>
        
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>{analysis.overallPersonality}</Text>
        </View>

        <Text style={styles.sectionTitle}>📏 Major Lines Analysis</Text>
        
        {Object.values(analysis.lines).map((line, index) => line && (
          <View key={index} style={styles.lineCard}>
            <Text style={styles.lineName}>{line.name}</Text>
            <Text style={styles.lineDescription}>{line.description}</Text>
            <Text style={styles.lineMeaning}>{line.meaning}</Text>
            <View style={styles.insightBox}>
              <Text style={styles.insightLabel}>Personal Insight:</Text>
              <Text style={styles.insightText}>{line.personalizedInsight}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>🏔️ Mounts Analysis</Text>
        
        {Object.values(analysis.mounts).map((mount, index) => (
          <View key={index} style={styles.mountCard}>
            <View style={styles.mountHeader}>
              <Text style={styles.mountName}>{mount.name}</Text>
              <Text style={styles.mountProminence}>
                Prominence: {mount.prominence}
              </Text>
            </View>
            <Text style={styles.mountMeaning}>{mount.meaning}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>✨ Special Markings</Text>
        
        <View style={styles.markingsCard}>
          {analysis.specialMarkings.map((marking, index) => (
            <Text key={index} style={styles.marking}>• {marking}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🔮 Future Insights</Text>
        
        <View style={styles.futureCard}>
          <Text style={styles.futureText}>{analysis.futureInsights}</Text>
        </View>

        <Text style={styles.sectionTitle}>💡 Personalized Advice</Text>
        
        <View style={styles.adviceCard}>
          <Text style={styles.adviceText}>{analysis.personalizedAdvice}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('DashboardScreen')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#6B46C1',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  overviewText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 16,
  },
  lineCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 8,
  },
  lineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  lineMeaning: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 22,
  },
  insightBox: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B46C1',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  mountCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B46C1',
  },
  mountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mountProminence: {
    fontSize: 12,
    color: '#6B46C1',
    textTransform: 'uppercase',
  },
  mountMeaning: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20,
  },
  markingsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  marking: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  futureCard: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  futureText: {
    fontSize: 16,
    color: '#0369a1',
    lineHeight: 24,
  },
  adviceCard: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  adviceText: {
    fontSize: 16,
    color: '#92400e',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});