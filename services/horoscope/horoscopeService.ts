// services/horoscope/horoscopeService.ts

import { openaiService } from '../openaiService';

// Get daily horoscope for a specific zodiac sign
export const getDailyHoroscope = async (zodiacSign: string, userData?: any): Promise<string> => {
  try {
    // Use the openaiService to generate horoscope
    return await openaiService.generateHoroscope(zodiacSign);
  } catch (error) {
    console.error('Error getting daily horoscope:', error);
    // Fallback horoscope
    return `Today is a day of new possibilities for ${zodiacSign}. Trust your instincts and embrace the opportunities that come your way.`;
  }
};

// Get daily moon guidance
export const getDailyMoonGuidance = async (): Promise<string> => {
  try {
    return await openaiService.generateMoonGuidance();
  } catch (error) {
    console.error('Error getting moon guidance:', error);
    return 'The moon\'s energy supports introspection and emotional clarity today.';
  }
};

// Get daily ritual suggestion
export const getDailyRitual = async (zodiacSign: string): Promise<string> => {
  try {
    return await openaiService.generateRitual();
  } catch (error) {
    console.error('Error getting daily ritual:', error);
    return 'Take a moment today to ground yourself with three deep breaths and set a positive intention.';
  }
};

// Get daily tarot or oracle card
export const getDailyCard = async (): Promise<{ name: string; meaning: string }> => {
  try {
    const guidance = await openaiService.generateTarotGuidance();
    return {
      name: guidance.card,
      meaning: guidance.meaning
    };
  } catch (error) {
    console.error('Error getting daily card:', error);
    return {
      name: 'The Star',
      meaning: 'Hope, renewal, and spiritual guidance light your path today.'
    };
  }
};

// Cache management functions (optional, for future use)
export const clearDailyCache = () => {
  // Implement cache clearing if needed
};

export const getCachedContent = (key: string) => {
  // Implement cache retrieval if needed
  return null;
};