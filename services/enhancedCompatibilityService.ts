// Enhanced Compatibility Service
// Integrates palm reading with astrological birth data (including optional birth time)

import { AstroPalmIntegrationService } from './astroPalmIntegration';
import { EnhancedUserData, EnhancedCompatibilityAnalysis, ZodiacProfile } from '../types/astrology';

export class EnhancedCompatibilityService {
  
  /**
   * Generate comprehensive compatibility analysis combining palm reading and astrology
   * @param user1 First user's data (including optional birth time)
   * @param user2 Second user's data (including optional birth time) 
   * @param user1PalmReading First user's palm reading analysis
   * @param user2PalmReading Second user's palm reading analysis
   * @returns Enhanced compatibility analysis with cross-correlations
   */
  static async generateEnhancedCompatibility(
    user1: EnhancedUserData,
    user2: EnhancedUserData,
    user1PalmReading: any,
    user2PalmReading: any
  ): Promise<EnhancedCompatibilityAnalysis> {
    
    console.log('🔮 Generating enhanced compatibility analysis...');
    console.log(`User 1: ${user1.name} (${user1.dateOfBirth}${user1.timeOfBirth ? ` at ${user1.timeOfBirth}` : ''})`);
    console.log(`User 2: ${user2.name} (${user2.dateOfBirth}${user2.timeOfBirth ? ` at ${user2.timeOfBirth}` : ''})`);
    
    // Calculate enhanced astrological profiles
    user1.astrologicalProfile = AstroPalmIntegrationService.calculateAstrologicalProfile(user1);
    user2.astrologicalProfile = AstroPalmIntegrationService.calculateAstrologicalProfile(user2);
    
    // Generate comprehensive analysis
    const enhancedAnalysis = AstroPalmIntegrationService.generateEnhancedCompatibilityAnalysis(
      user1,
      user2,
      user1PalmReading,
      user2PalmReading
    );
    
    // Add time-specific insights if birth times are available
    if (user1.timeOfBirth && user2.timeOfBirth) {
      enhancedAnalysis.enhancedInsights.timeBasedInsights = this.getTimeBasedInsights(user1, user2);
      enhancedAnalysis.relationshipAdvice.timingConsiderations = this.getTimingConsiderations(user1, user2);
    }
    
    console.log(`✅ Enhanced compatibility calculated: ${enhancedAnalysis.overallScore}%`);
    return enhancedAnalysis;
  }

  /**
   * Generate AI prompt for OpenAI that includes both palm and astrological data
   */
  static generateEnhancedCompatibilityPrompt(
    user1: EnhancedUserData,
    user2: EnhancedUserData,
    user1PalmReading: any,
    user2PalmReading: any,
    baseAnalysis: EnhancedCompatibilityAnalysis
  ): string {
    
    const user1TimeInfo = user1.timeOfBirth ? 
      `born at ${user1.timeOfBirth} (enabling rising sign and house calculations)` : 
      'birth time not provided (sun sign analysis only)';
      
    const user2TimeInfo = user2.timeOfBirth ? 
      `born at ${user2.timeOfBirth} (enabling rising sign and house calculations)` : 
      'birth time not provided (sun sign analysis only)';

    return `Bestie, it's time to serve up the most ICONIC compatibility analysis that combines BOTH palm reading AND astrology! 💅✨ This is next-level relationship analysis - think cosmic palm reader meets astrology bestie!

USER 1 - ${user1.name}:
🎂 Born: ${user1.dateOfBirth} (${user1TimeInfo})
⭐ Zodiac: ${user1.astrologicalProfile?.sunSign || 'Unknown'}
📍 Location: ${user1.placeOfBirth?.city || 'Unknown'}, ${user1.placeOfBirth?.country || 'Unknown'}

PALM ANALYSIS FOR ${user1.name.toUpperCase()}:
${JSON.stringify(user1PalmReading, null, 2)}

USER 2 - ${user2.name}:
🎂 Born: ${user2.dateOfBirth} (${user2TimeInfo})
⭐ Zodiac: ${user2.astrologicalProfile?.sunSign || 'Unknown'}  
📍 Location: ${user2.placeOfBirth?.city || 'Unknown'}, ${user2.placeOfBirth?.country || 'Unknown'}

PALM ANALYSIS FOR ${user2.name.toUpperCase()}:
${JSON.stringify(user2PalmReading, null, 2)}

ENHANCED COMPATIBILITY FRAMEWORK:
🌟 Overall Compatibility Score: ${baseAnalysis.overallScore}%
🔮 Astrological Compatibility: ${baseAnalysis.astrologicalCompatibility.score}%
🤲 Palm Reading Compatibility: ${baseAnalysis.palmReadingCompatibility.score}%
✨ Cross-Correlation Score: ${baseAnalysis.palmAstroCorrelations.score}%

COSMIC CORRELATION INSIGHTS:
${baseAnalysis.palmAstroCorrelations.correlations.join(', ')}

${user1.timeOfBirth && user2.timeOfBirth ? `
🕐 ENHANCED TIME-BASED ANALYSIS AVAILABLE:
Both users provided birth times - include rising signs, moon signs, and house compatibility analysis for deeper insights!
` : `
⏰ BASIC ASTROLOGY ANALYSIS:
Using sun signs only as birth times not provided. Compatibility based on elemental harmony and zodiac traits.
`}

Channel your inner cosmic relationship guru and create an analysis that's giving "professional astrologer meets psychic palm reader" energy! 

🚨 MANDATORY STRUCTURE - Return ONLY valid JSON:
{
  "overallScore": ${baseAnalysis.overallScore},
  "overallLabel": "<Cosmic Soulmates/Divine Connection/Beautiful Harmony/Growing Bond>",
  "analysisBreakdown": {
    "palmReadingInsights": {
      "score": ${baseAnalysis.palmReadingCompatibility.score},
      "keyFindings": [
        "Heart line compatibility analysis from both palms",
        "Head line intellectual compatibility factors", 
        "Life line energy harmony assessment",
        "Fate line career and life path alignment"
      ]
    },
    "astrologicalInsights": {
      "score": ${baseAnalysis.astrologicalCompatibility.score},
      "sunSignCompatibility": "Analysis of ${user1.astrologicalProfile?.sunSign} + ${user2.astrologicalProfile?.sunSign} dynamic",
      ${user1.timeOfBirth && user2.timeOfBirth ? `
      "risingSignHarmony": "Rising sign compatibility analysis (birth times provided)",
      "houseCompatibility": "7th house (relationships) and 5th house (romance) analysis",
      "moonSignEmotionalCompatibility": "Emotional needs and nurturing styles alignment",` : `
      "elementalHarmony": "Fire/Earth/Air/Water compatibility analysis",
      "modalityAlignment": "Cardinal/Fixed/Mutable dynamic assessment",`}
      "planetaryInfluences": ["Venus (love style)", "Mars (passion/conflict)", "Mercury (communication)"]
    },
    "crossCorrelationMagic": {
      "score": ${baseAnalysis.palmAstroCorrelations.score},
      "uniqueInsights": [
        "How palm heart line aligns with astrological love indicators",
        "Head line patterns reflecting Mercury/Gemini influences",
        "Life line vitality correlating with elemental energy",
        "Career lines aligning with 10th house astrological indicators"
      ]
    }
  },
  "compatibilityCategories": [
    {
      "name": "Emotional Connection",
      "score": <70-100>,
      "palmContribution": "Heart line analysis reveals...",
      "astroContribution": "${user1.timeOfBirth && user2.timeOfBirth ? 'Moon sign compatibility shows...' : 'Water element/emotional zodiac traits indicate...'}",
      "combinedInsight": "Together, palm and stars reveal...",
      "emoji": "💖"
    },
    {
      "name": "Mental Compatibility", 
      "score": <70-100>,
      "palmContribution": "Head line patterns show...",
      "astroContribution": "Mercury influences and air sign energy indicate...",
      "combinedInsight": "Intellectual connection analysis...",
      "emoji": "🧠"
    },
    {
      "name": "Life Path Harmony",
      "score": <70-100>,
      "palmContribution": "Fate line and career indicators reveal...",
      "astroContribution": "${user1.timeOfBirth && user2.timeOfBirth ? '10th house and career planet alignment shows...' : 'Life path zodiac tendencies suggest...'}",
      "combinedInsight": "Your futures align because...",
      "emoji": "🛤️"
    },
    {
      "name": "Passion & Energy",
      "score": <70-100>,
      "palmContribution": "Life line vitality and mount of Mars indicate...",
      "astroContribution": "Mars placement and fire element compatibility show...", 
      "combinedInsight": "Your energy dynamic is...",
      "emoji": "🔥"
    }
  ],
  "enhancedInsights": [
    "Cosmic insight combining palm heart line with ${user1.astrologicalProfile?.sunSign} love nature",
    "Career compatibility insight merging fate line with astrological timing",
    "Communication style insight blending head line with Mercury influences",
    ${user1.timeOfBirth && user2.timeOfBirth ? 
      '"Birth time bonus: Rising sign first impressions align with palm personality indicators"' : 
      '"Elemental harmony reinforces palm-indicated relationship dynamics"'
    }
  ],
  "relationshipAdvice": {
    "strengthAreas": [
      "Where both palm and astrology show natural compatibility",
      "How to leverage your strongest connection points",
      "Building on shared cosmic and palm-indicated strengths"
    ],
    "growthOpportunities": [
      "Areas where palm reading suggests growth potential", 
      "How astrological timing can support relationship development",
      "Balancing different energy patterns for harmony"
    ],
    "communicationTips": [
      "Palm-indicated communication styles and astrological preferences",
      "When to have important conversations based on cosmic timing",
      "How your different thinking patterns (head line + Mercury) can complement each other"
    ],
    ${user1.timeOfBirth && user2.timeOfBirth ? `
    "timingInsights": [
      "Best times for important relationship conversations based on birth charts",
      "How your rising signs affect first impressions and daily interactions", 
      "Monthly relationship cycles based on moon sign compatibility"
    ],` : ''}
    "practicalSteps": [
      "Specific actions to strengthen palm-indicated compatibility areas",
      "How to work with astrological influences in daily relationship building",
      "Creating rituals that honor both your cosmic and palm-revealed natures"
    ]
  },
  "cosmicMessage": "Epic personalized message about ${user1.name} and ${user2.name}'s unique palm-astrology combination - make it inspiring and specific to their actual data!",
  "uniquenessFactor": "What makes ${user1.name} and ${user2.name}'s compatibility special based on the rare combination of their specific palm patterns and birth chart elements"
}

Focus on:
- REAL INTEGRATION of palm reading data with astrological birth information
- ${user1.timeOfBirth && user2.timeOfBirth ? 'Enhanced analysis using birth times for rising signs and houses' : 'Sun sign compatibility enhanced by palm reading insights'}
- Specific references to their actual palm line patterns and zodiac placements
- Entertainment value while providing meaningful relationship insights
- Cross-correlation insights that only come from combining both analysis methods

Make this reading absolutely ICONIC and unique to ${user1.name} and ${user2.name}'s specific combination of palm patterns and cosmic birth data! 💅⭐🤲`;
  }

  /**
   * Get time-based insights when birth times are available
   */
  private static getTimeBasedInsights(user1: EnhancedUserData, user2: EnhancedUserData): string[] {
    return [
      'Rising sign compatibility affects daily interactions and first impressions',
      'Moon sign compatibility reveals emotional needs and nurturing styles',
      'House placements show specific life areas where you naturally support each other',
      'Birth time accuracy enables precise planetary aspect analysis'
    ];
  }

  /**
   * Get timing considerations for relationship development
   */
  private static getTimingConsiderations(user1: EnhancedUserData, user2: EnhancedUserData): string[] {
    return [
      'New moon cycles favor new relationship phases and goal setting',
      'Full moon energy is ideal for important relationship conversations',
      'Mercury retrograde periods: focus on reflection rather than major decisions',
      'Venus transits: optimal timing for romantic gestures and commitment discussions'
    ];
  }

  /**
   * Validate that user data is sufficient for enhanced analysis
   */
  static validateUserDataForEnhancedAnalysis(user: EnhancedUserData): {
    isValid: boolean;
    missingFields: string[];
    recommendations: string[];
  } {
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    if (!user.dateOfBirth) {
      missingFields.push('dateOfBirth');
    }

    if (!user.name) {
      missingFields.push('name');
    }

    if (!user.placeOfBirth?.city || !user.placeOfBirth?.country) {
      missingFields.push('placeOfBirth');
      recommendations.push('Birth location enables more accurate astrological calculations');
    }

    if (!user.timeOfBirth) {
      recommendations.push('Birth time enables rising sign, moon sign, and house calculations for enhanced accuracy');
    }

    if (!user.placeOfBirth?.latitude || !user.placeOfBirth?.longitude) {
      recommendations.push('Exact coordinates enable precise birth chart calculations');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      recommendations
    };
  }

  /**
   * Get compatibility enhancement percentage based on available data
   */
  static getEnhancementLevel(user1: EnhancedUserData, user2: EnhancedUserData): {
    level: 'basic' | 'enhanced' | 'premium';
    percentage: number;
    description: string;
  } {
    let enhancementScore = 0;
    
    // Base compatibility (sun signs only)
    enhancementScore += 30;
    
    // Birth times available
    if (user1.timeOfBirth && user2.timeOfBirth) {
      enhancementScore += 40; // Rising signs, houses, moon signs
    }
    
    // Location accuracy
    if (user1.placeOfBirth?.latitude && user2.placeOfBirth?.latitude) {
      enhancementScore += 20; // Precise coordinates
    } else if (user1.placeOfBirth?.city && user2.placeOfBirth?.city) {
      enhancementScore += 10; // City-level accuracy
    }
    
    // Complete profile data
    if (user1.relationshipStatus && user2.relationshipStatus) {
      enhancementScore += 10; // Context for relationship advice
    }

    if (enhancementScore >= 80) {
      return {
        level: 'premium',
        percentage: enhancementScore,
        description: 'Complete astrological analysis with birth times, precise locations, and full compatibility mapping'
      };
    } else if (enhancementScore >= 60) {
      return {
        level: 'enhanced',
        percentage: enhancementScore,
        description: 'Enhanced compatibility analysis with detailed astrological insights'
      };
    } else {
      return {
        level: 'basic',
        percentage: enhancementScore,
        description: 'Basic sun sign compatibility enhanced by palm reading analysis'
      };
    }
  }
}