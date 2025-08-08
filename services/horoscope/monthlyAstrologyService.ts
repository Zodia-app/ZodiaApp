// services/horoscope/monthlyAstrologyService.ts

import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';
import { calculateZodiacSign } from '../../utils/zodiac/calculator';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface UserProfile {
  id: string;
  firstName: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
  relationshipStatus?: string;
  currentGoals?: string[];
  currentStruggles?: string[];
  zodiacSign?: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  overview: string;
  love: {
    single?: string;
    relationship?: string;
    advice: string;
  };
  career: {
    opportunities: string;
    challenges: string;
    advice: string;
  };
  health: {
    physical: string;
    mental: string;
    recommendations: string;
  };
  finance: {
    overview: string;
    opportunities: string;
    warnings: string;
  };
  spirituality: {
    growth: string;
    practices: string;
  };
  keyDates: {
    date: string;
    significance: string;
  }[];
  monthlyAffirmation: string;
  luckyElements: {
    colors: string[];
    numbers: number[];
    days: string[];
    crystals: string[];
  };
  personalMessage: string;
}

export const generateMonthlyAstrologyReport = async (userProfile: UserProfile): Promise<MonthlyReport> => {
  try {
    // Calculate zodiac info if not provided
    const zodiacInfo = userProfile.zodiacSign ? 
      { name: userProfile.zodiacSign } : 
      calculateZodiacSign(userProfile.birthDate);

    // Get first name from full name
    const firstName = userProfile.firstName || userProfile.fullName.split(' ')[0];

    // Format current month and year
    const currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    // Create comprehensive prompt with all user data
    const prompt = `Generate a comprehensive, personalized monthly astrology report for ${firstName}.

USER PROFILE:
- Full Name: ${userProfile.fullName}
- First Name: ${firstName} (use this to address them)
- Zodiac Sign: ${zodiacInfo.name}
- Birth Date: ${userProfile.birthDate}
${userProfile.birthTime ? `- Birth Time: ${userProfile.birthTime}` : ''}
${userProfile.birthPlace ? `- Birth Place: ${userProfile.birthPlace}` : ''}
${userProfile.gender ? `- Gender: ${userProfile.gender}` : ''}
${userProfile.relationshipStatus ? `- Relationship Status: ${userProfile.relationshipStatus}` : ''}
${userProfile.currentGoals?.length ? `- Current Goals: ${userProfile.currentGoals.join(', ')}` : ''}
${userProfile.currentStruggles?.length ? `- Current Struggles: ${userProfile.currentStruggles.join(', ')}` : ''}

REPORT REQUIREMENTS:
1. Month: ${currentMonth} ${currentYear}
2. Address the user by their first name (${firstName}) throughout the report
3. Make it deeply personal based on their profile data
4. Reference their specific goals and struggles where relevant
5. Consider their relationship status for love predictions
6. Sign the report as "Zodia" at the end

Please provide a detailed monthly forecast with the following sections:

1. MONTHLY OVERVIEW: A warm, personal introduction addressing ${firstName} directly, summarizing the month's energy and key themes (3-4 paragraphs)

2. LOVE & RELATIONSHIPS: 
   - If single: Dating opportunities and self-love focus
   - If in relationship: Relationship dynamics and growth
   - General advice for all

3. CAREER & PURPOSE:
   - Professional opportunities
   - Challenges to navigate
   - Actionable advice

4. HEALTH & WELLNESS:
   - Physical health insights
   - Mental/emotional wellbeing
   - Specific recommendations

5. FINANCE & ABUNDANCE:
   - Financial overview
   - Opportunities for growth
   - Warnings or cautions

6. SPIRITUAL GROWTH:
   - Spiritual development themes
   - Recommended practices

7. KEY DATES: List 4-5 specific dates with significance

8. MONTHLY AFFIRMATION: A personalized affirmation for ${firstName}

9. PERSONAL MESSAGE: A warm, encouraging closing message from Zodia

Make the tone warm, wise, and encouraging. Be specific and actionable. Reference astrological transits when relevant but keep it accessible.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Zodia, a wise, compassionate, and insightful astrologer with deep knowledge of the cosmos. You provide personalized, actionable guidance while maintaining a warm, encouraging tone. You address users by their first name and sign your messages as 'Zodia'."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const aiResponse = completion.choices[0].message.content || '';
    
    // Parse the AI response into structured format
    const report = parseMonthlyReport(aiResponse, firstName, currentMonth, currentYear);
    
    // Add personalized lucky elements based on zodiac
    report.luckyElements = generateMonthlyLuckyElements(zodiacInfo.name);
    
    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    // Return a fallback report
    return generateFallbackMonthlyReport(userProfile);
  }
};

const parseMonthlyReport = (aiResponse: string, firstName: string, month: string, year: number): MonthlyReport => {
  // This is a simplified parser - you might want to make it more sophisticated
  const sections = {
    overview: '',
    love: { single: '', relationship: '', advice: '' },
    career: { opportunities: '', challenges: '', advice: '' },
    health: { physical: '', mental: '', recommendations: '' },
    finance: { overview: '', opportunities: '', warnings: '' },
    spirituality: { growth: '', practices: '' },
    keyDates: [] as { date: string; significance: string }[],
    monthlyAffirmation: '',
    personalMessage: ''
  };

  // Parse the AI response into sections
  // This is a basic implementation - enhance based on your needs
  const lines = aiResponse.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('overview') || lowerLine.includes('introduction')) {
      currentSection = 'overview';
    } else if (lowerLine.includes('love') || lowerLine.includes('relationship')) {
      currentSection = 'love';
    } else if (lowerLine.includes('career') || lowerLine.includes('purpose')) {
      currentSection = 'career';
    } else if (lowerLine.includes('health') || lowerLine.includes('wellness')) {
      currentSection = 'health';
    } else if (lowerLine.includes('finance') || lowerLine.includes('abundance')) {
      currentSection = 'finance';
    } else if (lowerLine.includes('spiritual') || lowerLine.includes('growth')) {
      currentSection = 'spirituality';
    } else if (lowerLine.includes('key dates') || lowerLine.includes('important dates')) {
      currentSection = 'keyDates';
    } else if (lowerLine.includes('affirmation')) {
      currentSection = 'affirmation';
    } else if (lowerLine.includes('personal message') || line.includes('Zodia')) {
      currentSection = 'personalMessage';
    }
    
    // Add content to appropriate section
    if (currentSection && line.trim()) {
      switch (currentSection) {
        case 'overview':
          sections.overview += line + '\n';
          break;
        case 'love':
          sections.love.advice += line + '\n';
          break;
        case 'career':
          sections.career.opportunities += line + '\n';
          break;
        case 'health':
          sections.health.physical += line + '\n';
          break;
        case 'finance':
          sections.finance.overview += line + '\n';
          break;
        case 'spirituality':
          sections.spirituality.growth += line + '\n';
          break;
        case 'affirmation':
          sections.monthlyAffirmation += line + ' ';
          break;
        case 'personalMessage':
          sections.personalMessage += line + '\n';
          break;
      }
    }
  }

  // Clean up sections
  Object.keys(sections).forEach(key => {
    if (typeof sections[key as keyof typeof sections] === 'string') {
      (sections as any)[key] = (sections as any)[key].trim();
    }
  });

  // Generate some key dates if not parsed
  if (sections.keyDates.length === 0) {
    sections.keyDates = generateKeyDates(month, year);
  }

  return {
    month,
    year,
    ...sections,
    luckyElements: {
      colors: [],
      numbers: [],
      days: [],
      crystals: []
    }
  };
};

const generateKeyDates = (month: string, year: number): { date: string; significance: string }[] => {
  // Generate some meaningful dates for the month
  const dates = [
    { date: `${month} 7`, significance: "New moon - Perfect for setting intentions" },
    { date: `${month} 14`, significance: "High energy day for career moves" },
    { date: `${month} 21`, significance: "Full moon - Release what no longer serves" },
    { date: `${month} 28`, significance: "Lucky day for love and connections" }
  ];
  return dates;
};

const generateMonthlyLuckyElements = (zodiacSign: string) => {
  const zodiacLucky = {
    aries: {
      colors: ['Red', 'Orange', 'Yellow'],
      numbers: [1, 9, 19],
      days: ['Tuesday', 'Saturday'],
      crystals: ['Carnelian', 'Red Jasper']
    },
    taurus: {
      colors: ['Green', 'Pink', 'Earth tones'],
      numbers: [2, 6, 20],
      days: ['Friday', 'Monday'],
      crystals: ['Rose Quartz', 'Emerald']
    },
    gemini: {
      colors: ['Yellow', 'Silver', 'Light Blue'],
      numbers: [3, 5, 23],
      days: ['Wednesday', 'Sunday'],
      crystals: ['Citrine', 'Clear Quartz']
    },
    cancer: {
      colors: ['Silver', 'White', 'Sea Green'],
      numbers: [2, 7, 16],
      days: ['Monday', 'Thursday'],
      crystals: ['Moonstone', 'Pearl']
    },
    leo: {
      colors: ['Gold', 'Orange', 'Royal Purple'],
      numbers: [1, 4, 19],
      days: ['Sunday', 'Tuesday'],
      crystals: ['Sunstone', 'Tiger\'s Eye']
    },
    virgo: {
      colors: ['Navy', 'Forest Green', 'Brown'],
      numbers: [5, 6, 15],
      days: ['Wednesday', 'Saturday'],
      crystals: ['Moss Agate', 'Amazonite']
    },
    libra: {
      colors: ['Pink', 'Light Blue', 'Lavender'],
      numbers: [6, 7, 24],
      days: ['Friday', 'Sunday'],
      crystals: ['Rose Quartz', 'Lapis Lazuli']
    },
    scorpio: {
      colors: ['Black', 'Burgundy', 'Deep Red'],
      numbers: [4, 8, 18],
      days: ['Tuesday', 'Thursday'],
      crystals: ['Obsidian', 'Malachite']
    },
    sagittarius: {
      colors: ['Purple', 'Turquoise', 'Red'],
      numbers: [3, 9, 21],
      days: ['Thursday', 'Sunday'],
      crystals: ['Turquoise', 'Amethyst']
    },
    capricorn: {
      colors: ['Black', 'Brown', 'Dark Green'],
      numbers: [8, 10, 22],
      days: ['Saturday', 'Tuesday'],
      crystals: ['Garnet', 'Black Tourmaline']
    },
    aquarius: {
      colors: ['Electric Blue', 'Silver', 'Purple'],
      numbers: [4, 11, 22],
      days: ['Saturday', 'Wednesday'],
      crystals: ['Amethyst', 'Aquamarine']
    },
    pisces: {
      colors: ['Sea Green', 'Lavender', 'Silver'],
      numbers: [7, 12, 29],
      days: ['Thursday', 'Monday'],
      crystals: ['Aquamarine', 'Fluorite']
    }
  };

  const signKey = zodiacSign.toLowerCase();
  return zodiacLucky[signKey as keyof typeof zodiacLucky] || zodiacLucky.aries;
};

const generateFallbackMonthlyReport = (userProfile: UserProfile): MonthlyReport => {
  const firstName = userProfile.firstName || userProfile.fullName.split(' ')[0];
  const currentDate = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return {
    month: currentMonth,
    year: currentYear,
    overview: `Dear ${firstName}, this month brings powerful opportunities for growth and transformation. The cosmic energies are aligning to support your journey.`,
    love: {
      advice: "Focus on authentic connections and open communication."
    },
    career: {
      opportunities: "New doors are opening in your professional life.",
      challenges: "Stay patient with delays and trust the timing.",
      advice: "Take bold steps toward your goals."
    },
    health: {
      physical: "Prioritize rest and gentle movement.",
      mental: "Practice mindfulness and self-compassion.",
      recommendations: "Establish a consistent wellness routine."
    },
    finance: {
      overview: "Financial stability is within reach.",
      opportunities: "Look for unexpected income sources.",
      warnings: "Avoid impulsive purchases mid-month."
    },
    spirituality: {
      growth: "Your intuition is heightened this month.",
      practices: "Meditation and journaling will bring clarity."
    },
    keyDates: generateKeyDates(currentMonth, currentYear),
    monthlyAffirmation: `I am ${firstName}, and I trust in the divine timing of my life.`,
    luckyElements: generateMonthlyLuckyElements(userProfile.zodiacSign || 'aries'),
    personalMessage: `${firstName}, remember that you are exactly where you need to be. Trust your journey and embrace the magic that awaits. With cosmic love, Zodia`
  };
};