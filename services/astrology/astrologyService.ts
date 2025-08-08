// services/astrology/astrologyService.ts

import { supabase } from '../../lib/supabase';
import { SUPABASE_URL } from '@env';

export interface AstrologyReadingInput {
  user_id: string;
  name: string;
  date_of_birth: string; // YYYY-MM-DD
  time_of_birth?: string; // HH:mm
  place_of_birth: {
    city: string;
    state?: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  gender?: string;
  relationship_status?: string;
  focus_areas?: string[];
  struggles?: string;
  goals?: string;
}

export interface AstrologyReading {
  id: string;
  reading: string;
  chart_data: any;
  created_at: string;
}

class AstrologyService {
  /**
   * Generate a new personalized astrology reading
   */
  async generateReading(input: AstrologyReadingInput): Promise<AstrologyReading> {
    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User must be authenticated');
      }

      // Call the edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-astrology-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reading');
      }

      const data = await response.json();
      
      return {
        id: data.reading_id,
        reading: data.reading,
        chart_data: data.chart_data,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating astrology reading:', error);
      throw error;
    }
  }

  /**
   * Get all readings for the current user
   */
  async getUserReadings(): Promise<AstrologyReading[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('astrology_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(reading => ({
        id: reading.id,
        reading: reading.reading_result,
        chart_data: reading.chart_data,
        created_at: reading.created_at
      }));
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  }

  /**
   * Get a specific reading by ID
   */
  async getReading(readingId: string): Promise<AstrologyReading | null> {
    try {
      const { data, error } = await supabase
        .from('astrology_readings')
        .select('*')
        .eq('id', readingId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        reading: data.reading_result,
        chart_data: data.chart_data,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error fetching reading:', error);
      throw error;
    }
  }

  /**
   * Delete a reading
   */
  async deleteReading(readingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('astrology_readings')
        .delete()
        .eq('id', readingId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting reading:', error);
      return false;
    }
  }

  /**
   * Get user's birth chart data from the latest reading
   */
  async getUserBirthChart(): Promise<any | null> {
    try {
      const readings = await this.getUserReadings();
      
      if (readings.length === 0) return null;

      return readings[0].chart_data;
    } catch (error) {
      console.error('Error fetching birth chart:', error);
      return null;
    }
  }
}

export const astrologyService = new AstrologyService();