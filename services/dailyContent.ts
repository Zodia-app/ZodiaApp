import { supabase } from '../lib/supabase';

export const generateDailyContent = async (zodiacSign: string, date: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-daily-content', {
      body: { zodiacSign, date }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating daily content:', error);
    throw error;
  }
};