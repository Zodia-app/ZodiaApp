// Enterprise Service - 10K+ Users Integration Layer
// Coordinates all enterprise services for optimal performance

import { enterprisePalmReadingQueue } from './palmReading/enterprisePalmReadingQueue';
import { enterpriseCompatibilityService } from './compatibility/enterpriseCompatibilityService';
import { palmReadingService } from './palmReading/palmReadingService';

interface EnterpriseMetrics {
  totalUsers: number;
  activeUsers: number;
  palmReadingsToday: number;
  compatibilityAnalysesToday: number;
  averageResponseTime: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: number;
}

interface LoadBalancingConfig {
  palmReadingThreshold: number; // When to switch to enterprise mode
  compatibilityThreshold: number;
  fallbackMode: boolean;
  circuitBreakerEnabled: boolean;
}

class EnterpriseService {
  private config: LoadBalancingConfig = {
    palmReadingThreshold: 5, // Switch to enterprise mode when >5 concurrent
    compatibilityThreshold: 10, // Switch when >10 concurrent
    fallbackMode: false,
    circuitBreakerEnabled: true
  };

  private dailyMetrics = {
    palmReadings: 0,
    compatibilityAnalyses: 0,
    errors: 0,
    startTime: Date.now()
  };

  private systemHealth = {
    lastHealthCheck: Date.now(),
    consecutiveSuccesses: 0,
    consecutiveFailures: 0
  };

  constructor() {
    this.startHealthMonitoring();
    this.startDailyReset();
  }

  // 🚀 ENTERPRISE PALM READING
  async generatePalmReading(
    userData: any,
    leftPalmImage: string,
    rightPalmImage: string,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    this.dailyMetrics.palmReadings++;
    
    try {
      // Intelligent routing based on current load
      const currentLoad = this.getCurrentPalmReadingLoad();
      
      if (currentLoad >= this.config.palmReadingThreshold || this.config.fallbackMode) {
        console.log(`🚀 Enterprise Palm Reading: Load ${currentLoad}, using enterprise queue`);
        return await enterprisePalmReadingQueue.addToQueue(
          userData,
          leftPalmImage,
          rightPalmImage,
          priority
        );
      } else {
        console.log(`⚡ Standard Palm Reading: Load ${currentLoad}, using standard service`);
        return await palmReadingService.submitPalmReadingUltraOptimized({
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          zodiacSign: userData.zodiacSign,
          leftHandImage: leftPalmImage,
          rightHandImage: rightPalmImage
        }, priority);
      }
    } catch (error) {
      this.dailyMetrics.errors++;
      this.handleServiceError('palm_reading', error);
      throw error;
    }
  }

  // 🎯 ENTERPRISE COMPATIBILITY ANALYSIS
  async generateCompatibilityAnalysis(
    userReading: any,
    partnerReading?: any,
    partnerCode?: string,
    matchType: 'friend' | 'dating' | 'social' = 'friend',
    directMode: boolean = true,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    this.dailyMetrics.compatibilityAnalyses++;
    
    try {
      const currentLoad = this.getCurrentCompatibilityLoad();
      
      if (currentLoad >= this.config.compatibilityThreshold || this.config.fallbackMode) {
        console.log(`🚀 Enterprise Compatibility: Load ${currentLoad}, using enterprise service`);
        return await enterpriseCompatibilityService.generateCompatibilityAnalysis(
          userReading,
          partnerReading,
          partnerCode,
          matchType,
          directMode,
          priority
        );
      } else {
        console.log(`⚡ Standard Compatibility: Load ${currentLoad}, using standard service`);
        const { generateCompatibilityAnalysis } = await import('./compatibilityService');
        return await generateCompatibilityAnalysis(userReading, partnerReading);
      }
    } catch (error) {
      this.dailyMetrics.errors++;
      this.handleServiceError('compatibility', error);
      throw error;
    }
  }

  // 📊 COMPREHENSIVE METRICS
  getEnterpriseMetrics(): EnterpriseMetrics {
    const palmMetrics = enterprisePalmReadingQueue.getMetrics();
    const compatibilityMetrics = enterpriseCompatibilityService.getMetrics();
    const uptime = Date.now() - this.dailyMetrics.startTime;

    return {
      totalUsers: this.estimateTotalUsers(),
      activeUsers: this.estimateActiveUsers(),
      palmReadingsToday: this.dailyMetrics.palmReadings,
      compatibilityAnalysesToday: this.dailyMetrics.compatibilityAnalyses,
      averageResponseTime: (palmMetrics.averageResponseTime + compatibilityMetrics.averageResponseTime) / 2,
      systemHealth: this.getSystemHealth(),
      uptime: Math.round(uptime / 1000) // in seconds
    };
  }

  // 🎛️ SYSTEM CONTROLS
  enableFallbackMode() {
    this.config.fallbackMode = true;
    console.log('🚨 Enterprise: Fallback mode ENABLED - All requests routed to enterprise services');
  }

  disableFallbackMode() {
    this.config.fallbackMode = false;
    console.log('✅ Enterprise: Fallback mode DISABLED - Load-based routing restored');
  }

  updateThresholds(palmThreshold: number, compatibilityThreshold: number) {
    this.config.palmReadingThreshold = palmThreshold;
    this.config.compatibilityThreshold = compatibilityThreshold;
    console.log(`🎛️ Enterprise: Thresholds updated - Palm: ${palmThreshold}, Compatibility: ${compatibilityThreshold}`);
  }

  // 🔧 EMERGENCY CONTROLS
  emergencyShutdown() {
    console.log('🚨 EMERGENCY SHUTDOWN INITIATED');
    enterprisePalmReadingQueue.clearQueue();
    enterpriseCompatibilityService.pauseProcessing();
    this.config.fallbackMode = true;
  }

  emergencyRestart() {
    console.log('🔄 EMERGENCY RESTART INITIATED');
    enterpriseCompatibilityService.resumeProcessing();
    this.config.fallbackMode = false;
    this.systemHealth.consecutiveFailures = 0;
  }

  // 📈 SCALING ANALYSIS
  getScalingRecommendations(): any {
    const metrics = this.getEnterpriseMetrics();
    const palmQueue = enterprisePalmReadingQueue.getQueueStatus();
    const compatibilityMetrics = enterpriseCompatibilityService.getMetrics();

    return {
      currentCapacity: {
        palmReadings: `${palmQueue.currentProcessing}/${palmQueue.maxConcurrent}`,
        compatibility: `${compatibilityMetrics.activeBatches}/15`,
        utilizationPercentage: Math.round(((palmQueue.currentProcessing / 25) + (compatibilityMetrics.activeBatches / 15)) / 2 * 100)
      },
      recommendations: this.generateScalingRecommendations(metrics),
      alertLevel: this.getAlertLevel(metrics),
      nextBottleneck: this.identifyNextBottleneck()
    };
  }

  // Private helper methods
  private getCurrentPalmReadingLoad(): number {
    return enterprisePalmReadingQueue.getQueueStatus().currentProcessing;
  }

  private getCurrentCompatibilityLoad(): number {
    return enterpriseCompatibilityService.getMetrics().activeBatches;
  }

  private estimateTotalUsers(): number {
    // Estimate based on daily activity
    const dailyActivity = this.dailyMetrics.palmReadings + this.dailyMetrics.compatibilityAnalyses;
    return Math.round(dailyActivity * 0.8); // Estimate ~80% of users perform actions
  }

  private estimateActiveUsers(): number {
    const currentActivity = this.getCurrentPalmReadingLoad() + this.getCurrentCompatibilityLoad();
    return Math.max(currentActivity * 2, 1); // Estimate 2 users per active operation
  }

  private getSystemHealth(): 'excellent' | 'good' | 'warning' | 'critical' {
    const errorRate = this.dailyMetrics.errors / Math.max(this.dailyMetrics.palmReadings + this.dailyMetrics.compatibilityAnalyses, 1);
    const consecutiveFailures = this.systemHealth.consecutiveFailures;

    if (consecutiveFailures >= 10 || errorRate > 0.1) return 'critical';
    if (consecutiveFailures >= 5 || errorRate > 0.05) return 'warning';
    if (errorRate > 0.02) return 'good';
    return 'excellent';
  }

  private generateScalingRecommendations(metrics: EnterpriseMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.activeUsers > 300) {
      recommendations.push('Consider adding more OpenAI API keys for palm readings');
    }
    
    if (metrics.palmReadingsToday > 5000) {
      recommendations.push('Scale palm reading infrastructure - add more concurrent workers');
    }
    
    if (metrics.compatibilityAnalysesToday > 8000) {
      recommendations.push('Increase compatibility batch processing limits');
    }
    
    if (metrics.averageResponseTime > 10000) {
      recommendations.push('Performance optimization needed - consider CDN or edge computing');
    }
    
    if (metrics.systemHealth === 'warning' || metrics.systemHealth === 'critical') {
      recommendations.push('Immediate attention required - check error logs and system resources');
    }
    
    return recommendations.length > 0 ? recommendations : ['System performing optimally'];
  }

  private getAlertLevel(metrics: EnterpriseMetrics): 'green' | 'yellow' | 'red' {
    if (metrics.systemHealth === 'critical' || metrics.activeUsers > 400) return 'red';
    if (metrics.systemHealth === 'warning' || metrics.activeUsers > 250) return 'yellow';
    return 'green';
  }

  private identifyNextBottleneck(): string {
    const palmQueue = enterprisePalmReadingQueue.getQueueStatus();
    const palmUtilization = palmQueue.currentProcessing / 25;
    
    const compatibilityMetrics = enterpriseCompatibilityService.getMetrics();
    const compatibilityUtilization = compatibilityMetrics.activeBatches / 15;
    
    if (palmUtilization > compatibilityUtilization) {
      return 'Palm reading processing capacity';
    } else {
      return 'Compatibility analysis capacity';
    }
  }

  private handleServiceError(service: string, error: any) {
    this.systemHealth.consecutiveFailures++;
    this.systemHealth.consecutiveSuccesses = 0;
    
    console.error(`🚨 Enterprise ${service} error:`, error.message);
    
    // Auto-enable fallback if too many failures
    if (this.systemHealth.consecutiveFailures >= 5 && !this.config.fallbackMode) {
      console.log('🚨 Auto-enabling fallback mode due to consecutive failures');
      this.enableFallbackMode();
    }
  }

  private startHealthMonitoring() {
    setInterval(() => {
      this.systemHealth.lastHealthCheck = Date.now();
      
      // Report comprehensive status
      const metrics = this.getEnterpriseMetrics();
      const scaling = this.getScalingRecommendations();
      
      console.log(`🏥 Enterprise Health Check: ${metrics.systemHealth.toUpperCase()} | ${metrics.activeUsers} active users | ${scaling.alertLevel.toUpperCase()} alert level`);
      
      if (scaling.alertLevel === 'red') {
        console.log('🚨 RED ALERT: Immediate scaling action required!');
        console.log('Recommendations:', scaling.recommendations);
      }
    }, 60000); // Every minute
  }

  private startDailyReset() {
    // Reset daily metrics at midnight
    const msUntilMidnight = new Date().setHours(24,0,0,0) - Date.now();
    
    setTimeout(() => {
      this.resetDailyMetrics();
      
      // Set up daily reset interval
      setInterval(() => {
        this.resetDailyMetrics();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntilMidnight);
  }

  private resetDailyMetrics() {
    this.dailyMetrics = {
      palmReadings: 0,
      compatibilityAnalyses: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    console.log('🔄 Enterprise: Daily metrics reset');
  }
}

// Singleton instance
export const enterpriseService = new EnterpriseService();