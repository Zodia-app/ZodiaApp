// services/openaiService.ts

// Temporarily bypass OpenAI to allow development without API key

// Fallback horoscopes for when OpenAI is not available
const getFallbackHoroscope = (sign: string): string => {
  const horoscopes: Record<string, string> = {
    'Aries': "Today brings fresh energy and new beginnings. Your natural leadership qualities shine bright, attracting opportunities in both personal and professional spheres. Trust your instincts when making decisions. A chance encounter could lead to an exciting collaboration. Focus on clear communication to avoid misunderstandings.",
    'Taurus': "Stability and comfort are your themes today. Your practical approach to challenges yields positive results. Financial matters look promising, but avoid impulsive purchases. In relationships, your loyalty and dedication strengthen bonds. Take time to appreciate the simple pleasures life offers.",
    'Gemini': "Your curiosity leads you to fascinating discoveries today. Communication flows effortlessly, making it an ideal time for important conversations. Embrace variety in your activities to satisfy your versatile nature. A creative solution to an old problem emerges. Stay adaptable as plans may shift.",
    'Cancer': "Emotional intelligence guides you to make wise choices today. Your nurturing nature attracts those seeking comfort and advice. Home and family matters take priority. Trust your intuition regarding a personal decision. Self-care isn't selfish—take time to recharge your emotional batteries.",
    'Leo': "Your charisma is at its peak, drawing admirers and opportunities your way. Creative projects flourish under your passionate attention. Leadership roles feel natural today. Remember to share the spotlight with others. A generous gesture creates lasting positive karma.",
    'Virgo': "Your attention to detail pays off in unexpected ways. Organization and planning set you up for future success. Health matters benefit from your analytical approach. Help others with your practical wisdom, but don't neglect your own needs. Perfection isn't always necessary.",
    'Libra': "Balance and harmony prevail in your interactions today. Your diplomatic skills resolve conflicts effortlessly. Partnerships, both romantic and professional, strengthen. Artistic pursuits bring joy and possibly recognition. Make decisions from a place of inner peace rather than external pressure.",
    'Scorpio': "Your intensity and passion drive transformative changes. Hidden truths may surface, offering clarity on complex situations. Trust your powerful intuition when navigating emotional waters. Financial investments show promise. Embrace vulnerability as a strength in close relationships.",
    'Sagittarius': "Adventure calls, and you're ready to answer. Your optimism inspires others to dream bigger. Learning opportunities expand your horizons. Travel plans or cultural experiences enrich your perspective. Share your wisdom generously, but remain open to new teachings.",
    'Capricorn': "Your determination moves mountains today. Professional achievements result from your consistent efforts. Take pride in your accomplishments while planning future goals. Practical matters require attention, but don't forget to celebrate small victories. Your reliability makes you invaluable to others.",
    'Aquarius': "Innovation and originality mark your approach to challenges. Your unique perspective offers solutions others miss. Community involvement brings satisfaction. Technology or humanitarian causes may feature prominently. Embrace your individuality while fostering meaningful connections.",
    'Pisces': "Your intuition and creativity flow abundantly. Artistic or spiritual pursuits provide deep fulfillment. Compassion for others opens doors to meaningful connections. Dreams offer insights—pay attention to their messages. Boundaries protect your sensitive nature while allowing you to help others."
  };

  return horoscopes[sign] || "The stars are aligning in your favor today. Trust your inner wisdom and embrace the opportunities that come your way.";
};

const generatePersonalizedHoroscope = async (
  sign: string,
  date: Date = new Date()
): Promise<string> => {
  // Use fallback horoscopes for now
  return getFallbackHoroscope(sign);
};

// Add the functions that DailyReport expects
const generateHoroscope = async (zodiacSign: string): Promise<string> => {
  return generatePersonalizedHoroscope(zodiacSign);
};

const generateMoonGuidance = async (): Promise<string> => {
  const moonPhases = [
    'The New Moon brings fresh beginnings. Set intentions for the month ahead.',
    'The Waxing Moon supports growth. Take action on your goals.',
    'The Full Moon illuminates truth. Release what no longer serves you.',
    'The Waning Moon invites reflection. Rest and recharge your energy.'
  ];
  
  return moonPhases[Math.floor(Math.random() * moonPhases.length)];
};

const generateRitual = async (): Promise<string> => {
  const rituals = [
    'Light a white candle and set three intentions for the day.',
    'Take a cleansing salt bath with lavender oil for relaxation.',
    'Write down three things you\'re grateful for in your journal.',
    'Meditate for 10 minutes focusing on your breath and inner peace.',
    'Create a small altar with crystals and flowers to honor your journey.'
  ];
  
  return rituals[Math.floor(Math.random() * rituals.length)];
};

const generateTarotGuidance = async (): Promise<{ card: string; meaning: string }> => {
  const tarotCards = [
    { card: 'The Fool', meaning: 'New beginnings and unlimited potential await. Take a leap of faith.' },
    { card: 'The Magician', meaning: 'You have all the tools you need to succeed. Focus your will.' },
    { card: 'The High Priestess', meaning: 'Trust your intuition. Hidden knowledge will be revealed.' },
    { card: 'The Empress', meaning: 'Abundance and creativity flow. Nurture your projects and relationships.' },
    { card: 'The Star', meaning: 'Hope and healing are on the horizon. Your wishes are manifesting.' }
  ];
  
  return tarotCards[Math.floor(Math.random() * tarotCards.length)];
};

// Export as an object to match the expected usage pattern
export const openaiService = {
  generateHoroscope,
  generateMoonGuidance,
  generateRitual,
  generateTarotGuidance,
  generatePersonalizedHoroscope
};

export default openaiService;