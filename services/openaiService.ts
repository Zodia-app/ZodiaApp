import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - use server in production
});

export interface HoroscopeParams {
  sign: string;
  date: Date;
  userData?: {
    name?: string;
    birthDate?: string;
    relationshipStatus?: string;
    gender?: string;
  };
}

export const generateHoroscope = async ({
  sign,
  date,
  userData
}: HoroscopeParams): Promise<string> => {
  try {
    // Build personalized context
    const userContext = userData ? `
      User details for personalization:
      - Name: ${userData.name || 'User'}
      - Relationship status: ${userData.relationshipStatus || 'Not specified'}
      - Gender: ${userData.gender || 'Not specified'}
    ` : '';

    const prompt = `Generate a personalized daily horoscope for ${sign} on ${date.toDateString()}.
    ${userContext}
    
    Requirements:
    - Keep it mystical, positive, and empowering
    - Length: 100-150 words
    - Include specific insights for: Love/Relationships, Career/Money, and Health/Wellness
    - Use cosmic and astrological language
    - End with a lucky number between 1-99
    
    Format the response as a single paragraph of flowing text.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a mystical astrologer providing personalized daily horoscopes. Be specific, positive, and insightful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.8,
    });

    return completion.choices[0].message.content || getFallbackHoroscope(sign);
  } catch (error) {
    console.error('OpenAI Error:', error);
    return getFallbackHoroscope(sign);
  }
};

// Fallback horoscopes by element
const getFallbackHoroscope = (sign: string): string => {
  const fallbacks: { [key: string]: string } = {
    // Fire signs
    Aries: "Today brings dynamic energy to your pursuits. Your natural leadership shines in professional matters, while romance requires a gentle touch. Health thrives with physical activity. Lucky number: 7.",
    Leo: "Your charisma opens doors today. Creative projects flourish under your passionate approach. In love, generosity wins hearts. Prioritize rest for optimal wellness. Lucky number: 23.",
    Sagittarius: "Adventure calls your name today. New opportunities emerge through networking. Romance blooms through shared experiences. Balance activity with mindfulness. Lucky number: 42.",
    
    // Earth signs
    Taurus: "Stability meets opportunity today. Financial matters favor careful planning. Love deepens through meaningful gestures. Nourish your body with wholesome choices. Lucky number: 14.",
    Virgo: "Your attention to detail pays dividends. Work projects benefit from your methodical approach. In relationships, communication is key. Health improves through routine. Lucky number: 36.",
    Capricorn: "Ambitions align with cosmic energy. Professional advancement is within reach. Romance requires emotional availability. Physical wellness supports your goals. Lucky number: 58.",
    
    // Air signs
    Gemini: "Communication flows effortlessly today. Multiple opportunities require thoughtful choices. Love thrives on intellectual connection. Mental stimulation enhances wellbeing. Lucky number: 19.",
    Libra: "Harmony guides your interactions. Partnerships bring mutual benefits. Romance flourishes through balance and beauty. Self-care restores your equilibrium. Lucky number: 67.",
    Aquarius: "Innovation marks your path forward. Unique solutions emerge for work challenges. Unconventional approaches enhance romance. Community connections boost health. Lucky number: 84.",
    
    // Water signs
    Cancer: "Intuition guides important decisions. Home and family bring fulfillment. Emotional connections deepen in love. Nurture yourself with comfort and care. Lucky number: 28.",
    Scorpio: "Transformation energy surrounds you. Deep insights advance your goals. Passionate connections intensify romance. Emotional release brings healing. Lucky number: 45.",
    Pisces: "Creative inspiration flows abundantly. Artistic pursuits bring recognition. Compassion strengthens relationships. Spiritual practices enhance wellness. Lucky number: 92."
  };
  
  return fallbacks[sign] || "The stars align in your favor today. Embrace new opportunities with confidence. Lucky number: 11.";
};

// Additional content generators
export const generateMoonGuidance = async (date: Date): Promise<string> => {
  try {
    const prompt = `Generate a brief moon phase guidance for ${date.toDateString()}.
    Keep it under 50 words, mystical and actionable.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 80,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || getMoonPhaseFallback();
  } catch (error) {
    return getMoonPhaseFallback();
  }
};

export const generateDailyRitual = async (sign: string): Promise<string> => {
  try {
    const prompt = `Suggest a simple daily ritual for ${sign}.
    Make it practical, mystical, and can be done in 5 minutes.
    Keep it under 40 words.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 60,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || getRitualFallback(sign);
  } catch (error) {
    return getRitualFallback(sign);
  }
};

// Fallback functions
const getMoonPhaseFallback = (): string => {
  const phases = [
    "New Moon energy invites fresh beginnings. Set clear intentions tonight.",
    "Waxing Moon supports growth. Take action on your dreams.",
    "Full Moon illuminates truth. Release what no longer serves you.",
    "Waning Moon encourages reflection. Practice gratitude and let go."
  ];
  return phases[Math.floor(Math.random() * phases.length)];
};

const getRitualFallback = (sign: string): string => {
  // Get element from zodiac utilities
  const element = getElementForSign(sign);
  const rituals: { [key: string]: string } = {
    Fire: "Light a candle and speak your intentions aloud for 3 minutes.",
    Earth: "Hold a crystal while taking 5 deep, grounding breaths.",
    Air: "Write three gratitudes in your journal with mindful presence.",
    Water: "Cleanse your aura with a glass of moon-charged water."
  };
  return rituals[element] || rituals.Fire;
};

// Helper function (import from your zodiac utilities)
const getElementForSign = (sign: string): string => {
  const elements: { [key: string]: string } = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  return elements[sign] || 'Fire';
};