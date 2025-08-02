// services/horoscope/horoscopeService.js

// Comment out the supabase import for now
// import { supabase } from 'lib/supabase.ts';

import { calculateZodiacSign, calculateCompatibility } from '../../utils/zodiac/calculator';

// Store AI prompts locally for now (later we'll move to Supabase Edge Functions)
const PROMPTS = {
  dailyHoroscope: (zodiacInfo, date) => ({
    system: 'You are an expert astrologer creating personalized daily horoscopes. Be positive, insightful, and specific.',
    user: `Create a daily horoscope for ${zodiacInfo.name} for ${date}.
    Traits: ${zodiacInfo.traits.join(', ')}
    Element: ${zodiacInfo.element}
    
    Format as:
    - Overall Energy: (2-3 sentences)
    - Love & Relationships: (2 sentences)
    - Career & Money: (2 sentences)
    - Health & Wellness: (1-2 sentences)
    - Lucky Color: [one color]
    - Lucky Number: [one number]
    - Best Time: [morning/afternoon/evening]`
  }),
  
  compatibility: (zodiac1, zodiac2) => ({
    system: 'You are an expert in astrological compatibility. Provide balanced, insightful analysis.',
    user: `Analyze compatibility between ${zodiac1.name} and ${zodiac2.name}.
    
    ${zodiac1.name} - Element: ${zodiac1.element}, Traits: ${zodiac1.traits.slice(0, 3).join(', ')}
    ${zodiac2.name} - Element: ${zodiac2.element}, Traits: ${zodiac2.traits.slice(0, 3).join(', ')}
    
    Provide:
    1. Overall Compatibility (1 paragraph)
    2. Strengths (3 bullet points)
    3. Challenges (3 bullet points)
    4. Advice for Success (1 paragraph)`
  })
};

/**
 * Generate daily horoscope using local calculation
 * Note: This is a placeholder that returns structured data
 * Later, integrate with OpenAI API via Supabase Edge Functions
 */
export async function generateDailyHoroscope(birthDate) {
  try {
    const zodiacInfo = calculateZodiacSign(birthDate);
    if (!zodiacInfo) {
      throw new Error('Invalid birth date');
    }
    
    const today = new Date().toLocaleDateString();
    
    // For now, return template data
    // TODO: Replace with actual OpenAI call via Supabase Edge Function
    const horoscopeContent = {
      date: today,
      sign: zodiacInfo.name,
      content: {
        overallEnergy: `As a ${zodiacInfo.name}, your ${zodiacInfo.element} energy is particularly strong today. The ${zodiacInfo.rulingPlanet} influence brings opportunities for ${zodiacInfo.traits[0]} actions.`,
        loveRelationships: `Your ${zodiacInfo.traits[1]} nature shines in relationships today. Connection with ${zodiacInfo.compatibleSigns[0]} and ${zodiacInfo.compatibleSigns[1]} signs will be especially harmonious.`,
        careerMoney: `Your ${zodiacInfo.traits[2]} approach serves you well professionally. Financial decisions benefit from your naturally ${zodiacInfo.traits[3]} perspective.`,
        healthWellness: `Channel your ${zodiacInfo.element} energy through physical activity. Balance is key to maintaining vitality.`,
        luckyColor: zodiacInfo.colors[0],
        luckyNumber: zodiacInfo.luckyNumbers[0],
        bestTime: zodiacInfo.element === 'Fire' || zodiacInfo.element === 'Air' ? 'morning' : 'evening'
      },
      zodiacInfo
    };
    
    // Store in Supabase for history - commented out for now
    // await storeHoroscope(birthDate, horoscopeContent);
    
    return horoscopeContent;
  } catch (error) {
    console.error('Error generating daily horoscope:', error);
    throw error;
  }
}

/**
 * Generate compatibility report
 */
export async function generateCompatibilityReport(birthDate1, birthDate2) {
  try {
    const zodiac1 = calculateZodiacSign(birthDate1);
    const zodiac2 = calculateZodiacSign(birthDate2);
    
    if (!zodiac1 || !zodiac2) {
      throw new Error('Invalid birth dates');
    }
    
    const compatibility = calculateCompatibility(zodiac1, zodiac2);
    
    // For now, return template data
    // TODO: Replace with actual OpenAI call
    const report = {
      ...compatibility,
      content: {
        overall: `The connection between ${zodiac1.name} and ${zodiac2.name} is ${compatibility.description}. With a compatibility score of ${compatibility.score}%, this pairing has ${compatibility.score >= 70 ? 'strong potential' : 'unique dynamics to navigate'}.`,
        strengths: [
          `${zodiac1.element} and ${zodiac2.element} elements create ${compatibility.score >= 70 ? 'natural harmony' : 'interesting contrasts'}`,
          `Both signs value ${findCommonTraits(zodiac1.traits, zodiac2.traits)}`,
          `Communication flows well when both embrace their differences`
        ],
        challenges: [
          `${zodiac1.name}'s ${zodiac1.traits[0]} nature may clash with ${zodiac2.name}'s ${zodiac2.traits[0]} approach`,
          `Different ${zodiac1.modality} and ${zodiac2.modality} modalities require understanding`,
          `Emotional expression styles may differ significantly`
        ],
        advice: `Success comes from appreciating each other's unique qualities. ${zodiac1.name} can learn ${zodiac2.traits[1]} from ${zodiac2.name}, while ${zodiac2.name} benefits from ${zodiac1.name}'s ${zodiac1.traits[2]} nature.`
      },
      zodiac1,
      zodiac2,
      generatedAt: new Date().toISOString()
    };
    
    return report;
  } catch (error) {
    console.error('Error generating compatibility report:', error);
    throw error;
  }
}

/**
 * Store horoscope in Supabase - COMMENTED OUT FOR NOW
 */
/*
async function storeHoroscope(birthDate, horoscope) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    
    const { error } = await supabase
      .from('horoscope_history')
      .insert({
        user_id: userData.user.id,
        zodiac_sign: horoscope.sign,
        horoscope_date: horoscope.date,
        content: horoscope.content,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error storing horoscope:', error);
    }
  } catch (error) {
    console.error('Error in storeHoroscope:', error);
  }
}
*/

/**
 * Get horoscope history from Supabase - RETURNS EMPTY ARRAY FOR NOW
 */
export async function getHoroscopeHistory(limit = 7) {
  // Return empty array for now since we don't have Supabase set up
  return [];
  
  /*
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];
    
    const { data, error } = await supabase
      .from('horoscope_history')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('horoscope_date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching horoscope history:', error);
    return [];
  }
  */
}

// Helper function
function findCommonTraits(traits1, traits2) {
  const common = traits1.filter(trait => 
    traits2.some(t => t.toLowerCase().includes(trait.toLowerCase().substring(0, 4)))
  );
  return common.length > 0 ? common[0] : 'authenticity and growth';
}