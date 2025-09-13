// Palm Reading Queue Service - For heavy load optimization
// Implements async processing to handle thundering herd scenarios

interface QueueItem {
  id: string;
  userData: any;
  leftPalmImage: string;
  rightPalmImage: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  retries: number;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

class PalmReadingQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private maxConcurrent = 1; // Reduce to 1 to avoid rate limits
  private currentProcessing = 0;
  private maxRetries = 2;

  // Add request to queue with priority
  async addToQueue(
    userData: any, 
    leftPalmImage: string, 
    rightPalmImage: string, 
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        id: `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userData,
        leftPalmImage,
        rightPalmImage,
        priority,
        timestamp: Date.now(),
        retries: 0,
        resolve,
        reject
      };

      // Insert based on priority (high -> normal -> low)
      const insertIndex = this.findInsertIndex(priority);
      this.queue.splice(insertIndex, 0, queueItem);
      
      console.log(`🎯 Added to palm reading queue: ${queueItem.id} (priority: ${priority}, position: ${insertIndex + 1}/${this.queue.length})`);
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private findInsertIndex(priority: 'high' | 'normal' | 'low'): number {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    const targetPriority = priorityOrder[priority];
    
    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] < targetPriority) {
        return i;
      }
    }
    return this.queue.length;
  }

  private async processQueue() {
    if (this.processing && this.currentProcessing >= this.maxConcurrent) {
      return; // Already at max capacity
    }

    this.processing = true;
    
    while (this.queue.length > 0 && this.currentProcessing < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) continue;

      this.currentProcessing++;
      console.log(`🚀 Processing palm reading: ${item.id} (${this.currentProcessing}/${this.maxConcurrent} concurrent)`);
      
      // Process item asynchronously
      this.processItem(item).finally(() => {
        this.currentProcessing--;
        
        // Continue processing queue
        if (this.queue.length > 0 && this.currentProcessing < this.maxConcurrent) {
          setTimeout(() => this.processQueue(), 100);
        } else if (this.queue.length === 0 && this.currentProcessing === 0) {
          this.processing = false;
          console.log('✅ Palm reading queue empty - processing stopped');
        }
      });
    }
  }

  private async processItem(item: QueueItem) {
    try {
      // Call the actual edge function
      const result = await this.callPalmReadingEdgeFunction(item);
      console.log(`✅ Palm reading completed: ${item.id}`);
      item.resolve(result);
    } catch (error) {
      console.error(`❌ Palm reading failed: ${item.id}`, error);
      
      // Retry logic with exponential backoff
      if (item.retries < this.maxRetries) {
        item.retries++;
        const delay = Math.pow(2, item.retries) * 1000; // 2s, 4s, 8s...
        console.log(`🔄 Retrying palm reading: ${item.id} (attempt ${item.retries + 1}/${this.maxRetries + 1}) after ${delay}ms delay`);
        
        // Add delay before retry to avoid rate limits
        setTimeout(() => {
          // Add back to queue with higher priority
          const insertIndex = this.findInsertIndex('high');
          this.queue.splice(insertIndex, 0, item);
          this.processQueue(); // Resume processing
        }, delay);
      } else {
        console.error(`💀 Palm reading failed after ${this.maxRetries + 1} attempts: ${item.id}`);
        item.reject(error);
      }
    }
  }

  private async callPalmReadingEdgeFunction(item: QueueItem) {
    const { supabase } = require('../../supabase/supabaseService');
    
    console.log('📡 Calling palm reading edge function via queue...');
    
    const { data, error } = await supabase.functions.invoke('generate-palm-reading', {
      body: {
        userData: item.userData,
        leftPalmImage: item.leftPalmImage,
        rightPalmImage: item.rightPalmImage
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status || 'unknown',
        statusText: error.statusText || 'unknown',
        code: error.code || 'unknown'
      });
      
      // Try to get more details from the response if available
      if (error.details) {
        console.error('Error response details:', error.details);
      }
      
      throw error;
    }

    return data;
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentProcessing: this.currentProcessing,
      maxConcurrent: this.maxConcurrent
    };
  }

  // Clear queue (emergency)
  clearQueue() {
    console.log('🚨 Clearing palm reading queue');
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.processing = false;
    this.currentProcessing = 0;
  }
}

// Singleton instance
export const palmReadingQueue = new PalmReadingQueue();