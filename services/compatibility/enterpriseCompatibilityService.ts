// Enterprise Compatibility Service - 10K+ Users
// Optimized for 300+ concurrent compatibility analyses

import { supabase } from '../../supabase/supabaseService';

interface CompatibilityRequestBatch {
  id: string;
  requests: CompatibilityRequest[];
  batchSize: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp: number;
}

interface CompatibilityRequest {
  id: string;
  userReading: any;
  partnerReading?: any;
  partnerCode?: string;
  matchType: 'friend' | 'dating' | 'social';
  directMode: boolean;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

interface CacheEntry {
  result: any;
  timestamp: number;
  hits: number;
  lastAccessed: number;
}

class EnterpriseCompatibilityService {
  private batchQueue: CompatibilityRequestBatch[] = [];
  private cache = new Map<string, CacheEntry>();
  private processing = false;
  private maxBatchSize = 10; // Process multiple requests together
  private maxConcurrentBatches = 15; // Increased for enterprise scale
  private currentBatches = 0;
  
  // Cache configuration
  private cacheMaxSize = 10000; // 10K cached results
  private cacheExpiryTime = 1800000; // 30 minutes
  
  // Performance metrics
  private metrics = {
    totalRequests: 0,
    cacheHits: 0,
    batchesProcessed: 0,
    averageResponseTime: 0,
    peakConcurrent: 0,
    successRate: 0
  };

  constructor() {
    this.startCacheCleanup();
    this.startMetricsReporting();
  }

  async generateCompatibilityAnalysis(
    userReading: any,
    partnerReading?: any,
    partnerCode?: string,
    matchType: 'friend' | 'dating' | 'social' = 'friend',
    directMode: boolean = true,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.metrics.totalRequests++;
      
      // Check cache first
      const cacheKey = this.generateCacheKey(userReading, partnerReading, partnerCode, matchType);
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryTime) {
        cached.hits++;
        cached.lastAccessed = Date.now();
        this.metrics.cacheHits++;
        
        console.log(`⚡ Enterprise Cache Hit: ${cacheKey} (${cached.hits} hits)`);
        resolve(cached.result);
        return;
      }

      const request: CompatibilityRequest = {
        id: `compat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userReading,
        partnerReading,
        partnerCode,
        matchType,
        directMode,
        resolve: (result) => {
          // Cache successful results
          this.cacheResult(cacheKey, result);
          resolve(result);
        },
        reject
      };

      this.addToBatch(request, priority);
    });
  }

  private generateCacheKey(userReading: any, partnerReading?: any, partnerCode?: string, matchType?: string): string {
    // Create a hash-like key from the input data
    const userKey = `${userReading?.userData?.name || 'anon'}_${userReading?.userData?.dateOfBirth || 'unknown'}`;
    const partnerKey = partnerReading ? 
      `${partnerReading?.userData?.name || 'anon'}_${partnerReading?.userData?.dateOfBirth || 'unknown'}` :
      partnerCode || 'code';
    
    return `${userKey}__${partnerKey}__${matchType}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }

  private cacheResult(key: string, result: any) {
    // Implement LRU cache eviction
    if (this.cache.size >= this.cacheMaxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 1,
      lastAccessed: Date.now()
    });

    console.log(`💾 Enterprise Cache: Stored ${key} (Cache size: ${this.cache.size})`);
  }

  private evictLeastRecentlyUsed() {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Enterprise Cache: Evicted ${oldestKey}`);
    }
  }

  private addToBatch(request: CompatibilityRequest, priority: 'critical' | 'high' | 'normal' | 'low') {
    // Find existing batch with same priority or create new one
    let batch = this.batchQueue.find(b => 
      b.priority === priority && 
      b.requests.length < this.maxBatchSize
    );

    if (!batch) {
      batch = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        requests: [],
        batchSize: 0,
        priority,
        timestamp: Date.now()
      };
      
      // Insert based on priority
      const insertIndex = this.findBatchInsertIndex(priority);
      this.batchQueue.splice(insertIndex, 0, batch);
    }

    batch.requests.push(request);
    batch.batchSize = batch.requests.length;

    console.log(`🔄 Enterprise Batch: Added ${request.id} to ${batch.id} (${batch.batchSize}/${this.maxBatchSize}, Priority: ${priority})`);

    // Process batch if full or start processing if not already running
    if (batch.batchSize >= this.maxBatchSize || !this.processing) {
      this.processBatches();
    }
  }

  private findBatchInsertIndex(priority: 'critical' | 'high' | 'normal' | 'low'): number {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    const targetPriority = priorityOrder[priority];
    
    for (let i = 0; i < this.batchQueue.length; i++) {
      if (priorityOrder[this.batchQueue[i].priority] < targetPriority) {
        return i;
      }
    }
    return this.batchQueue.length;
  }

  private async processBatches() {
    if (this.processing && this.currentBatches >= this.maxConcurrentBatches) {
      return;
    }

    this.processing = true;

    while (this.batchQueue.length > 0 && this.currentBatches < this.maxConcurrentBatches) {
      const batch = this.batchQueue.shift();
      if (!batch || batch.requests.length === 0) continue;

      this.currentBatches++;
      this.metrics.peakConcurrent = Math.max(this.metrics.peakConcurrent, this.currentBatches);

      console.log(`🚀 Enterprise Batch Processing: ${batch.id} with ${batch.requests.length} requests (${this.currentBatches}/${this.maxConcurrentBatches} batches)`);

      // Process batch asynchronously
      this.processBatch(batch).finally(() => {
        this.currentBatches--;
        this.metrics.batchesProcessed++;

        // Continue processing
        if (this.batchQueue.length > 0 && this.currentBatches < this.maxConcurrentBatches) {
          setTimeout(() => this.processBatches(), 50);
        } else if (this.batchQueue.length === 0 && this.currentBatches === 0) {
          this.processing = false;
          console.log('✅ Enterprise Batches: All processed');
        }
      });
    }
  }

  private async processBatch(batch: CompatibilityRequestBatch) {
    const startTime = Date.now();
    
    // Process all requests in the batch concurrently
    const promises = batch.requests.map(request => this.processRequest(request));
    
    try {
      await Promise.allSettled(promises);
      
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      console.log(`✅ Enterprise Batch Complete: ${batch.id} (${responseTime}ms, ${batch.requests.length} requests)`);
      
    } catch (error) {
      console.error(`❌ Enterprise Batch Error: ${batch.id}`, error);
    }
  }

  private async processRequest(request: CompatibilityRequest): Promise<void> {
    try {
      console.log(`📡 Enterprise Request: ${request.id} (${request.matchType})`);
      
      const { data, error } = await supabase.functions.invoke('generate-compatibility-analysis', {
        body: {
          userReading: request.userReading,
          partnerReading: request.partnerReading,
          partnerCode: request.partnerCode,
          matchType: request.matchType,
          directMode: request.directMode,
          _enterpriseMode: true
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      console.log(`✅ Enterprise Request Success: ${request.id}`);
      request.resolve(data.compatibility);

    } catch (error) {
      console.error(`❌ Enterprise Request Error: ${request.id}`, error);
      request.reject(error);
    }
  }

  private updateAverageResponseTime(responseTime: number) {
    if (this.metrics.batchesProcessed === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.batchesProcessed - 1) + responseTime) / 
        this.metrics.batchesProcessed;
    }
  }

  private startCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.cacheExpiryTime) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Enterprise Cache: Cleaned ${cleaned} expired entries (${this.cache.size} remaining)`);
      }
    }, 300000); // Clean every 5 minutes
  }

  private startMetricsReporting() {
    setInterval(() => {
      const cacheHitRate = this.metrics.totalRequests > 0 ? 
        Math.round((this.metrics.cacheHits / this.metrics.totalRequests) * 100) : 0;
      
      console.log(`📊 Enterprise Compatibility Metrics: ${this.metrics.totalRequests} requests, ${cacheHitRate}% cache hit rate, ${Math.round(this.metrics.averageResponseTime)}ms avg, ${this.currentBatches} active batches`);
    }, 30000);
  }

  // Public monitoring methods
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.cacheHits / this.metrics.totalRequests) * 100 : 0,
      queueLength: this.batchQueue.reduce((sum, batch) => sum + batch.requests.length, 0),
      activeBatches: this.currentBatches
    };
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      utilization: (this.cache.size / this.cacheMaxSize) * 100,
      expiryTime: this.cacheExpiryTime
    };
  }

  // Emergency controls
  clearCache() {
    this.cache.clear();
    console.log('🚨 Enterprise Cache: Cleared all entries');
  }

  pauseProcessing() {
    this.processing = false;
    console.log('⏸️ Enterprise Compatibility: Processing paused');
  }

  resumeProcessing() {
    console.log('▶️ Enterprise Compatibility: Processing resumed');
    if (this.batchQueue.length > 0) {
      this.processBatches();
    }
  }
}

// Singleton instance
export const enterpriseCompatibilityService = new EnterpriseCompatibilityService();