// src/services/compatibilityService.ts

import { CompatibilityAnalysis } from '../types/compatibility';
import { getZodiacSign, getZodiacElement } from '../utils/zodiacUtils';

// Define the structure for AI response
interface AICompatibilityResponse {
  overallScore: number;
  sections: {
    emotional: { score: number; analysis: string };
    communication: { score: number; analysis: string };
    physical: { score: number; analysis: string };
    spiritual: { score: number; analysis: string };
    domestic: { score: number; analysis: string };
    financial: { score: number; analysis: string };
  };
  strengths: string[];
  challenges: string[];
  advice: string[];
}

/**
 * Main function to generate compatibility analysis
 * This will be called from your CompatibilityAnalysisScreen
 */
export const generateCompatibilityAnalysis = async (
  user1: { name: string; birthDate: string },
  user2: { name: string; birthDate: string }
): Promise<CompatibilityAnalysis> => {
  try {
    // Calculate zodiac signs
    const user1Sign = getZodiacSign(new Date(user1.birthDate));
    const user2Sign = getZodiacSign(new Date(user2.birthDate));
    
    // Get elements for additional compatibility logic
    const user1Element = getZodiacElement(user1Sign);
    const user2Element = getZodiacElement(user2Sign);
    
    // TODO: Replace with actual OpenAI call when Task #19 is complete
    // For now, use mock service
    const aiResponse = await mockOpenAICall({
      user1: { ...user1, zodiacSign: user1Sign, element: user1Element },
      user2: { ...user2, zodiacSign: user2Sign, element: user2Element }
    });
    
    // Parse and structure the response
    return parseAIResponse(aiResponse, {
      user1: { name: user1.name, zodiacSign: user1Sign, birthDate: user1.birthDate },
      user2: { name: user2.name, zodiacSign: user2Sign, birthDate: user2.birthDate }
    });
    
  } catch (error) {
    console.error('Error generating compatibility analysis:', error);
    throw new Error('Failed to generate compatibility analysis');
  }
};

/**
 * Generate the prompt template for OpenAI
 * This will be used by your partner in Task #20
 */
export const getCompatibilityPrompt = (
  user1: { name: string; zodiacSign: string; element: string },
  user2: { name: string; zodiacSign: string; element: string }
): string => {
  return `You are an expert astrologer providing deep, personalized compatibility analysis. 
  
Analyze the romantic compatibility between:
- ${user1.name}: ${user1.zodiacSign} (${user1.element} element)
- ${user2.name}: ${user2.zodiacSign} (${user2.element} element)

Provide a comprehensive analysis including:

1. Overall Compatibility Score (0-100)
2. Six Category Analyses with individual scores (0-100):
   - Emotional Connection: How well they understand each other's feelings
   - Communication Style: How effectively they exchange ideas
   - Physical Chemistry: Attraction and physical compatibility
   - Spiritual Alignment: Shared values and life philosophy
   - Domestic Harmony: Compatibility in daily life and home
   - Financial Compatibility: Money management and material goals

3. Three Main Strengths of this pairing
4. Three Potential Challenges they may face
5. Three Pieces of Actionable Advice

Consider:
- Element compatibility (${user1.element} + ${user2.element})
- Modality interactions (Cardinal, Fixed, Mutable)
- Traditional zodiac compatibility patterns
- Modern relationship dynamics

Format your response as JSON matching this structure:
{
  "overallScore": number,
  "sections": {
    "emotional": { "score": number, "analysis": "detailed text" },
    "communication": { "score": number, "analysis": "detailed text" },
    "physical": { "score": number, "analysis": "detailed text" },
    "spiritual": { "score": number, "analysis": "detailed text" },
    "domestic": { "score": number, "analysis": "detailed text" },
    "financial": { "score": number, "analysis": "detailed text" }
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "challenges": ["challenge1", "challenge2", "challenge3"],
  "advice": ["advice1", "advice2", "advice3"]
}

Keep the tone mystical yet practical, and make insights specific to these zodiac signs.`;
};

/**
 * Parse AI response and transform into app's data structure
 */
export const parseAIResponse = (
  aiResponse: AICompatibilityResponse,
  users: {
    user1: { name: string; zodiacSign: string; birthDate: string };
    user2: { name: string; zodiacSign: string; birthDate: string };
  }
): CompatibilityAnalysis => {
  // Transform AI sections into app format
  const sections = [
    {
      title: "Emotional Connection",
      content: aiResponse.sections.emotional.analysis,
      score: aiResponse.sections.emotional.score,
      icon: "heart"
    },
    {
      title: "Communication Style",
      content: aiResponse.sections.communication.analysis,
      score: aiResponse.sections.communication.score,
      icon: "message-circle"
    },
    {
      title: "Physical Chemistry",
      content: aiResponse.sections.physical.analysis,
      score: aiResponse.sections.physical.score,
      icon: "zap"
    },
    {
      title: "Spiritual Alignment",
      content: aiResponse.sections.spiritual.analysis,
      score: aiResponse.sections.spiritual.score,
      icon: "sparkles"
    },
    {
      title: "Domestic Harmony",
      content: aiResponse.sections.domestic.analysis,
      score: aiResponse.sections.domestic.score,
      icon: "home"
    },
    {
      title: "Financial Compatibility",
      content: aiResponse.sections.financial.analysis,
      score: aiResponse.sections.financial.score,
      icon: "trending-up"
    }
  ];
  
  return {
    user1: users.user1,
    user2: users.user2,
    overallScore: aiResponse.overallScore,
    sections,
    strengths: aiResponse.strengths,
    challenges: aiResponse.challenges,
    advice: aiResponse.advice,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Calculate element-based compatibility
 * Fire-Air and Earth-Water are traditionally compatible
 */
export const calculateElementCompatibility = (
  element1: string,
  element2: string
): { score: number; description: string } => {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    Fire: { Fire: 75, Earth: 45, Air: 85, Water: 55 },
    Earth: { Fire: 45, Earth: 80, Air: 50, Water: 85 },
    Air: { Fire: 85, Earth: 50, Air: 75, Water: 60 },
    Water: { Fire: 55, Earth: 85, Air: 60, Water: 80 }
  };
  
  const score = compatibilityMatrix[element1]?.[element2] || 50;
  
  let description = "";
  if (score >= 80) {
    description = "Excellent elemental harmony - you naturally understand each other";
  } else if (score >= 65) {
    description = "Good elemental balance - you complement each other well";
  } else if (score >= 50) {
    description = "Moderate elemental compatibility - requires understanding";
  } else {
    description = "Challenging elemental match - growth through differences";
  }
  
  return { score, description };
};

/**
 * Mock OpenAI call - Replace this when Task #19 is complete
 */
const mockOpenAICall = async (userData: any): Promise<AICompatibilityResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Calculate base scores using element compatibility
  const elementCompat = calculateElementCompatibility(
    userData.user1.element,
    userData.user2.element
  );
  
  // Generate mock response based on zodiac signs
  const baseScore = elementCompat.score;
  const variance = () => Math.floor(Math.random() * 20) - 10; // ±10 variance
  
  return {
    overallScore: Math.max(0, Math.min(100, baseScore + variance())),
    sections: {
      emotional: {
        score: Math.max(0, Math.min(100, baseScore + variance())),
        analysis: `As a ${userData.user1.zodiacSign} and ${userData.user2.zodiacSign} pairing, your emotional connection ${baseScore > 65 ? 'flows naturally' : 'requires conscious effort'}. ${userData.user1.name}'s ${userData.user1.element} nature ${baseScore > 65 ? 'harmonizes beautifully' : 'creates interesting dynamics'} with ${userData.user2.name}'s ${userData.user2.element} energy.`
      },
      communication: {
        score: Math.max(0, Math.min(100, baseScore + variance())),
        analysis: `Communication between ${userData.user1.zodiacSign} and ${userData.user2.zodiacSign} tends to be ${baseScore > 70 ? 'fluid and intuitive' : 'an area for growth'}. Your different elemental energies ${baseScore > 70 ? 'create a balanced dialogue' : 'offer opportunities to expand perspectives'}.`
      },
      physical: {
        score: Math.max(0, Math.min(100, baseScore + variance() + 5)),
        analysis: `The physical chemistry between a ${userData.user1.zodiacSign} and ${userData.user2.zodiacSign} is ${baseScore > 60 ? 'magnetic and exciting' : 'slow-burning but meaningful'}. Your ${userData.user1.element}-${userData.user2.element} combination creates ${baseScore > 60 ? 'sparks that keep the passion alive' : 'a deeper, more grounded attraction'}.`
      },
      spiritual: {
        score: Math.max(0, Math.min(100, baseScore + variance())),
        analysis: `Spiritually, ${userData.user1.name} and ${userData.user2.name} ${baseScore > 65 ? 'share a profound cosmic connection' : 'can learn much from each other\'s perspectives'}. Your signs offer ${baseScore > 65 ? 'complementary wisdom' : 'different but equally valid paths to enlightenment'}.`
      },
      domestic: {
        score: Math.max(0, Math.min(100, baseScore + variance() - 5)),
        analysis: `In domestic life, this ${userData.user1.zodiacSign}-${userData.user2.zodiacSign} match ${baseScore > 70 ? 'creates a harmonious home' : 'requires compromise and understanding'}. Your elemental differences ${baseScore > 70 ? 'bring balance to daily routines' : 'may require negotiation in household matters'}.`
      },
      financial: {
        score: Math.max(0, Math.min(100, baseScore + variance())),
        analysis: `Financially, ${userData.user1.zodiacSign} and ${userData.user2.zodiacSign} ${baseScore > 65 ? 'complement each other\'s money management styles' : 'approach resources from different angles'}. This ${baseScore > 65 ? 'creates a balanced financial partnership' : 'requires open communication about financial goals'}.`
      }
    },
    strengths: [
      `Your ${userData.user1.element}-${userData.user2.element} combination ${elementCompat.score > 70 ? 'creates natural harmony' : 'offers growth through contrast'}`,
      `${userData.user1.zodiacSign} brings ${getSignStrength(userData.user1.zodiacSign)} while ${userData.user2.zodiacSign} offers ${getSignStrength(userData.user2.zodiacSign)}`,
      "Together, you create a unique balance that can weather any cosmic storm"
    ],
    challenges: [
      `${userData.user1.element} and ${userData.user2.element} energies may sometimes ${elementCompat.score > 70 ? 'need conscious grounding' : 'clash without awareness'}`,
      `Different approaches to ${elementCompat.score > 70 ? 'expressing emotions' : 'life priorities'} require patience`,
      "Finding common ground in decision-making styles"
    ],
    advice: [
      `Embrace your elemental differences as opportunities for growth`,
      `Create rituals that honor both ${userData.user1.zodiacSign} and ${userData.user2.zodiacSign} energies`,
      "Regular communication about needs and boundaries strengthens your cosmic bond"
    ]
  };
};

/**
 * Helper function to get sign strengths for mock data
 */
const getSignStrength = (sign: string): string => {
  const strengths: Record<string, string> = {
    Aries: "bold leadership and passionate energy",
    Taurus: "steadfast loyalty and sensual grounding",
    Gemini: "intellectual stimulation and adaptability",
    Cancer: "emotional depth and nurturing care",
    Leo: "generous warmth and creative expression",
    Virgo: "practical wisdom and attention to detail",
    Libra: "harmonious balance and aesthetic beauty",
    Scorpio: "transformative intensity and deep loyalty",
    Sagittarius: "adventurous spirit and philosophical wisdom",
    Capricorn: "ambitious drive and structured support",
    Aquarius: "innovative thinking and humanitarian vision",
    Pisces: "intuitive empathy and artistic imagination"
  };
  return strengths[sign] || "unique qualities";
};

/**
 * Interface for future OpenAI service integration
 * This is what your partner will implement in Task #19
 */
export interface OpenAIService {
  generateContent(params: {
    type: 'compatibility';
    prompt: string;
    model: 'gpt-4o-mini';
    maxTokens: number;
  }): Promise<AICompatibilityResponse>;
}

// Export for use in screens
export default {
  generateCompatibilityAnalysis,
  getCompatibilityPrompt,
  parseAIResponse,
  calculateElementCompatibility
};