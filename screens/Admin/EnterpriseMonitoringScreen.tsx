// Enterprise Monitoring Dashboard - 10K+ Users
// Real-time monitoring and control for enterprise infrastructure

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { enterpriseService } from '../../services/enterpriseService';

interface MonitoringData {
  metrics: any;
  scaling: any;
  lastUpdated: number;
}

export const EnterpriseMonitoringScreen: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMonitoringData();
      }, 5000); // Refresh every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      const metrics = enterpriseService.getEnterpriseMetrics();
      const scaling = enterpriseService.getScalingRecommendations();
      
      setData({
        metrics,
        scaling,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackToggle = () => {
    if (fallbackMode) {
      enterpriseService.disableFallbackMode();
      Alert.alert('Fallback Disabled', 'Load-based routing restored');
    } else {
      enterpriseService.enableFallbackMode();
      Alert.alert('Fallback Enabled', 'All requests routed to enterprise services');
    }
    setFallbackMode(!fallbackMode);
  };

  const handleEmergencyShutdown = () => {
    Alert.alert(
      'Emergency Shutdown',
      'This will immediately stop all processing. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SHUTDOWN', 
          style: 'destructive',
          onPress: () => {
            enterpriseService.emergencyShutdown();
            Alert.alert('System Shutdown', 'Emergency shutdown initiated');
          }
        }
      ]
    );
  };

  const handleEmergencyRestart = () => {
    Alert.alert(
      'Emergency Restart',
      'This will restart all enterprise services. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'RESTART', 
          onPress: () => {
            enterpriseService.emergencyRestart();
            Alert.alert('System Restart', 'Enterprise services restarted');
          }
        }
      ]
    );
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'warning': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'green': return '#10B981';
      case 'yellow': return '#F59E0B';
      case 'red': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading || !data) {
    return (
      <LinearGradient colors={['#0F0F23', '#1A1B23', '#2D1B69']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Enterprise Dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const { metrics, scaling } = data;

  return (
    <LinearGradient colors={['#0F0F23', '#1A1B23', '#2D1B69']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMonitoringData}
            tintColor="white"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enterprise Dashboard</Text>
          <Text style={styles.subtitle}>10K+ Users Monitoring</Text>
        </View>

        {/* System Health Overview */}
        <View style={[styles.card, { borderLeftColor: getHealthColor(metrics.systemHealth) }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="pulse" size={24} color={getHealthColor(metrics.systemHealth)} />
            <Text style={styles.cardTitle}>System Health</Text>
          </View>
          
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Status</Text>
              <Text style={[styles.healthValue, { color: getHealthColor(metrics.systemHealth) }]}>
                {metrics.systemHealth.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Alert Level</Text>
              <Text style={[styles.healthValue, { color: getAlertColor(scaling.alertLevel) }]}>
                {scaling.alertLevel.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>Uptime</Text>
              <Text style={styles.healthValue}>
                {Math.round(metrics.uptime / 3600)}h
              </Text>
            </View>
          </View>
        </View>

        {/* User Metrics */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.cardTitle}>User Activity</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.activeUsers}</Text>
              <Text style={styles.metricLabel}>Active Users</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.palmReadingsToday}</Text>
              <Text style={styles.metricLabel}>Palm Readings Today</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{metrics.compatibilityAnalysesToday}</Text>
              <Text style={styles.metricLabel}>Compatibility Today</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{Math.round(metrics.averageResponseTime / 1000)}s</Text>
              <Text style={styles.metricLabel}>Avg Response Time</Text>
            </View>
          </View>
        </View>

        {/* Capacity Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer" size={24} color="#F59E0B" />
            <Text style={styles.cardTitle}>System Capacity</Text>
          </View>
          
          <View style={styles.capacityContainer}>
            <Text style={styles.capacityText}>
              Current Utilization: {scaling.currentCapacity.utilizationPercentage}%
            </Text>
            
            <View style={styles.progressBar}>
              <LinearGradient
                colors={scaling.currentCapacity.utilizationPercentage > 80 ? 
                  ['#EF4444', '#DC2626'] : 
                  scaling.currentCapacity.utilizationPercentage > 60 ? 
                    ['#F59E0B', '#D97706'] : 
                    ['#10B981', '#059669']
                }
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(scaling.currentCapacity.utilizationPercentage, 100)}%` }
                ]}
              />
            </View>
            
            <Text style={styles.capacityDetails}>
              Palm: {scaling.currentCapacity.palmReadings} | 
              Compatibility: {scaling.currentCapacity.compatibility}
            </Text>
            
            <Text style={styles.bottleneckText}>
              Next Bottleneck: {scaling.nextBottleneck}
            </Text>
          </View>
        </View>

        {/* Scaling Recommendations */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color="#06B6D4" />
            <Text style={styles.cardTitle}>Scaling Recommendations</Text>
          </View>
          
          {scaling.recommendations.map((recommendation: string, index: number) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color="#EC4899" />
            <Text style={styles.cardTitle}>System Controls</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>Auto Refresh</Text>
              <Switch
                value={autoRefresh}
                onValueChange={setAutoRefresh}
                trackColor={{ false: '#374151', true: '#8B5CF6' }}
                thumbColor={autoRefresh ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>Fallback Mode</Text>
              <Switch
                value={fallbackMode}
                onValueChange={handleFallbackToggle}
                trackColor={{ false: '#374151', true: '#EF4444' }}
                thumbColor={fallbackMode ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>
          
          <View style={styles.emergencyControls}>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyRestart}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Emergency Restart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.emergencyButton, styles.shutdownButton]} 
              onPress={handleEmergencyShutdown}
            >
              <Ionicons name="stop" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Emergency Shutdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthItem: {
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  capacityContainer: {
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  bottleneckText: {
    fontSize: 12,
    color: '#F59E0B',
    fontStyle: 'italic',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  controlItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 16,
    color: 'white',
  },
  emergencyControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emergencyButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 0.48,
  },
  shutdownButton: {
    backgroundColor: '#EF4444',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});