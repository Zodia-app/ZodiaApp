import { supabase } from '../supabase/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CompatibilityCode {
  id: string;
  code: string;
  user_name: string;
  user_palm_data: any;
  user_reading_result: any;
  created_at: string;
  expires_at: string;
  times_used: number;
}

export interface CreateCodeData {
  userReading: any;
  code: string;
}

export const compatibilityCodesService = {
  // Store a new compatibility code
  async storeCode(data: CreateCodeData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Storing compatibility code:', data.code);
      
      // Try database first, fallback to local storage
      try {
        const { error } = await supabase
          .from('compatibility_codes')
          .insert([
            {
              code: data.code,
              user_name: data.userReading.userData?.name || 'Anonymous',
              user_palm_data: data.userReading.palmData || {},
              user_reading_result: data.userReading.readingResult || {},
            }
          ]);

        if (!error) {
          console.log('Successfully stored compatibility code in database:', data.code);
          return { success: true };
        } else {
          throw new Error(error.message);
        }
      } catch (dbError) {
        console.log('Database storage failed, using local storage:', dbError);
        
        // Fallback: Store locally
        const codeData = {
          id: Date.now().toString(),
          code: data.code,
          user_name: data.userReading.userData?.name || 'Anonymous',
          user_palm_data: data.userReading.palmData || {},
          user_reading_result: data.userReading.readingResult || {},
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          times_used: 0
        };
        
        await AsyncStorage.setItem(`compatibility_code_${data.code}`, JSON.stringify(codeData));
        console.log('Successfully stored compatibility code locally:', data.code);
        return { success: true };
      }
    } catch (error) {
      console.error('Exception storing compatibility code:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Look up a compatibility code
  async lookupCode(code: string): Promise<{ success: boolean; data?: CompatibilityCode; error?: string }> {
    try {
      console.log('Looking up compatibility code:', code);
      
      // Try database first, fallback to local storage
      try {
        const { data: codeData, error } = await supabase
          .from('compatibility_codes')
          .select('*')
          .eq('code', code.toUpperCase())
          .gte('expires_at', new Date().toISOString()) // Only get non-expired codes
          .single();

        if (!error && codeData) {
          // Increment usage counter
          await this.incrementUsage(code);
          console.log('Successfully found compatibility code in database:', code);
          return { success: true, data: codeData };
        }
      } catch (dbError) {
        console.log('Database lookup failed, trying local storage:', dbError);
      }
      
      // Fallback: Check local storage
      try {
        const localData = await AsyncStorage.getItem(`compatibility_code_${code.toUpperCase()}`);
        if (localData) {
          const codeData = JSON.parse(localData);
          
          // Check if expired
          if (new Date(codeData.expires_at) > new Date()) {
            codeData.times_used = (codeData.times_used || 0) + 1;
            await AsyncStorage.setItem(`compatibility_code_${code.toUpperCase()}`, JSON.stringify(codeData));
            
            console.log('Successfully found compatibility code locally:', code);
            return { success: true, data: codeData };
          } else {
            // Remove expired code
            await AsyncStorage.removeItem(`compatibility_code_${code.toUpperCase()}`);
            return { success: false, error: 'Compatibility code expired' };
          }
        }
      } catch (localError) {
        console.log('Local storage lookup failed:', localError);
      }

      return { success: false, error: 'Compatibility code not found' };
    } catch (error) {
      console.error('Exception looking up compatibility code:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Increment usage counter for a code
  async incrementUsage(code: string): Promise<void> {
    try {
      await supabase
        .from('compatibility_codes')
        .update({ times_used: 1 }) // Simplified for now
        .eq('code', code.toUpperCase());
    } catch (error) {
      console.error('Error incrementing usage:', error);
      // Don't fail the lookup if this fails
    }
  },

  // Clean up expired codes (can be called periodically)
  async cleanupExpiredCodes(): Promise<{ success: boolean; deleted?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('compatibility_codes')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error cleaning up expired codes:', error);
        return { success: false, error: error.message };
      }

      const deletedCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
      console.log(`Cleaned up ${deletedCount} expired compatibility codes`);
      return { success: true, deleted: deletedCount };
    } catch (error) {
      console.error('Exception cleaning up expired codes:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};