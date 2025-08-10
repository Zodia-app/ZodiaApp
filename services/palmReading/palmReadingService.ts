import { supabase } from '../../supabase/supabaseService';
import { PalmReadingFormData } from '../../types/palmReading';

export const palmReadingService = {
  async submitPalmReading(data: PalmReadingFormData) {
    try {
      // Upload images to Supabase storage
      const leftHandUrl = await this.uploadImage(data.leftHandImage!, 'left');
      const rightHandUrl = await this.uploadImage(data.rightHandImage!, 'right');

      // Save reading request
      const { data: reading, error } = await supabase
        .from('palm_reading_requests')
        .insert({
          user_id: data.id,
          name: data.name,
          date_of_birth: data.dateOfBirth,
          time_of_birth: data.timeOfBirth,
          place_of_birth_city: data.placeOfBirth.city,
          place_of_birth_state: data.placeOfBirth.state,
          place_of_birth_country: data.placeOfBirth.country,
          relationship_status: data.relationshipStatus,
          focus_areas: data.focusAreas,
          left_hand_image_url: leftHandUrl,
          right_hand_image_url: rightHandUrl,
          struggles: data.struggles,
          goals: data.goals,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return reading;
    } catch (error) {
      console.error('Error submitting palm reading:', error);
      throw error;
    }
  },

  async uploadImage(uri: string, hand: 'left' | 'right') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `palm-${Date.now()}-${hand}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('palm-images')
        .upload(fileName, blob);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('palm-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};