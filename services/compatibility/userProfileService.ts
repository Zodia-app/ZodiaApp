import { supabase } from '../../lib/supabase';
import { UserProfile, MatchInvitation, CompatibilityMatch, CreateMatchInviteRequest } from '../../types/compatibility';

export class UserProfileService {
  
  /**
   * Create or update user profile
   */
  static async createOrUpdateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const profilePayload = {
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profilePayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating/updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile service error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by user_id
   */
  static async getProfile(userId?: string): Promise<UserProfile | null> {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile by username:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Get profile by username error:', error);
      throw error;
    }
  }

  /**
   * Create match invitation
   */
  static async createMatchInvitation(request: CreateMatchInviteRequest): Promise<MatchInvitation> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the user's profile to ensure it exists
      const profile = await this.getProfile();
      if (!profile) {
        throw new Error('User profile not found. Please complete your profile first.');
      }

      const invitePayload = {
        from_user_id: profile.id,
        message: request.message,
        match_type: request.match_type,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const { data, error } = await supabase
        .from('match_invitations')
        .insert(invitePayload)
        .select(`
          *,
          from_user:user_profiles!match_invitations_from_user_id_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error creating match invitation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create match invitation error:', error);
      throw error;
    }
  }

  /**
   * Get match invitation by code
   */
  static async getMatchInvitation(inviteCode: string): Promise<MatchInvitation | null> {
    try {
      const { data, error } = await supabase
        .from('match_invitations')
        .select(`
          *,
          from_user:user_profiles!match_invitations_from_user_id_fkey(*),
          to_user:user_profiles!match_invitations_to_user_id_fkey(*)
        `)
        .eq('invite_code', inviteCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching match invitation:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Get match invitation error:', error);
      throw error;
    }
  }

  /**
   * Accept match invitation
   */
  static async acceptMatchInvitation(inviteCode: string): Promise<MatchInvitation> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user profile
      const profile = await this.getProfile();
      if (!profile) {
        throw new Error('User profile not found. Please complete your profile first.');
      }

      // Get the invitation
      const invitation = await this.getMatchInvitation(inviteCode);
      if (!invitation) {
        throw new Error('Invalid invitation code');
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation has already been used or expired');
      }

      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Update invitation
      const { data, error } = await supabase
        .from('match_invitations')
        .update({
          to_user_id: profile.id,
          status: 'accepted'
        })
        .eq('invite_code', inviteCode)
        .select(`
          *,
          from_user:user_profiles!match_invitations_from_user_id_fkey(*),
          to_user:user_profiles!match_invitations_to_user_id_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error accepting match invitation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Accept match invitation error:', error);
      throw error;
    }
  }

  /**
   * Get user's sent invitations
   */
  static async getSentInvitations(): Promise<MatchInvitation[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const profile = await this.getProfile();
      if (!profile) {
        return [];
      }

      const { data, error } = await supabase
        .from('match_invitations')
        .select(`
          *,
          from_user:user_profiles!match_invitations_from_user_id_fkey(*),
          to_user:user_profiles!match_invitations_to_user_id_fkey(*)
        `)
        .eq('from_user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent invitations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get sent invitations error:', error);
      throw error;
    }
  }

  /**
   * Get user's received invitations
   */
  static async getReceivedInvitations(): Promise<MatchInvitation[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const profile = await this.getProfile();
      if (!profile) {
        return [];
      }

      const { data, error } = await supabase
        .from('match_invitations')
        .select(`
          *,
          from_user:user_profiles!match_invitations_from_user_id_fkey(*),
          to_user:user_profiles!match_invitations_to_user_id_fkey(*)
        `)
        .eq('to_user_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received invitations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get received invitations error:', error);
      throw error;
    }
  }

  /**
   * Get user's compatibility matches
   */
  static async getCompatibilityMatches(): Promise<CompatibilityMatch[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const profile = await this.getProfile();
      if (!profile) {
        return [];
      }

      const { data, error } = await supabase
        .from('compatibility_matches')
        .select(`
          *,
          initiator:user_profiles!compatibility_matches_initiator_id_fkey(*),
          partner:user_profiles!compatibility_matches_partner_id_fkey(*)
        `)
        .or(`initiator_id.eq.${profile.id},partner_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching compatibility matches:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get compatibility matches error:', error);
      throw error;
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // Not found means available
        return true;
      }

      if (error) {
        console.error('Error checking username availability:', error);
        throw error;
      }

      // Found means not available
      return false;
    } catch (error) {
      console.error('Username availability check error:', error);
      throw error;
    }
  }
}