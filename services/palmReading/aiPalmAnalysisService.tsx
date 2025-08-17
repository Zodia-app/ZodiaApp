import { supabase } from '../../supabase/supabaseService';

// NEVER put API keys in client code! This should only be in your Edge Function
// Remove this line and put the API key in your Edge Function environment variables

// Convert local images to base64
async function convertLocalImageToBase64(uri: string): Promise<string> {
  try {
    console.log('Converting local image to base64:', uri);
    
    // Check if it's already base64
    if (uri.startsWith('data:')) {
      return uri.split(',')[1]; // Return just the base64 part
    }
    
    // For file:// URIs on mobile
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract just the base64 part without the data:image prefix
        const base64Data = base64String.split(',')[1];
        console.log('Base64 conversion successful');
        resolve(base64Data);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting local image to base64:', error);
    throw error;
  }
}

// Ensure user is authenticated (anonymous if needed)
async function ensureAuth(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found, signing in anonymously...');
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Anonymous auth error:', error);
        return null;
      }
      
      return data.session?.user?.id || null;
    }
    
    return session.user.id;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function analyzeWithAI(userData: any, palmData: any) {
  try {
    // Validate input data
    if (!userData || !palmData) {
      throw new Error('Missing required data for palm reading');
    }

    console.log('Starting palm reading analysis...');
    
    // Ensure user is authenticated first
    const userId = await ensureAuth();
    if (!userId && !userData.id) {
      console.warn('No user ID available, reading will not be saved to database');
    }

    // Convert images to base64
    console.log('Converting palm images to base64...');
    const leftPalmBase64 = await convertLocalImageToBase64(palmData.leftPalmImage);
    const rightPalmBase64 = await convertLocalImageToBase64(palmData.rightPalmImage);
    console.log('Images converted successfully');

    // Call the Edge Function with correct parameter names
    console.log('Calling Supabase Edge Function for palm reading...');
    const { data, error } = await supabase.functions.invoke('generate-palm-reading', {
      body: {
        leftPalmImage: leftPalmBase64,  // Changed from palmData object
        rightPalmImage: rightPalmBase64, // Changed from palmData object
        userData: {
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender || 'not specified',
          relationshipStatus: userData.relationshipStatus || 'single',
          zodiacSign: userData.zodiacSign || getZodiacSign(new Date(userData.dateOfBirth))
        }
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    console.log('Received response from Supabase function');
    console.log('Success:', data?.success);
    console.log('Based on actual images:', data?.basedOnActualImages);

    // Process the response
    if (data && data.reading) {
      // Try to save to database
      if (userId || userData.id) {
        try {
          await saveToDatabase(
            userId || userData.id,
            userData,
            palmData,
            data.reading,
            data.metadata
          );
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Continue anyway - the reading was generated successfully
        }
      }
      
      return data.reading;
    }

    // If no reading returned, use fallback
    throw new Error('No reading generated from edge function');
    
  } catch (error: any) {
    console.error('Palm Reading Error:', error);
    
    // Return enhanced fallback response
    console.log('Using fallback palm reading due to error');
    const fallbackResponse = createEnhancedFallbackResponse(userData);
    
    // Try to save fallback to database
    const userId = await ensureAuth();
    if (userId || userData.id) {
      try {
        await saveToDatabase(
          userId || userData.id,
          userData,
          palmData,
          fallbackResponse,
          { fallback: true }
        );
      } catch (dbError) {
        console.error('Failed to save fallback to database:', dbError);
      }
    }
    
    return fallbackResponse;
  }
}

// Simplified database save function
async function saveToDatabase(
  userId: string,
  userData: any,
  palmData: any,
  reading: any,
  metadata: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('palm_readings')
      .insert({
        user_id: userId,
        name: userData.name,
        date_of_birth: userData.dateOfBirth,
        gender: userData.gender,
        relationship_status: userData.relationshipStatus,
        // zodiac_sign column doesn't exist in our table
        left_hand_image_url: palmData.leftPalmImage,
        right_hand_image_url: palmData.rightPalmImage,
        reading_content: reading,
        reading_metadata: metadata,
        based_on_actual_images: !metadata?.fallback,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    console.log('Successfully saved palm reading to database');
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

// Keep your existing helper functions
function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getZodiacSign(date: Date): string {
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

// Create enhanced fallback response
function createEnhancedFallbackResponse(userData: any): any {
  const age = calculateAge(userData.dateOfBirth);
  const firstName = userData.name.split(' ')[0];
  const zodiacSign = userData.zodiacSign || getZodiacSign(new Date(userData.dateOfBirth));
  
  return {
    greeting: `Dear ${firstName},\n\nWelcome to your personalized palm reading experience.`,
    
    mainReading: `As a ${age}-year-old ${zodiacSign}, your palms reveal a fascinating story of potential and growth. While we couldn't analyze your specific palm images at this moment, we can provide insights based on your astrological profile and life circumstances.

Your ${zodiacSign} nature brings unique strengths to your life path. At ${age}, you're at a significant point in your journey where experience meets opportunity.

${userData.relationshipStatus === 'single' ? 
  'Your relationship status indicates you\'re open to new connections. The universe often brings people into our lives when we\'re ready for growth.' :
  'Your relationship journey adds depth to your personal growth and shared experiences.'}

Remember, ${firstName}, your hands hold the power to shape your destiny. Every line tells a story, but more importantly, every action you take writes a new chapter.`,
    
    closing: {
      message: `May this reading provide guidance and inspiration for your journey ahead.`,
      signature: `With cosmic blessings,\n\nZodia\nYour Expert Astrologer & Master Palmist`,
      disclaimer: `This reading is for entertainment purposes only.`
    }
  };
}