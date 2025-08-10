import { supabase } from '../../supabase/supabaseService';
import { ZodiacSign, calculateZodiacSign } from '../../utils/zodiac/calculator';

export interface HoroscopeContent {
  overallEnergy: string;
  loveRelationships: string;
  careerMoney: string;
  healthWellness: string;
  luckyColor: string;
  luckyNumber: number;
  bestTime: string;
}

export interface HoroscopeResult {
  date: string;
  sign: string;
  content: HoroscopeContent;
  zodiacInfo: ZodiacSign;
  generatedAt?: string;
}

export interface CompatibilityReportResult {
  sign1: string;
  sign2: string;
  score: number;
  description: string;
  element1: string;
  element2: string;
  recommendation: string;
  content: {
    overall: string;
    strengths: string[];
    challenges: string[];
    advice: string;
  };
  zodiac1: ZodiacSign;
  zodiac2: ZodiacSign;
  generatedAt: string;
}

export async function generateDailyHoroscope(birthDate: string | Date): Promise<HoroscopeResult> {
  try {
    const zodiacInfo = calculateZodiacSign(birthDate);
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have today's horoscope
    const { data: existingHoroscope } = await supabase
      .from('horoscopes')
      .select('*')
      .eq('sign', zodiacInfo.sign)
      .eq('date', today)
      .single();

    if (existingHoroscope) {
      return {
        date: today,
        sign: zodiacInfo.sign,
        content: existingHoroscope.content,
        zodiacInfo,
        generatedAt: existingHoroscope.created_at,
      };
    }

    // Generate new horoscope content
    const content: HoroscopeContent = {
      overallEnergy: generateHoroscopeText('overall', zodiacInfo.sign),
      loveRelationships: generateHoroscopeText('love', zodiacInfo.sign),
      careerMoney: generateHoroscopeText('career', zodiacInfo.sign),
      healthWellness: generateHoroscopeText('health', zodiacInfo.sign),
      luckyColor: getLuckyColor(zodiacInfo.sign),
      luckyNumber: getLuckyNumber(zodiacInfo.sign),
      bestTime: getBestTime(zodiacInfo.sign),
    };

    // Save to database
    const { data, error } = await supabase
      .from('horoscopes')
      .insert({
        sign: zodiacInfo.sign,
        date: today,
        content,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      date: today,
      sign: zodiacInfo.sign,
      content,
      zodiacInfo,
      generatedAt: data.created_at,
    };
  } catch (error) {
    console.error('Error generating daily horoscope:', error);
    throw error;
  }
}

export async function generateCompatibilityReport(
  birthDate1: string | Date,
  birthDate2: string | Date
): Promise<CompatibilityReportResult> {
  try {
    const zodiac1 = calculateZodiacSign(birthDate1);
    const zodiac2 = calculateZodiacSign(birthDate2);
    
    const compatibilityScore = calculateCompatibilityScore(zodiac1.sign, zodiac2.sign);
    
    const result: CompatibilityReportResult = {
      sign1: zodiac1.sign,
      sign2: zodiac2.sign,
      score: compatibilityScore,
      description: getCompatibilityDescription(compatibilityScore),
      element1: zodiac1.element,
      element2: zodiac2.element,
      recommendation: getCompatibilityRecommendation(zodiac1.sign, zodiac2.sign),
      content: {
        overall: generateCompatibilityOverall(zodiac1.sign, zodiac2.sign),
        strengths: generateCompatibilityStrengths(zodiac1.sign, zodiac2.sign),
        challenges: generateCompatibilityChallenges(zodiac1.sign, zodiac2.sign),
        advice: generateCompatibilityAdvice(zodiac1.sign, zodiac2.sign),
      },
      zodiac1,
      zodiac2,
      generatedAt: new Date().toISOString(),
    };

    // Save to database
    await supabase.from('compatibility_reports').insert({
      sign1: zodiac1.sign,
      sign2: zodiac2.sign,
      score: compatibilityScore,
      content: result.content,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    return result;
  } catch (error) {
    console.error('Error generating compatibility report:', error);
    throw error;
  }
}

export async function getHoroscopeHistory(limit: number = 30): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('horoscopes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching horoscope history:', error);
    throw error;
  }
}

// Add the missing function that was causing the error
export async function getDailyMoonGuidance(date?: Date): Promise<string> {
  try {
    // Implement moon phase calculation or fetch from an API
    const moonPhases = [
      'New Moon: Time for new beginnings and setting intentions',
      'Waxing Crescent: Focus on growth and taking action',
      'First Quarter: Overcome challenges and make decisions',
      'Waxing Gibbous: Refine and adjust your approach',
      'Full Moon: Celebration and manifestation time',
      'Waning Gibbous: Express gratitude and share wisdom',
      'Last Quarter: Release what no longer serves you',
      'Waning Crescent: Rest and prepare for renewal',
    ];
    
    // Simple calculation for demo - replace with actual moon phase calculation
    const dayOfMonth = (date || new Date()).getDate();
    const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
    
    return moonPhases[phaseIndex];
  } catch (error) {
    console.error('Error getting moon guidance:', error);
    return 'Connect with the lunar energy today';
  }
}

// Helper functions
function generateHoroscopeText(category: string, sign: string): string {
  // Implement your horoscope generation logic here
  // This is a placeholder implementation
  const templates = {
    overall: `Today brings positive energy for ${sign}...`,
    love: `In matters of the heart, ${sign} will find...`,
    career: `Professional opportunities await ${sign}...`,
    health: `Focus on your wellbeing today, ${sign}...`,
  };
  
  return templates[category] || 'Stay open to new possibilities today.';
}

function getLuckyColor(sign: string): string {
  const colors = {
    Aries: 'Red',
    Taurus: 'Green',
    Gemini: 'Yellow',
    Cancer: 'Silver',
    Leo: 'Gold',
    Virgo: 'Navy',
    Libra: 'Pink',
    Scorpio: 'Crimson',
    Sagittarius: 'Purple',
    Capricorn: 'Brown',
    Aquarius: 'Electric Blue',
    Pisces: 'Sea Green',
  };
  
  return colors[sign] || 'White';
}

function getLuckyNumber(sign: string): number {
  const numbers = {
    Aries: 9,
    Taurus: 6,
    Gemini: 5,
    Cancer: 2,
    Leo: 1,
    Virgo: 3,
    Libra: 7,
    Scorpio: 8,
    Sagittarius: 3,
    Capricorn: 4,
    Aquarius: 11,
    Pisces: 12,
  };
  
  return numbers[sign] || 7;
}

function getBestTime(sign: string): string {
  const times = {
    Aries: 'Early morning',
    Taurus: 'Mid-afternoon',
    Gemini: 'Late morning',
    Cancer: 'Evening',
    Leo: 'Noon',
    Virgo: 'Early afternoon',
    Libra: 'Sunset',
    Scorpio: 'Midnight',
    Sagittarius: 'Dawn',
    Capricorn: 'Business hours',
    Aquarius: 'Late night',
    Pisces: 'Twilight',
  };
  
  return times[sign] || 'Afternoon';
}

function calculateCompatibilityScore(sign1: string, sign2: string): number {
  // Implement your compatibility calculation logic
  // This is a simplified version
  const baseScore = 50;
  const sameElement = getElement(sign1) === getElement(sign2) ? 20 : 0;
  const compatibleElements = areElementsCompatible(getElement(sign1), getElement(sign2)) ? 15 : 0;
  
  return Math.min(100, baseScore + sameElement + compatibleElements + Math.floor(Math.random() * 15));
}

function getElement(sign: string): string {
  const elements = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
  };
  
  return elements[sign] || 'Unknown';
}

function areElementsCompatible(element1: string, element2: string): boolean {
  const compatibility = {
    Fire: ['Fire', 'Air'],
    Earth: ['Earth', 'Water'],
    Air: ['Air', 'Fire'],
    Water: ['Water', 'Earth'],
  };
  
  return compatibility[element1]?.includes(element2) || false;
}

function getCompatibilityDescription(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Compatibility';
  if (score >= 40) return 'Moderate Compatibility';
  return 'Challenging Match';
}

function getCompatibilityRecommendation(sign1: string, sign2: string): string {
  return `${sign1} and ${sign2} can build a strong relationship through mutual understanding and respect.`;
}

function generateCompatibilityOverall(sign1: string, sign2: string): string {
  return `The relationship between ${sign1} and ${sign2} has unique dynamics...`;
}

function generateCompatibilityStrengths(sign1: string, sign2: string): string[] {
  return [
    'Strong emotional connection',
    'Complementary skills and perspectives',
    'Shared values and goals',
  ];
}

function generateCompatibilityChallenges(sign1: string, sign2: string): string[] {
  return [
    'Different communication styles',
    'Varying energy levels',
    'Conflicting priorities at times',
  ];
}

function generateCompatibilityAdvice(sign1: string, sign2: string): string {
  return 'Focus on open communication and embrace your differences as opportunities for growth.';
}

// Add alias for backward compatibility
export const getDailyHoroscope = generateDailyHoroscope;