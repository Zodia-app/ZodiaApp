// services/astrology/astrologyService.ts

import { supabase } from '../../lib/supabase';

export interface AstrologyReadingInput {
  user_id: string;
  name: string;
  date_of_birth: string;
  time_of_birth?: string;
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

export const astrologyService = {
  async generateReading(input: AstrologyReadingInput) {
    try {
      // Call your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-astrology-reading', {
        body: input
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error calling edge function:', error);
      throw error;
    }
  },

  async getReading(readingId: string) {
    try {
      const { data, error } = await supabase
        .from('astrology_readings')
        .select('*')
        .eq('id', readingId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching reading:', error);
      throw error;
    }
  }
};