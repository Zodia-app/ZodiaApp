// Simple user identification service for palm readings
// Generates consistent user IDs based on user data

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  name: string;
  dateOfBirth?: string;
  age?: number;
}

class UserIdentificationService {
  private readonly USER_ID_KEY = 'zodia_user_id';

  /**
   * Get or create a user ID for the current user
   * Uses a combination of stored ID and user data for consistency
   */
  async getUserId(userData: UserData): Promise<string> {
    try {
      // First check if we have a stored user ID
      const storedUserId = await AsyncStorage.getItem(this.USER_ID_KEY);
      
      if (storedUserId) {
        return storedUserId;
      }
      
      // Generate a new user ID based on user data
      const userId = this.generateUserId(userData);
      
      // Store it for future use
      await AsyncStorage.setItem(this.USER_ID_KEY, userId);
      
      return userId;
      
    } catch (error) {
      console.error('Error managing user ID:', error);
      // Fallback to generating a new ID each time
      return this.generateUserId(userData);
    }
  }

  /**
   * Generate a consistent UUID based on user data
   * This ensures the same user gets the same ID across sessions
   */
  private generateUserId(userData: UserData): string {
    // Create a hash-like string from user data
    const dataString = `${userData.name?.toLowerCase()}_${userData.dateOfBirth || userData.age || 'unknown'}`;
    
    // Simple hash function to generate consistent UUID-like string
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and pad
    const positiveHash = Math.abs(hash).toString();
    const paddedHash = positiveHash.padStart(10, '0');
    
    // Format as UUID-like string
    const uuid = [
      paddedHash.slice(0, 8),
      paddedHash.slice(0, 4),
      '4' + paddedHash.slice(1, 4), // Version 4 UUID marker
      '8' + paddedHash.slice(1, 4), // Variant marker  
      paddedHash.slice(0, 12)
    ].join('-');
    
    return uuid;
  }

  /**
   * Clear stored user ID (for testing or logout)
   */
  async clearUserId(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_ID_KEY);
    } catch (error) {
      console.error('Error clearing user ID:', error);
    }
  }

  /**
   * Get stored user ID without generating a new one
   */
  async getStoredUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.USER_ID_KEY);
    } catch (error) {
      console.error('Error getting stored user ID:', error);
      return null;
    }
  }
}

export const userIdentificationService = new UserIdentificationService();