import { supabase } from '../supabase/supabaseService';

export interface SocialProfile {
  id: string;
  user_id: string;
  palm_reading_id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  bio?: string;
  dating_mode_enabled: boolean;
  friend_mode_enabled: boolean;
  social_mode_enabled: boolean;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_distance_km: number;
  created_at: string;
  updated_at: string;
  last_active: string;
}

export interface CreateSocialProfileData {
  palm_reading_id: string;
  name: string;
  age?: number;
  avatar_url?: string;
  bio?: string;
  dating_mode_enabled?: boolean;
  location_city?: string;
  location_state?: string;
  location_country?: string;
}

export interface UpdateSocialProfileData {
  name?: string;
  age?: number;
  avatar_url?: string;
  bio?: string;
  dating_mode_enabled?: boolean;
  friend_mode_enabled?: boolean;
  social_mode_enabled?: boolean;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_distance_km?: number;
}

export const socialProfileService = {
  // Create a new social profile
  async createProfile(profileData: CreateSocialProfileData): Promise<{ success: boolean; data?: SocialProfile; error?: string }> {
    try {
      console.log('Creating social profile:', profileData.name);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('social_profiles')
        .insert([
          {
            user_id: user.user.id,
            palm_reading_id: profileData.palm_reading_id,
            name: profileData.name,
            age: profileData.age,
            avatar_url: profileData.avatar_url,
            bio: profileData.bio,
            dating_mode_enabled: profileData.dating_mode_enabled || false,
            location_city: profileData.location_city,
            location_state: profileData.location_state,
            location_country: profileData.location_country,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating social profile:', error);
        return { success: false, error: error.message };
      }

      console.log('Social profile created successfully:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('Exception creating social profile:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get user's social profile
  async getProfile(): Promise<{ success: boolean; data?: SocialProfile; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return { success: false, error: 'Profile not found' };
        }
        console.error('Error fetching social profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception fetching social profile:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Update social profile
  async updateProfile(updates: UpdateSocialProfileData): Promise<{ success: boolean; data?: SocialProfile; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('social_profiles')
        .update(updates)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating social profile:', error);
        return { success: false, error: error.message };
      }

      console.log('Social profile updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Exception updating social profile:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Get dating profiles for matching
  async getDatingProfiles(filters?: {
    minAge?: number;
    maxAge?: number;
    city?: string;
    maxDistance?: number;
  }): Promise<{ success: boolean; data?: SocialProfile[]; error?: string }> {
    try {
      let query = supabase
        .from('social_profiles')
        .select('*')
        .eq('dating_mode_enabled', true)
        .order('last_active', { ascending: false });

      // Apply filters
      if (filters?.minAge) {
        query = query.gte('age', filters.minAge);
      }
      if (filters?.maxAge) {
        query = query.lte('age', filters.maxAge);
      }
      if (filters?.city) {
        query = query.eq('location_city', filters.city);
      }

      const { data, error } = await query.limit(50); // Limit results

      if (error) {
        console.error('Error fetching dating profiles:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Exception fetching dating profiles:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Upload avatar image
  async uploadAvatar(imageUri: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('Uploading avatar for user:', userId);

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileName = `avatars/${userId}/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('social-media')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('social-media')
        .getPublicUrl(fileName);

      console.log('Avatar uploaded successfully:', urlData.publicUrl);
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Exception uploading avatar:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Delete social profile
  async deleteProfile(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('social_profiles')
        .delete()
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error deleting social profile:', error);
        return { success: false, error: error.message };
      }

      console.log('Social profile deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Exception deleting social profile:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};