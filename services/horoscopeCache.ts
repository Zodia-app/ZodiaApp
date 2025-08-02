import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedContent {
  content: string;
  timestamp: string;
  sign?: string;
  type: 'horoscope' | 'moon' | 'ritual' | 'card';
}

// Cache keys
const CACHE_KEYS = {
  horoscope: (sign: string, date: string) => `horoscope_${sign}_${date}`,
  moon: (date: string) => `moon_${date}`,
  ritual: (sign: string, date: string) => `ritual_${sign}_${date}`,
  card: (date: string) => `card_${date}`,
};

// Generic cache functions
export const getCachedContent = async (
  key: string
): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const data: CachedContent = JSON.parse(cached);
      // Check if cache is from today
      const today = new Date().toDateString();
      if (data.timestamp === today) {
        return data.content;
      }
    }
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

export const setCachedContent = async (
  key: string,
  content: string,
  type: CachedContent['type'],
  sign?: string
): Promise<void> => {
  try {
    const data: CachedContent = {
      content,
      timestamp: new Date().toDateString(),
      type,
      sign
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

// Specific cache functions
export const getCachedHoroscope = async (
  sign: string,
  date: string
): Promise<string | null> => {
  const key = CACHE_KEYS.horoscope(sign, date);
  return getCachedContent(key);
};

export const setCachedHoroscope = async (
  sign: string,
  date: string,
  content: string
): Promise<void> => {
  const key = CACHE_KEYS.horoscope(sign, date);
  await setCachedContent(key, content, 'horoscope', sign);
};

export const getCachedMoonGuidance = async (
  date: string
): Promise<string | null> => {
  const key = CACHE_KEYS.moon(date);
  return getCachedContent(key);
};

export const setCachedMoonGuidance = async (
  date: string,
  content: string
): Promise<void> => {
  const key = CACHE_KEYS.moon(date);
  await setCachedContent(key, content, 'moon');
};

export const getCachedRitual = async (
  sign: string,
  date: string
): Promise<string | null> => {
  const key = CACHE_KEYS.ritual(sign, date);
  return getCachedContent(key);
};

export const setCachedRitual = async (
  sign: string,
  date: string,
  content: string
): Promise<void> => {
  const key = CACHE_KEYS.ritual(sign, date);
  await setCachedContent(key, content, 'ritual', sign);
};

// Clear old cache entries (call periodically)
export const clearOldCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const today = new Date().toDateString();
    
    const keysToDelete = keys.filter(key => {
      if (key.startsWith('horoscope_') || 
          key.startsWith('moon_') || 
          key.startsWith('ritual_') || 
          key.startsWith('card_')) {
        return !key.includes(today);
      }
      return false;
    });
    
    if (keysToDelete.length > 0) {
      await AsyncStorage.multiRemove(keysToDelete);
      console.log(`Cleared ${keysToDelete.length} old cache entries`);
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
};