// src/services/offlineManager.ts
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class OfflineManager {
  private isOnline: boolean = true;
  private actionQueue: QueuedAction[] = [];
  private listeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.initializeNetworkListener();
    this.loadQueueFromStorage();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      console.log('Network status changed:', this.isOnline ? 'Online' : 'Offline');
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(this.isOnline));
      
      // Process queue when coming back online
      if (wasOffline && this.isOnline) {
        console.log('Back online! Processing queued actions...');
        this.processQueue();
      }
    });
  }

  async loadQueueFromStorage() {
    try {
      const queueData = await AsyncStorage.getItem('offlineQueue');
      if (queueData) {
        this.actionQueue = JSON.parse(queueData);
        console.log(`Loaded ${this.actionQueue.length} queued actions`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  async saveQueueToStorage() {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async queueAction(type: string, data: any): Promise<string> {
    const action: QueuedAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
    };
    
    this.actionQueue.push(action);
    await this.saveQueueToStorage();
    
    console.log(`Queued action: ${type}`, action);
    return action.id;
  }

  async processQueue() {
    if (this.actionQueue.length === 0) return;
    
    console.log(`Processing ${this.actionQueue.length} queued actions`);
    const queue = [...this.actionQueue];
    this.actionQueue = [];
    
    for (const action of queue) {
      try {
        await this.processAction(action);
      } catch (error) {
        console.error(`Failed to process action ${action.type}:`, error);
        // Re-queue failed actions
        this.actionQueue.push(action);
      }
    }
    
    await this.saveQueueToStorage();
  }

  private async processAction(action: QueuedAction) {
    console.log(`Processing action: ${action.type}`);
    
    // Import your services here to avoid circular dependencies
    const { supabase } = await import('../lib/supabase');
    
    switch (action.type) {
      case 'SAVE_PROFILE':
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert(action.data);
        if (profileError) throw profileError;
        break;
        
      case 'SAVE_READING':
        const { data: readingData, error: readingError } = await supabase
          .from('readings')
          .insert(action.data);
        if (readingError) throw readingError;
        break;
        
      case 'UPLOAD_PALM_IMAGE':
        // Handle palm image upload
        // You'll need to implement this based on your upload service
        break;
        
      case 'GENERATE_COMPATIBILITY':
        // Handle compatibility generation
        // You'll need to implement this based on your AI service
        break;
        
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  onNetworkChange(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  getQueueLength(): number {
    return this.actionQueue.length;
  }

  async clearQueue(): Promise<void> {
    this.actionQueue = [];
    await AsyncStorage.removeItem('offlineQueue');
  }
}

// Export singleton instance
export default new OfflineManager();