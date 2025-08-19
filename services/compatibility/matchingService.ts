import { supabase } from '../../lib/supabase';
import { UserProfileService } from './userProfileService';
import { CompatibilityMatch, CompatibilityScores, CompatibilityAnalysis } from '../../types/compatibility';

export class MatchingService {
  
  /**
   * Create compatibility match between two users
   */
  static async createCompatibilityMatch(
    partnerProfileId: string,
    matchType: 'romantic' | 'friendship' | 'platonic'
  ): Promise<CompatibilityMatch> {
    try {
      // Get current user's profile
      const initiatorProfile = await UserProfileService.getProfile();
      if (!initiatorProfile) {
        throw new Error('Initiator profile not found');
      }

      // Get partner profile
      const { data: partnerProfile, error: partnerError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', partnerProfileId)
        .single();

      if (partnerError || !partnerProfile) {
        throw new Error('Partner profile not found');
      }

      // Get both users' palm readings
      const [initiatorReading, partnerReading] = await Promise.all([
        this.getPalmReading(initiatorProfile.palm_reading_id),
        this.getPalmReading(partnerProfile.palm_reading_id)
      ]);

      if (!initiatorReading || !partnerReading) {
        throw new Error('Palm readings not found for one or both users');
      }

      // Create initial match record
      const matchPayload = {
        initiator_id: initiatorProfile.id,
        partner_id: partnerProfile.id,
        match_type: matchType,
        status: 'pending' as const,
        initiator_reading: initiatorReading.reading_content,
        partner_reading: partnerReading.reading_content
      };

      const { data: match, error: matchError } = await supabase
        .from('compatibility_matches')
        .insert(matchPayload)
        .select('*')
        .single();

      if (matchError) {
        console.error('Error creating compatibility match:', matchError);
        throw matchError;
      }

      // Generate compatibility analysis using edge function
      const analysisResult = await this.generateCompatibilityAnalysis(
        initiatorReading.reading_content,
        partnerReading.reading_content,
        {
          name: initiatorProfile.name,
          age: this.calculateAge(initiatorProfile.date_of_birth),
          zodiacSign: this.getZodiacSign(initiatorProfile.date_of_birth)
        },
        {
          name: partnerProfile.name,
          age: this.calculateAge(partnerProfile.date_of_birth),
          zodiacSign: this.getZodiacSign(partnerProfile.date_of_birth)
        },
        matchType
      );

      // Update match with analysis results
      const updatePayload = {
        overall_score: analysisResult.compatibility_scores.overall_score,
        love_score: analysisResult.compatibility_scores.love_score,
        communication_score: analysisResult.compatibility_scores.communication_score,
        life_goals_score: analysisResult.compatibility_scores.life_goals_score,
        energy_score: analysisResult.compatibility_scores.energy_score,
        compatibility_analysis: analysisResult.analysis,
        status: 'completed' as const
      };

      const { data: updatedMatch, error: updateError } = await supabase
        .from('compatibility_matches')
        .update(updatePayload)
        .eq('id', match.id)
        .select(`
          *,
          initiator:user_profiles!compatibility_matches_initiator_id_fkey(*),
          partner:user_profiles!compatibility_matches_partner_id_fkey(*)
        `)
        .single();

      if (updateError) {
        console.error('Error updating match with analysis:', updateError);
        throw updateError;
      }

      return updatedMatch;
    } catch (error) {
      console.error('Create compatibility match error:', error);
      throw error;
    }
  }

  /**
   * Get compatibility match by ID
   */
  static async getCompatibilityMatch(matchId: string): Promise<CompatibilityMatch | null> {
    try {
      const { data, error } = await supabase
        .from('compatibility_matches')
        .select(`
          *,
          initiator:user_profiles!compatibility_matches_initiator_id_fkey(*),
          partner:user_profiles!compatibility_matches_partner_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching compatibility match:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Get compatibility match error:', error);
      throw error;
    }
  }

  /**
   * Share compatibility match
   */
  static async shareCompatibilityMatch(
    matchId: string,
    platform: 'tiktok' | 'instagram' | 'snapchat' | 'copy_link' | 'whatsapp' | 'other'
  ): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const profile = await UserProfileService.getProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Record the share
      const { error: shareError } = await supabase
        .from('compatibility_shares')
        .insert({
          match_id: matchId,
          platform,
          shared_by: profile.id
        });

      if (shareError) {
        console.error('Error recording share:', shareError);
        throw shareError;
      }

      // Update share count on match
      const { error: updateError } = await supabase
        .rpc('increment_share_count', { match_id: matchId });

      if (updateError) {
        console.error('Error updating share count:', updateError);
        // Don't throw here as the share was still recorded
      }
    } catch (error) {
      console.error('Share compatibility match error:', error);
      throw error;
    }
  }

  /**
   * Make compatibility match public
   */
  static async makeMatchPublic(matchId: string): Promise<CompatibilityMatch> {
    try {
      const { data, error } = await supabase
        .from('compatibility_matches')
        .update({ 
          is_public: true,
          status: 'shared'
        })
        .eq('id', matchId)
        .select(`
          *,
          initiator:user_profiles!compatibility_matches_initiator_id_fkey(*),
          partner:user_profiles!compatibility_matches_partner_id_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error making match public:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Make match public error:', error);
      throw error;
    }
  }

  /**
   * Get public compatibility matches for discovery
   */
  static async getPublicMatches(limit: number = 20): Promise<CompatibilityMatch[]> {
    try {
      const { data, error } = await supabase
        .from('compatibility_matches')
        .select(`
          *,
          initiator:user_profiles!compatibility_matches_initiator_id_fkey(*),
          partner:user_profiles!compatibility_matches_partner_id_fkey(*)
        `)
        .eq('is_public', true)
        .eq('status', 'shared')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching public matches:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get public matches error:', error);
      throw error;
    }
  }

  // Private helper methods
  private static async getPalmReading(palmReadingId?: string) {
    if (!palmReadingId) return null;

    const { data, error } = await supabase
      .from('palm_readings')
      .select('*')
      .eq('id', palmReadingId)
      .single();

    if (error) {
      console.error('Error fetching palm reading:', error);
      return null;
    }

    return data;
  }

  private static async generateCompatibilityAnalysis(
    initiatorReading: any,
    partnerReading: any,
    initiatorInfo: { name: string; age?: number; zodiacSign?: string },
    partnerInfo: { name: string; age?: number; zodiacSign?: string },
    matchType: 'romantic' | 'friendship' | 'platonic'
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-compatibility-match', {
        body: {
          initiator_reading: initiatorReading,
          partner_reading: partnerReading,
          initiator_info: initiatorInfo,
          partner_info: partnerInfo,
          match_type: matchType
        }
      });

      if (error) {
        console.error('Error calling compatibility function:', error);
        throw error;
      }

      return data.compatibility_result;
    } catch (error) {
      console.error('Generate compatibility analysis error:', error);
      throw error;
    }
  }

  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private static getZodiacSign(dateOfBirth: string): string {
    // Simple zodiac calculation - you can use your existing zodiacCalculator
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified zodiac calculation
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    
    return 'Unknown';
  }
}