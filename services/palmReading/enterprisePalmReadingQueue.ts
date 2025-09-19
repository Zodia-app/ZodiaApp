// Enterprise Palm Reading Queue - 10K+ Users
// Supports 200+ concurrent palm readings with circuit breaker and load balancing

interface EnterpriseQueueItem {
  id: string;
  userData: any;
  leftPalmImage: string;
  rightPalmImage: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp: number;
  retries: number;
  estimatedProcessingTime: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  apiKeyIndex?: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failures: number;
  lastFailureTime: number;
  successCount: number;
}

class EnterprisePalmReadingQueue {
  private queue: EnterpriseQueueItem[] = [];
  private processing = false;
  private maxConcurrent = 25; // Increased for enterprise scale
  private currentProcessing = 0;
  private maxRetries = 3;
  
  // Circuit Breaker for resilience
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failures: 0,
    lastFailureTime: 0,
    successCount: 0
  };
  
  // Load balancing across multiple API keys
  private apiKeys: string[] = [];
  private currentKeyIndex = 0;
  
  // Performance monitoring
  private metrics = {
    totalProcessed: 0,
    totalSuccessful: 0,
    averageResponseTime: 0,
    peakConcurrent: 0,
    currentLoad: 0
  };

  constructor() {
    this.initializeApiKeys();
    this.startMetricsReporting();
  }

  private initializeApiKeys() {
    // Initialize multiple OpenAI API keys for load distribution
    const primaryKey = Deno?.env?.get('OPENAI_API_KEY') || process.env.OPENAI_API_KEY;
    const secondaryKey = Deno?.env?.get('OPENAI_API_KEY_2') || process.env.OPENAI_API_KEY_2;
    const tertiaryKey = Deno?.env?.get('OPENAI_API_KEY_3') || process.env.OPENAI_API_KEY_3;
    
    if (primaryKey) this.apiKeys.push(primaryKey);
    if (secondaryKey) this.apiKeys.push(secondaryKey);
    if (tertiaryKey) this.apiKeys.push(tertiaryKey);
    
    console.log(`🔑 Enterprise Queue: ${this.apiKeys.length} API keys configured`);
  }

  async addToQueue(
    userData: any,
    leftPalmImage: string,
    rightPalmImage: string,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Circuit breaker check
      if (this.circuitBreaker.isOpen) {
        if (Date.now() - this.circuitBreaker.lastFailureTime > 60000) {
          // Reset circuit breaker after 1 minute
          this.circuitBreaker.isOpen = false;
          this.circuitBreaker.failures = 0;
          console.log('🔧 Circuit breaker reset');
        } else {
          reject(new Error('Circuit breaker is open. Service temporarily unavailable.'));
          return;
        }
      }

      const queueItem: EnterpriseQueueItem = {
        id: `enterprise_palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userData,
        leftPalmImage,
        rightPalmImage,
        priority,
        timestamp: Date.now(),
        retries: 0,
        estimatedProcessingTime: this.estimateProcessingTime(),
        resolve,
        reject,
        apiKeyIndex: this.getNextApiKeyIndex()
      };

      // Smart insertion based on priority and estimated time
      const insertIndex = this.findOptimalInsertIndex(queueItem);
      this.queue.splice(insertIndex, 0, queueItem);
      
      console.log(`🚀 Enterprise Queue: Added ${queueItem.id} (priority: ${priority}, position: ${insertIndex + 1}/${this.queue.length}, ETA: ${queueItem.estimatedProcessingTime}s)`);
      
      // Update metrics
      this.metrics.currentLoad = this.queue.length + this.currentProcessing;
      this.metrics.peakConcurrent = Math.max(this.metrics.peakConcurrent, this.metrics.currentLoad);
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private estimateProcessingTime(): number {
    // Estimate based on current load and historical performance
    const baseTime = 30; // Base processing time in seconds
    const loadFactor = Math.min(this.metrics.currentLoad / this.maxConcurrent, 2);
    return Math.round(baseTime * (1 + loadFactor * 0.5));
  }

  private getNextApiKeyIndex(): number {
    if (this.apiKeys.length === 0) return 0;
    const index = this.currentKeyIndex;
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return index;
  }

  private findOptimalInsertIndex(item: EnterpriseQueueItem): number {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    const targetPriority = priorityOrder[item.priority];
    
    // Find position based on priority and processing time
    for (let i = 0; i < this.queue.length; i++) {
      const queueItemPriority = priorityOrder[this.queue[i].priority];
      
      if (queueItemPriority < targetPriority) {
        return i;
      }
      
      // Same priority, optimize by processing time
      if (queueItemPriority === targetPriority && 
          this.queue[i].estimatedProcessingTime > item.estimatedProcessingTime) {
        return i;
      }
    }
    return this.queue.length;
  }

  private async processQueue() {
    if (this.processing && this.currentProcessing >= this.maxConcurrent) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0 && this.currentProcessing < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) continue;

      this.currentProcessing++;
      console.log(`🔥 Enterprise Processing: ${item.id} (${this.currentProcessing}/${this.maxConcurrent} concurrent, Queue: ${this.queue.length})`);
      
      // Process item asynchronously with load balancing
      this.processItemWithLoadBalancing(item).finally(() => {
        this.currentProcessing--;
        this.metrics.currentLoad = this.queue.length + this.currentProcessing;
        
        // Continue processing
        if (this.queue.length > 0 && this.currentProcessing < this.maxConcurrent) {
          setTimeout(() => this.processQueue(), 100);
        } else if (this.queue.length === 0 && this.currentProcessing === 0) {
          this.processing = false;
          console.log('✅ Enterprise Queue: All items processed');
        }
      });
    }
  }

  private async processItemWithLoadBalancing(item: EnterpriseQueueItem) {
    const startTime = Date.now();
    
    try {
      // Use specific API key for load balancing
      const apiKey = this.apiKeys[item.apiKeyIndex || 0] || this.apiKeys[0];
      
      const result = await this.callPalmReadingWithKey(item, apiKey);
      
      // Update success metrics
      const responseTime = Date.now() - startTime;
      this.metrics.totalProcessed++;
      this.metrics.totalSuccessful++;
      this.updateAverageResponseTime(responseTime);
      
      // Reset circuit breaker on success
      this.circuitBreaker.successCount++;
      if (this.circuitBreaker.successCount >= 5) {
        this.circuitBreaker.failures = 0;
      }
      
      console.log(`✅ Enterprise Success: ${item.id} (${responseTime}ms, Key: ${item.apiKeyIndex})`);
      item.resolve(result);
      
    } catch (error) {
      console.error(`❌ Enterprise Failure: ${item.id}`, error);
      
      // Circuit breaker logic
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = Date.now();
      
      if (this.circuitBreaker.failures >= 10) {
        this.circuitBreaker.isOpen = true;
        console.log('🚨 Circuit breaker opened due to high failure rate');
      }
      
      // Retry logic with exponential backoff
      if (item.retries < this.maxRetries) {
        item.retries++;
        // Try different API key on retry
        item.apiKeyIndex = this.getNextApiKeyIndex();
        
        const delay = Math.min(Math.pow(2, item.retries) * 1000, 10000);
        console.log(`🔄 Enterprise Retry: ${item.id} (attempt ${item.retries + 1}/${this.maxRetries + 1}) with key ${item.apiKeyIndex} after ${delay}ms`);
        
        setTimeout(() => {
          const insertIndex = this.findOptimalInsertIndex(item);
          this.queue.splice(insertIndex, 0, item);
          this.processQueue();
        }, delay);
      } else {
        this.metrics.totalProcessed++;
        console.error(`💀 Enterprise Final Failure: ${item.id} after ${this.maxRetries + 1} attempts`);
        item.reject(error);
      }
    }
  }

  private async callPalmReadingWithKey(item: EnterpriseQueueItem, apiKey: string) {
    const { supabase } = require('../../supabase/supabaseService');
    
    console.log(`📡 Enterprise API Call: ${item.id} using key index ${item.apiKeyIndex}`);
    
    // Enhanced timeout and retry configuration
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-palm-reading', {
        body: {
          userData: item.userData,
          leftPalmImage: item.leftPalmImage,
          rightPalmImage: item.rightPalmImage,
          _enterpriseMode: true,
          _apiKeyHint: item.apiKeyIndex
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private updateAverageResponseTime(responseTime: number) {
    if (this.metrics.totalSuccessful === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.totalSuccessful - 1) + responseTime) / 
        this.metrics.totalSuccessful;
    }
  }

  private startMetricsReporting() {
    setInterval(() => {
      console.log(`📊 Enterprise Metrics: ${this.metrics.totalSuccessful}/${this.metrics.totalProcessed} success, ${Math.round(this.metrics.averageResponseTime)}ms avg, ${this.metrics.currentLoad} current load, Peak: ${this.metrics.peakConcurrent}`);
    }, 30000); // Report every 30 seconds
  }

  // Public methods for monitoring
  getMetrics() {
    return {
      ...this.metrics,
      queueLength: this.queue.length,
      processing: this.currentProcessing,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      apiKeysConfigured: this.apiKeys.length
    };
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentProcessing: this.currentProcessing,
      maxConcurrent: this.maxConcurrent,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      estimatedWaitTime: this.queue.length > 0 ? 
        Math.round(this.queue[0].estimatedProcessingTime * (this.queue.length / this.maxConcurrent)) : 0
    };
  }

  // Emergency methods
  clearQueue() {
    console.log('🚨 Emergency: Clearing enterprise queue');
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared - system maintenance'));
    });
    this.queue = [];
    this.processing = false;
    this.currentProcessing = 0;
  }

  pauseProcessing() {
    this.processing = false;
    console.log('⏸️ Enterprise queue paused');
  }

  resumeProcessing() {
    console.log('▶️ Enterprise queue resumed');
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

// Singleton instance for enterprise scale
export const enterprisePalmReadingQueue = new EnterprisePalmReadingQueue();