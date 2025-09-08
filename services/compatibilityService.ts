import { supabase } from '../supabase/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CompatibilityAnalysis {
  overallScore: number;
  overallLabel: string;
  categories: Array<{
    name: string;
    score: number;
    description: string;
    emoji: string;
  }>;
  insights: string[];
  cosmicMessage: string;
  recommendations?: string[];
  generatedAt: string;
  model: string;
  matchType: string;
  userName: string;
  partnerName: string;
}

export interface CompatibilityMatch {
  id: string;
  user1_profile_id: string;
  user2_profile_id: string;
  compatibility_code?: string;
  compatibility_score: number;
  compatibility_data: CompatibilityAnalysis;
  match_type: 'friend' | 'dating' | 'social';
  is_mutual: boolean;
  created_at: string;
}

export interface FriendConnection {
  id: string;
  user_profile_id: string;
  friend_name: string;
  friend_palm_data?: any;
  compatibility_score: number;
  compatibility_data: CompatibilityAnalysis;
  session_date: string;
  location?: string;
}

// Direct compatibility analysis for Friend Mode (no codes needed)
export const generateCompatibilityAnalysis = async (
  userReading: any,
  friendReading: any
): Promise<CompatibilityAnalysis> => {
  try {
    console.log('=== GENERATING DIRECT COMPATIBILITY ANALYSIS ===');
    console.log('User:', userReading.userData?.name);
    console.log('Friend:', friendReading.userData?.name);

    const { data, error } = await supabase.functions.invoke('generate-compatibility-analysis', {
      body: {
        userReading,
        partnerReading: friendReading,
        matchType: 'friend',
        directMode: true // Flag to indicate we have both readings directly
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message);
    }

    if (!data.success) {
      console.log('Compatibility generation failed:', data.error);
      throw new Error(data.error);
    }

    console.log('Direct compatibility analysis generated successfully');
    return data.compatibility;
  } catch (error) {
    console.error('Exception generating direct compatibility:', error);
    throw error;
  }
};

export const compatibilityService = {
  // Generate compatibility analysis using AI
  async generateCompatibility(
    userReading: any,
    partnerCode: string,
    matchType: 'friend' | 'dating' | 'social' = 'social'
  ): Promise<{ success: boolean; data?: CompatibilityAnalysis; error?: string }> {
    try {
      console.log('Generating compatibility analysis with AI...');
      console.log('Partner code:', partnerCode);
      console.log('Match type:', matchType);

      const { data, error } = await supabase.functions.invoke('generate-compatibility-analysis', {
        body: {
          userReading,
          partnerCode,
          matchType
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        console.log('Compatibility generation failed:', data.error);
        return { success: false, error: data.error };
      }

      console.log('AI compatibility analysis generated successfully');
      return { success: true, data: data.compatibility };
    } catch (error) {
      console.error('Exception generating compatibility:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Store compatibility code (enhanced version)
  async storeCode(data: {
    userReading: any;
    code: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Storing compatibility code:', data.code);
      
      // Try database first
      try {
        const { error } = await supabase
          .from('compatibility_codes')
          .insert([
            {
              code: data.code.toUpperCase(),
              user_name: data.userReading.userData?.name || 'Anonymous',
              user_palm_data: data.userReading.palmData || {},
              user_reading_result: data.userReading.readingResult || {},
              is_active: true
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
          code: data.code.toUpperCase(),
          user_name: data.userReading.userData?.name || 'Anonymous',
          user_palm_data: data.userReading.palmData || {},
          user_reading_result: data.userReading.readingResult || {},
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          times_used: 0,
          is_active: true
        };
        
        await AsyncStorage.setItem(`compatibility_code_${data.code.toUpperCase()}`, JSON.stringify(codeData));
        console.log('Successfully stored compatibility code locally:', data.code);
        return { success: true };
      }
    } catch (error) {
      console.error('Exception storing compatibility code:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Look up compatibility code (enhanced version)
  async lookupCode(code: string): Promise<{ 
    success: boolean; 
    data?: {
      code: string;
      user_name: string;
      user_palm_data: any;
      user_reading_result: any;
      times_used: number;
    }; 
    error?: string 
  }> {
    try {
      console.log('Looking up compatibility code:', code);
      
      // Try database first
      try {
        const { data: codeData, error } = await supabase
          .from('compatibility_codes')
          .select('*')
          .eq('code', code.toUpperCase())
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
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

  // Store friend connection result
  async storeFriendConnection(
    userProfileId: string,
    friendName: string,
    compatibilityData: CompatibilityAnalysis,
    friendPalmData?: any,
    location?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Storing friend connection:', friendName);

      const { error } = await supabase
        .from('friend_connections')
        .insert([
          {
            user_profile_id: userProfileId,
            friend_name: friendName,
            friend_palm_data: friendPalmData,
            compatibility_score: compatibilityData.overallScore,
            compatibility_data: compatibilityData,
            location: location
          }
        ]);

      if (error) {
        console.error('Error storing friend connection:', error);
        return { success: false, error: error.message };
      }

      console.log('Friend connection stored successfully');
      return { success: true };
    } catch (error) {
      console.error('Exception storing friend connection:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get user's friend connections
  async getFriendConnections(userProfileId: string): Promise<{
    success: boolean;
    data?: FriendConnection[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching friend connections:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception fetching friend connections:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Store compatibility match (for dating/social modes)
  async storeCompatibilityMatch(
    user1ProfileId: string,
    user2ProfileId: string,
    compatibilityData: CompatibilityAnalysis,
    matchType: 'friend' | 'dating' | 'social',
    compatibilityCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Storing compatibility match:', matchType);

      const { error } = await supabase
        .from('compatibility_matches')
        .insert([
          {
            user1_profile_id: user1ProfileId,
            user2_profile_id: user2ProfileId,
            compatibility_code: compatibilityCode,
            compatibility_score: compatibilityData.overallScore,
            compatibility_data: compatibilityData,
            match_type: matchType,
            is_mutual: false // Can be updated later if both users check each other
          }
        ]);

      if (error) {
        console.error('Error storing compatibility match:', error);
        return { success: false, error: error.message };
      }

      console.log('Compatibility match stored successfully');
      return { success: true };
    } catch (error) {
      console.error('Exception storing compatibility match:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get user's compatibility matches
  async getCompatibilityMatches(
    userProfileId: string,
    matchType?: 'friend' | 'dating' | 'social'
  ): Promise<{ success: boolean; data?: CompatibilityMatch[]; error?: string }> {
    try {
      let query = supabase
        .from('compatibility_matches')
        .select('*')
        .or(`user1_profile_id.eq.${userProfileId},user2_profile_id.eq.${userProfileId}`)
        .order('compatibility_score', { ascending: false });

      if (matchType) {
        query = query.eq('match_type', matchType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching compatibility matches:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception fetching compatibility matches:', error);
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

  // Clean up expired codes
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