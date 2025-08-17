import { supabase } from '../../supabase/supabaseService';
import { PalmReadingFormData } from '../../types/palmReading';

export const palmReadingService = {
  // Ensure user is authenticated
  async ensureAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, signing in anonymously...');
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('Anonymous sign in error:', error);
          throw error;
        }
        
        console.log('Successfully signed in anonymously');
        return data.session;
      }
      
      return session;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  async submitPalmReading(data: PalmReadingFormData) {
    try {
      // Ensure user is authenticated first
      const session = await this.ensureAuthenticated();
      
      // Convert images to base64 for the edge function
      const leftBase64 = await this.convertToBase64(data.leftHandImage!);
      const rightBase64 = await this.convertToBase64(data.rightHandImage!);

      console.log('Calling Supabase Edge Function for palm reading...');
      const payload = {
        leftPalmImage: leftBase64,
        rightPalmImage: rightBase64,
        userData: {
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          zodiacSign: data.zodiacSign || this.calculateZodiacSign(data.dateOfBirth)
        }
      };
      
      console.log('Function call payload userData:', JSON.stringify(payload.userData, null, 2));
      console.log('Left image base64 length:', leftBase64.length);
      console.log('Right image base64 length:', rightBase64.length);
      
      // Call the edge function to generate the palm reading
      const { data: readingResponse, error: functionError } = await supabase.functions.invoke('generate-palm-reading', {
        body: payload
      });

      console.log('Edge function response received');
      console.log('Function error:', functionError);
      console.log('Function response:', readingResponse);

      if (functionError) {
        console.error('Edge function error details:', JSON.stringify(functionError, null, 2));
        throw new Error(`Edge function failed: ${functionError.message || JSON.stringify(functionError)}`);
      }

      if (!readingResponse) {
        throw new Error('No response received from edge function');
      }

      console.log('Palm reading generated successfully');
      console.log('Reading response:', JSON.stringify(readingResponse, null, 2));
      console.log('Reading success:', readingResponse?.success);
      console.log('Reading basedOnActualImages:', readingResponse?.basedOnActualImages);
      console.log('Reading content type:', typeof readingResponse?.reading);

      // Skip image upload for now due to RLS policy issues
      console.log('Skipping image upload to avoid storage RLS issues');

      // Prepare the simplified database record
      const dbRecord = {
        user_id: session?.user?.id || 'anonymous',
        name: data.name,
        date_of_birth: data.dateOfBirth,
        time_of_birth: null, // No longer collected
        place_of_birth_city: null,
        place_of_birth_state: null,
        place_of_birth_country: null,
        gender: null, // No longer collected
        relationship_status: null, // No longer collected
        focus_areas: null,
        left_hand_image_url: null,
        right_hand_image_url: null,
        struggles: null,
        goals: null,
        reading_content: readingResponse?.reading || readingResponse,
        reading_metadata: readingResponse?.metadata || null,
        based_on_actual_images: readingResponse?.basedOnActualImages || true,
        status: 'completed'
      };

      console.log('Inserting database record:', JSON.stringify(dbRecord, null, 2));

      // Save the complete reading to database
      const { data: savedReading, error: dbError } = await supabase
        .from('palm_readings')
        .insert(dbRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Reading saved to database successfully');

      // Return both the reading content and the saved record
      return {
        ...savedReading,
        reading: readingResponse?.reading || readingResponse,
        success: true
      };

    } catch (error) {
      console.error('Error submitting palm reading:', error);
      throw error;
    }
  },

  async convertToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove the data:image/jpeg;base64, prefix
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  },

  calculateZodiacSign(dateOfBirth: string): string {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  }
};