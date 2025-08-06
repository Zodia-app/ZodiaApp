// services/horoscope/horoscopeService.ts

import { calculateZodiacSign } from '../../utils/zodiac/calculator';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env'; // Make sure to add your API key to .env

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface DailyHoroscope {
  date: string;
  content: {
    overallEnergy: string;
    loveRelationships: string;
    careerMoney: string;
    healthWellness: string;
    luckyColor: string;
    luckyNumber: string;
    bestTime: string;
  };
  isAIGenerated?: boolean;
}

// Mock horoscope content - used as fallback when AI is not available
const horoscopeTemplates = {
  aries: {
    overallEnergy: "Your fiery energy is amplified today. Take initiative and lead with confidence.",
    loveRelationships: "Passion runs high in relationships. Express your feelings boldly but remember to listen.",
    careerMoney: "New opportunities arise. Your leadership skills will be recognized and rewarded.",
    healthWellness: "Channel your energy into physical activities. Avoid overexertion and stay hydrated."
  },
  taurus: {
    overallEnergy: "Stability and comfort guide your day. Focus on building lasting foundations.",
    loveRelationships: "Show affection through actions. Quality time with loved ones brings joy.",
    careerMoney: "Financial gains through steady effort. Avoid impulsive purchases.",
    healthWellness: "Indulge in self-care. A relaxing routine will rejuvenate your spirit."
  },
  gemini: {
    overallEnergy: "Communication flows effortlessly. Share your ideas and connect with others.",
    loveRelationships: "Intellectual connections deepen bonds. Engage in meaningful conversations.",
    careerMoney: "Networking opens doors. Multiple opportunities may present themselves.",
    healthWellness: "Mental stimulation is key. Balance social time with quiet reflection."
  },
  cancer: {
    overallEnergy: "Emotions run deep today. Trust your intuition and nurture yourself.",
    loveRelationships: "Create emotional security in relationships. Home and family take priority.",
    careerMoney: "Your caring nature benefits workplace relationships. Financial security improves.",
    healthWellness: "Emotional well-being affects physical health. Practice self-compassion."
  },
  leo: {
    overallEnergy: "Your natural charisma shines bright. Take center stage with confidence.",
    loveRelationships: "Romance flourishes. Grand gestures and heartfelt expressions win hearts.",
    careerMoney: "Creative projects gain recognition. Financial rewards follow your talents.",
    healthWellness: "Vitality is high. Engage in activities that make you feel alive."
  },
  virgo: {
    overallEnergy: "Attention to detail pays off. Organization and planning bring success.",
    loveRelationships: "Practical support strengthens bonds. Small gestures have big impact.",
    careerMoney: "Your analytical skills solve complex problems. Financial planning yields results.",
    healthWellness: "Health routines show benefits. Focus on nutrition and preventive care."
  },
  libra: {
    overallEnergy: "Balance and harmony prevail. Seek beauty and connection in all things.",
    loveRelationships: "Partnership energy is strong. Compromise and cooperation deepen love.",
    careerMoney: "Collaborative efforts succeed. Artistic pursuits may prove profitable.",
    healthWellness: "Find balance between activity and rest. Beauty treatments boost mood."
  },
  scorpio: {
    overallEnergy: "Transformation beckons. Embrace deep changes with courage.",
    loveRelationships: "Intensity in love matters. Deep connections and honest communication heal.",
    careerMoney: "Strategic moves pay off. Hidden opportunities come to light.",
    healthWellness: "Emotional release brings physical healing. Try transformative practices."
  },
  sagittarius: {
    overallEnergy: "Adventure calls your name. Expand your horizons and embrace freedom.",
    loveRelationships: "Shared adventures strengthen bonds. Give partners space to grow.",
    careerMoney: "International or educational pursuits bring rewards. Take calculated risks.",
    healthWellness: "Movement is medicine. Outdoor activities boost your spirit."
  },
  capricorn: {
    overallEnergy: "Ambition drives you forward. Set goals and climb steadily toward success.",
    loveRelationships: "Show love through commitment and reliability. Build for the future together.",
    careerMoney: "Career advancement likely. Long-term investments show promise.",
    healthWellness: "Structure in health routines pays off. Don't neglect rest and recovery."
  },
  aquarius: {
    overallEnergy: "Innovation and originality guide you. Think outside the box.",
    loveRelationships: "Friendship forms the foundation of love. Respect individuality in partnerships.",
    careerMoney: "Unconventional approaches succeed. Technology or humanitarian work prospers.",
    healthWellness: "Try alternative health practices. Mental stimulation enhances well-being."
  },
  pisces: {
    overallEnergy: "Intuition and creativity flow freely. Trust your inner wisdom.",
    loveRelationships: "Compassion and empathy deepen connections. Express feelings through art.",
    careerMoney: "Creative or spiritual pursuits bring fulfillment. Trust intuition in finances.",
    healthWellness: "Water activities heal. Meditation and artistic expression reduce stress."
  }
};

const luckyElements = {
  colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Turquoise', 'Gold', 'Silver'],
  numbers: ['3', '7', '9', '11', '13', '17', '21', '22', '27', '33'],
  times: ['Morning', 'Noon', 'Afternoon', 'Evening', 'Midnight', 'Dawn', 'Dusk']
};

// Generate basic daily horoscope (non-AI)
export const generateDailyHoroscope = async (birthDate: string | Date): Promise<DailyHoroscope> => {
  const zodiacSign = calculateZodiacSign(birthDate);
  const signKey = zodiacSign.name.toLowerCase();
  
  // Get base horoscope content
  const baseContent = horoscopeTemplates[signKey as keyof typeof horoscopeTemplates] || horoscopeTemplates.aries;
  
  // Generate "random" lucky elements based on date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const dateHash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const luckyColor = luckyElements.colors[dateHash % luckyElements.colors.length];
  const luckyNumber = luckyElements.numbers[dateHash % luckyElements.numbers.length];
  const bestTime = luckyElements.times[dateHash % luckyElements.times.length];
  
  return {
    date: today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    content: {
      ...baseContent,
      luckyColor,
      luckyNumber,
      bestTime
    },
    isAIGenerated: false
  };
};

// Generate AI-powered horoscope using OpenAI
export const generateAIHoroscope = async (userContext: any): Promise<any> => {
  try {
    // Create a detailed prompt for OpenAI
    const prompt = `Generate a personalized daily horoscope for ${userContext.name}, a ${userContext.zodiacSign} born on ${userContext.birthDate}.

Additional context:
- Element: ${userContext.element}
- Ruling Planet: ${userContext.rulingPlanet}
- Modality: ${userContext.modality}
${userContext.timeOfBirth ? `- Birth Time: ${userContext.timeOfBirth}` : ''}
${userContext.placeOfBirth ? `- Birth Place: ${userContext.placeOfBirth}` : ''}
${userContext.gender ? `- Gender: ${userContext.gender}` : ''}

Please provide a personalized horoscope with the following sections:
1. Overall Energy: A general overview of the day's energy and opportunities
2. Love & Relationships: Insights for romantic and personal relationships
3. Career & Money: Professional and financial guidance
4. Health & Wellness: Physical and mental health recommendations

Make it personal, insightful, and actionable. Each section should be 2-3 sentences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert astrologer with deep knowledge of zodiac signs, planetary influences, and cosmic energies. Provide insightful, positive, and actionable daily horoscopes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const aiResponse = completion.choices[0].message.content || '';
    
    // Parse the AI response into sections
    const sections = parseAIResponse(aiResponse);
    
    // Generate personalized lucky elements
    const personalizedLucky = generatePersonalizedLuckyElements(userContext);
    
    return {
      ...sections,
      ...personalizedLucky
    };
  } catch (error) {
    console.error('Error generating AI horoscope:', error);
    // Fallback to template-based horoscope
    const fallbackHoroscope = await generateDailyHoroscope(userContext.birthDate);
    return fallbackHoroscope.content;
  }
};

// Parse AI response into structured sections
const parseAIResponse = (response: string) => {
  const sections = {
    overallEnergy: '',
    loveRelationships: '',
    careerMoney: '',
    healthWellness: ''
  };

  // Simple parsing - can be improved with more sophisticated methods
  const lines = response.split('\n').filter(line => line.trim());
  
  let currentSection = '';
  for (const line of lines) {
    if (line.toLowerCase().includes('overall energy')) {
      currentSection = 'overallEnergy';
    } else if (line.toLowerCase().includes('love') || line.toLowerCase().includes('relationship')) {
      currentSection = 'loveRelationships';
    } else if (line.toLowerCase().includes('career') || line.toLowerCase().includes('money')) {
      currentSection = 'careerMoney';
    } else if (line.toLowerCase().includes('health') || line.toLowerCase().includes('wellness')) {
      currentSection = 'healthWellness';
    } else if (currentSection) {
      sections[currentSection] += line + ' ';
    }
  }

  // Clean up sections
  Object.keys(sections).forEach(key => {
    sections[key as keyof typeof sections] = sections[key as keyof typeof sections].trim();
  });

  // If parsing fails, use the entire response as overall energy
  if (!sections.overallEnergy && !sections.loveRelationships && !sections.careerMoney && !sections.healthWellness) {
    sections.overallEnergy = response;
    sections.loveRelationships = "Focus on open communication and emotional connection today.";
    sections.careerMoney = "Professional opportunities await. Stay focused on your goals.";
    sections.healthWellness = "Take time for self-care and mindful practices.";
  }

  return sections;
};

// Generate personalized lucky elements based on user context
const generatePersonalizedLuckyElements = (userContext: any) => {
  const zodiacColors = {
    aries: ['Red', 'Orange', 'Yellow'],
    taurus: ['Green', 'Pink', 'Blue'],
    gemini: ['Yellow', 'Silver', 'White'],
    cancer: ['Silver', 'White', 'Sea Green'],
    leo: ['Gold', 'Orange', 'Yellow'],
    virgo: ['Green', 'Brown', 'Navy'],
    libra: ['Pink', 'Blue', 'Green'],
    scorpio: ['Red', 'Black', 'Burgundy'],
    sagittarius: ['Purple', 'Turquoise', 'Red'],
    capricorn: ['Brown', 'Black', 'Green'],
    aquarius: ['Blue', 'Silver', 'Purple'],
    pisces: ['Sea Green', 'Purple', 'White']
  };

  const zodiacNumbers = {
    aries: [1, 9],
    taurus: [2, 6],
    gemini: [3, 5],
    cancer: [2, 7],
    leo: [1, 4],
    virgo: [5, 6],
    libra: [6, 7],
    scorpio: [4, 8],
    sagittarius: [3, 9],
    capricorn: [8, 10],
    aquarius: [4, 11],
    pisces: [7, 12]
  };

  const signKey = userContext.zodiacSign.toLowerCase();
  const colors = zodiacColors[signKey as keyof typeof zodiacColors] || ['Purple'];
  const numbers = zodiacNumbers[signKey as keyof typeof zodiacNumbers] || [7];

  // Select based on current date for variation
  const today = new Date();
  const colorIndex = today.getDate() % colors.length;
  const numberIndex = today.getDate() % numbers.length;

  return {
    luckyColor: colors[colorIndex],
    luckyNumber: numbers[numberIndex].toString(),
    bestTime: today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'
  };
};

// Generate weekly horoscope
export const generateWeeklyHoroscope = async (birthDate: string | Date): Promise<any> => {
  const dailyHoroscope = await generateDailyHoroscope(birthDate);
  return {
    weekStarting: new Date().toLocaleDateString(),
    overview: "This week brings opportunities for growth and transformation.",
    ...dailyHoroscope
  };
};

// Generate compatibility report
export const generateCompatibilityReport = async (sign1: string, sign2: string): Promise<any> => {
  const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
    aries: { aries: 50, taurus: 38, gemini: 83, cancer: 42, leo: 97, virgo: 63, libra: 85, scorpio: 50, sagittarius: 93, capricorn: 47, aquarius: 78, pisces: 67 },
    taurus: { aries: 38, taurus: 65, gemini: 33, cancer: 97, leo: 73, virgo: 90, libra: 65, scorpio: 88, sagittarius: 30, capricorn: 98, aquarius: 58, pisces: 85 },
    // ... Add complete compatibility matrix
  };

  const sign1Lower = sign1.toLowerCase();
  const sign2Lower = sign2.toLowerCase();
  
  const score = compatibilityMatrix[sign1Lower]?.[sign2Lower] || 
                compatibilityMatrix[sign2Lower]?.[sign1Lower] || 
                Math.floor(Math.random() * 40) + 60;

  return {
    sign1,
    sign2,
    compatibilityScore: score,
    analysis: `${sign1} and ${sign2} share ${score > 80 ? 'excellent' : score > 60 ? 'good' : 'moderate'} compatibility. Your signs ${score > 70 ? 'complement each other well' : 'can learn from each other'}.`
  };
};