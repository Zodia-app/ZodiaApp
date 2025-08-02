import { generateHoroscope, generateMoonGuidance, generateDailyRitual } from '../openaiService';
import {
  getCachedHoroscope,
  setCachedHoroscope,
  getCachedMoonGuidance,
  setCachedMoonGuidance,
  getCachedRitual,
  setCachedRitual,
  clearOldCache
} from '../horoscopeCache';

// Main horoscope function with caching
export const getDailyHoroscope = async (
  sign: string,
  userData?: any
): Promise<string> => {
  const today = new Date().toDateString();
  
  // Check cache first
  const cached = await getCachedHoroscope(sign, today);
  if (cached) {
    console.log(`Returning cached horoscope for ${sign}`);
    return cached;
  }
  
  // Generate new horoscope
  console.log(`Generating new horoscope for ${sign}`);
  const horoscope = await generateHoroscope({
    sign,
    date: new Date(),
    userData
  });
  
  // Cache the result
  await setCachedHoroscope(sign, today, horoscope);
  
  // Clean up old cache entries
  clearOldCache();
  
  return horoscope;
};

// Moon guidance with caching
export const getDailyMoonGuidance = async (): Promise<string> => {
  const today = new Date().toDateString();
  
  const cached = await getCachedMoonGuidance(today);
  if (cached) {
    return cached;
  }
  
  const guidance = await generateMoonGuidance(new Date());
  await setCachedMoonGuidance(today, guidance);
  
  return guidance;
};

// Daily ritual with caching
export const getDailyRitual = async (sign: string): Promise<string> => {
  const today = new Date().toDateString();
  
  const cached = await getCachedRitual(sign, today);
  if (cached) {
    return cached;
  }
  
  const ritual = await generateDailyRitual(sign);
  await setCachedRitual(sign, today, ritual);
  
  return ritual;
};

// Tarot card (simple random selection for now)
export const getDailyCard = async (): Promise<{
  name: string;
  meaning: string;
}> => {
  const cards = [
    { name: "The Fool", meaning: "New beginnings and unlimited potential await you" },
    { name: "The Magician", meaning: "You have all the tools needed for success" },
    { name: "The High Priestess", meaning: "Trust your intuition and inner wisdom" },
    { name: "The Empress", meaning: "Abundance and nurturing energy surround you" },
    { name: "The Emperor", meaning: "Take charge and establish structure in your life" },
    { name: "The Hierophant", meaning: "Seek wisdom from tradition and mentors" },
    { name: "The Lovers", meaning: "Important choices in relationships are at hand" },
    { name: "The Chariot", meaning: "Victory comes through determination and will" },
    { name: "Strength", meaning: "Inner courage will overcome any challenge" },
    { name: "The Hermit", meaning: "Soul searching brings profound insights" },
    { name: "Wheel of Fortune", meaning: "Change brings new opportunities" },
    { name: "Justice", meaning: "Balance and fairness guide your path" },
    { name: "The Hanged Man", meaning: "A new perspective transforms your situation" },
    { name: "Death", meaning: "Transformation and renewal are beginning" },
    { name: "Temperance", meaning: "Patience and moderation bring harmony" },
    { name: "The Devil", meaning: "Break free from self-imposed limitations" },
    { name: "The Tower", meaning: "Sudden change clears the way for growth" },
    { name: "The Star", meaning: "Hope and inspiration light your way" },
    { name: "The Moon", meaning: "Navigate illusions with intuition" },
    { name: "The Sun", meaning: "Joy and success illuminate your path" },
    { name: "Judgement", meaning: "A fresh start and forgiveness await" },
    { name: "The World", meaning: "Completion and fulfillment are at hand" }
  ];
  
  // Use date as seed for consistent daily card
  const today = new Date();
  const seed = today.getFullYear() + today.getMonth() + today.getDate();
  const index = seed % cards.length;
  
  return cards[index];
};

// Batch preload function for better performance
export const preloadDailyContent = async (sign: string, userData?: any): Promise<void> => {
  try {
    await Promise.all([
      getDailyHoroscope(sign, userData),
      getDailyMoonGuidance(),
      getDailyRitual(sign),
      getDailyCard()
    ]);
    console.log('Daily content preloaded successfully');
  } catch (error) {
    console.error('Error preloading daily content:', error);
  }
};