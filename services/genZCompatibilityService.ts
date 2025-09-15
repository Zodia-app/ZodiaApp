import { AstroPalmIntegrationService } from './astroPalmIntegration';

export interface GenZCompatibilityResult {
  compatibilityScore: number;
  genZLevel: GenZCompatibilityLevel;
  analysis: GenZCompatibilityAnalysis;
  shareableContent: ShareableContent;
}

export interface GenZCompatibilityLevel {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  vibe: string;
  viralPotential: 'low' | 'medium' | 'high' | 'iconic';
}

export interface GenZCompatibilityAnalysis {
  overallVibe: string;
  strengths: string[];
  challenges: string[];
  dateIdeas: string[];
  redFlags: string[];
  greenFlags: string[];
  socialMediaBio: string;
}

export interface ShareableContent {
  tiktokCaption: string;
  instagramStory: string;
  twitterTweet: string;
  snapchatText: string;
  whatsappMessage: string;
}

export class GenZCompatibilityService {
  private static readonly GEN_Z_LEVELS = [
    {
      id: 1,
      title: "TOXIC ☠️",
      subtitle: "RUN bestie",
      emoji: "☠️",
      vibe: "For those relationships that are straight-up dangerous fr",
      viralPotential: 'medium' as const
    },
    {
      id: 2,
      title: "NAH FAM 🚫",
      subtitle: "Not it chief",
      emoji: "🚫",
      vibe: "When the vibes are completely off bestie",
      viralPotential: 'low' as const
    },
    {
      id: 3,
      title: "MEH ENERGY 😐",
      subtitle: "Could be worse",
      emoji: "😐",
      vibe: "The lukewarm 'it's complicated' zone",
      viralPotential: 'low' as const
    },
    {
      id: 4,
      title: "LOWKEY CUTE 🥺",
      subtitle: "Some potential",
      emoji: "🥺",
      vibe: "When there's a spark worth exploring ngl",
      viralPotential: 'medium' as const
    },
    {
      id: 5,
      title: "GOOD VIBES ✨",
      subtitle: "We see you",
      emoji: "✨",
      vibe: "Actually sweet compatibility, no cap",
      viralPotential: 'medium' as const
    },
    {
      id: 6,
      title: "MAIN CHARACTER ENERGY 👑",
      subtitle: "Power couple alert",
      emoji: "👑",
      vibe: "Giving serious relationship goals fr fr",
      viralPotential: 'high' as const
    },
    {
      id: 7,
      title: "SOULMATE STATUS 💕",
      subtitle: "It's giving forever",
      emoji: "💕",
      vibe: "The stars have aligned bestie ✨",
      viralPotential: 'high' as const
    },
    {
      id: 8,
      title: "MAKE BABIES 👶",
      subtitle: "ICONIC couple",
      emoji: "👶",
      vibe: "Ultimate destiny-level compatibility, periodt",
      viralPotential: 'iconic' as const
    }
  ];

  private static readonly GEN_Z_PHRASES = {
    positive: [
      "no cap", "fr fr", "periodt", "it's giving", "main character energy",
      "we stan", "absolute unit", "chef's kiss", "hits different", "living for this"
    ],
    negative: [
      "not it chief", "that ain't it", "red flag energy", "toxic bestie",
      "giving me the ick", "this is not the vibe", "absolutely not"
    ],
    neutral: [
      "it's giving mixed signals", "could be a vibe", "jury's still out",
      "we'll see bestie", "potentially iconic"
    ]
  };

  /**
   * Calculate Gen Z style compatibility from palm reading and astrology data
   */
  static async calculateGenZCompatibility(
    user1Data: any,
    user2Data: any,
    user1PalmReading: any,
    user2PalmReading: any
  ): Promise<GenZCompatibilityResult> {
    
    // Use existing astro-palm integration for base compatibility
    const enhancedAnalysis = AstroPalmIntegrationService.generateEnhancedCompatibilityAnalysis(
      user1Data,
      user2Data,
      user1PalmReading,
      user2PalmReading
    );

    const baseScore = enhancedAnalysis.overallScore;
    
    // Add Gen Z specific modifiers
    const genZModifiers = this.calculateGenZModifiers(
      user1Data,
      user2Data,
      user1PalmReading,
      user2PalmReading
    );

    const finalScore = Math.max(0, Math.min(100, baseScore + genZModifiers));
    
    // Determine Gen Z compatibility level
    const genZLevel = this.getGenZLevel(finalScore);
    
    // Generate Gen Z specific analysis
    const analysis = this.generateGenZAnalysis(finalScore, user1Data, user2Data);
    
    // Create shareable content
    const shareableContent = this.createShareableContent(genZLevel, finalScore, user1Data.name, user2Data.name);

    return {
      compatibilityScore: finalScore,
      genZLevel,
      analysis,
      shareableContent
    };
  }

  /**
   * Calculate Gen Z specific compatibility modifiers
   */
  private static calculateGenZModifiers(
    user1Data: any,
    user2Data: any,
    user1PalmReading: any,
    user2PalmReading: any
  ): number {
    let modifiers = 0;

    // Social media alignment bonus
    if (this.hasSocialMediaAlignment(user1Data, user2Data)) {
      modifiers += 5;
    }

    // Communication style compatibility (Gen Z values direct communication)
    if (this.hasCompatibleCommunicationStyle(user1PalmReading, user2PalmReading)) {
      modifiers += 8;
    }

    // Energy level matching (important for Gen Z relationships)
    if (this.hasMatchingEnergyLevels(user1PalmReading, user2PalmReading)) {
      modifiers += 7;
    }

    // Red flag detection
    const redFlags = this.detectRedFlags(user1Data, user2Data);
    modifiers -= redFlags * 3;

    // Green flag bonuses
    const greenFlags = this.detectGreenFlags(user1Data, user2Data);
    modifiers += greenFlags * 2;

    return modifiers;
  }

  /**
   * Get Gen Z compatibility level based on score
   */
  private static getGenZLevel(score: number): GenZCompatibilityLevel {
    if (score >= 88) return this.GEN_Z_LEVELS[7]; // MAKE BABIES
    if (score >= 76) return this.GEN_Z_LEVELS[6]; // SOULMATE STATUS
    if (score >= 63) return this.GEN_Z_LEVELS[5]; // MAIN CHARACTER ENERGY
    if (score >= 51) return this.GEN_Z_LEVELS[4]; // GOOD VIBES
    if (score >= 38) return this.GEN_Z_LEVELS[3]; // LOWKEY CUTE
    if (score >= 26) return this.GEN_Z_LEVELS[2]; // MEH ENERGY
    if (score >= 13) return this.GEN_Z_LEVELS[1]; // NAH FAM
    return this.GEN_Z_LEVELS[0]; // TOXIC
  }

  /**
   * Generate Gen Z specific compatibility analysis
   */
  private static generateGenZAnalysis(
    score: number,
    user1Data: any,
    user2Data: any
  ): GenZCompatibilityAnalysis {
    
    const level = this.getGenZLevel(score);
    
    const overallVibe = this.generateOverallVibe(score, level);
    const strengths = this.generateStrengths(score);
    const challenges = this.generateChallenges(score);
    const dateIdeas = this.generateGenZDateIdeas(score);
    const redFlags = this.generateRedFlags(score);
    const greenFlags = this.generateGreenFlags(score);
    const socialMediaBio = this.generateSocialMediaBio(level, score);

    return {
      overallVibe,
      strengths,
      challenges,
      dateIdeas,
      redFlags,
      greenFlags,
      socialMediaBio
    };
  }

  /**
   * Create shareable content for different platforms
   */
  private static createShareableContent(
    level: GenZCompatibilityLevel,
    score: number,
    user1Name: string,
    user2Name: string
  ): ShareableContent {
    
    return {
      tiktokCaption: `POV: You just found out your compatibility rating ${level.emoji} ${level.title} - ${score}% compatible! ${level.vibe} #PalmReading #Compatibility #GenZ #Astrology #ZodiaApp`,
      
      instagramStory: `🚨 COMPATIBILITY CHECK 🚨\n\n${level.emoji} ${level.title}\n${score}% Compatible\n\n"${level.vibe}"\n\n✨ Try yours! Link in bio`,
      
      twitterTweet: `Just got my palm reading compatibility result: ${level.emoji} ${level.title} (${score}%)\n\n${level.vibe}\n\nTry it yourself! 👀 #PalmReading #ZodiaApp`,
      
      snapchatText: `${level.emoji} ${score}% compatible bestie! ${level.subtitle} ${level.vibe.slice(0, 50)}...`,
      
      whatsappMessage: `OMG just did this palm reading compatibility thing! Got ${level.title} ${level.emoji} - ${score}% compatible!\n\n"${level.vibe}"\n\nYou should try it too! 👀✨`
    };
  }

  // Helper methods for Gen Z analysis
  private static generateOverallVibe(score: number, level: GenZCompatibilityLevel): string {
    const phrases = score >= 70 ? this.GEN_Z_PHRASES.positive : 
                   score >= 40 ? this.GEN_Z_PHRASES.neutral : 
                   this.GEN_Z_PHRASES.negative;
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    return `${level.vibe} This relationship is ${randomPhrase}, and the stars don't lie bestie! ✨`;
  }

  private static generateStrengths(score: number): string[] {
    if (score >= 70) {
      return [
        "Y'all have that main character energy together fr",
        "Communication is hitting different in the best way",
        "Your vibes are absolutely immaculate, no cap",
        "This combo is giving power couple energy"
      ];
    } else if (score >= 40) {
      return [
        "There's definitely potential here bestie",
        "Some good vibes but room for growth",
        "Y'all could be cute with some work",
        "The foundation is there, just needs building"
      ];
    } else {
      return [
        "Maybe as friends first? 👀",
        "Time to focus on self-love bestie",
        "This ain't it but don't give up on love",
        "Sometimes the universe has other plans"
      ];
    }
  }

  private static generateChallenges(score: number): string[] {
    if (score >= 70) {
      return [
        "Don't let success get to your heads",
        "Remember to maintain your individual identities",
        "Keep communicating even when things are good"
      ];
    } else if (score >= 40) {
      return [
        "Communication styles might clash sometimes",
        "Different approaches to conflict resolution",
        "Timing might not always align perfectly"
      ];
    } else {
      return [
        "Major communication barriers detected",
        "Fundamental incompatibilities present",
        "This might cause more stress than joy"
      ];
    }
  }

  private static generateGenZDateIdeas(score: number): string[] {
    if (score >= 70) {
      return [
        "TikTok dance-off at home 💃",
        "Aesthetic photoshoot in the city 📸",
        "Thrifting for vintage fits 👗",
        "Making a couples playlist together 🎵",
        "Late night food truck adventures 🌮"
      ];
    } else if (score >= 40) {
      return [
        "Coffee shop study sessions ☕",
        "Museum hopping (it's giving culture) 🏛️",
        "Cooking together from TikTok recipes 👨‍🍳",
        "Mini golf or bowling (classic vibes) ⛳"
      ];
    } else {
      return [
        "Maybe start with group hangouts? 👥",
        "Public places only bestie 🏞️",
        "Keep it casual and low-pressure ✨"
      ];
    }
  }

  private static generateRedFlags(score: number): string[] {
    if (score < 30) {
      return [
        "Major communication breakdowns likely",
        "Different life goal trajectories",
        "Potential for toxic dynamics"
      ];
    } else if (score < 60) {
      return [
        "Occasional misunderstandings expected",
        "Some compatibility gaps to bridge"
      ];
    }
    return [];
  }

  private static generateGreenFlags(score: number): string[] {
    if (score >= 70) {
      return [
        "Natural communication flow ✅",
        "Shared values and life goals ✅",
        "Mutual respect and understanding ✅",
        "Growth-oriented mindset ✅"
      ];
    } else if (score >= 40) {
      return [
        "Good foundation for growth ✅",
        "Respectful communication style ✅"
      ];
    }
    return [];
  }

  private static generateSocialMediaBio(level: GenZCompatibilityLevel, score: number): string {
    return `${level.emoji} ${score}% compatible ${level.subtitle} | ${level.vibe} | Powered by palm reading + astrology ✨`;
  }

  // Helper methods for modifiers
  private static hasSocialMediaAlignment(user1: any, user2: any): boolean {
    // Simplified logic - in reality would check social media activity patterns
    return Math.random() > 0.6;
  }

  private static hasCompatibleCommunicationStyle(palm1: any, palm2: any): boolean {
    // Simplified logic - would analyze head lines and other palm features
    return Math.random() > 0.5;
  }

  private static hasMatchingEnergyLevels(palm1: any, palm2: any): boolean {
    // Simplified logic - would analyze life lines and overall palm energy
    return Math.random() > 0.4;
  }

  private static detectRedFlags(user1: any, user2: any): number {
    // Simplified logic - would check for compatibility red flags
    return Math.floor(Math.random() * 3);
  }

  private static detectGreenFlags(user1: any, user2: any): number {
    // Simplified logic - would check for positive compatibility indicators
    return Math.floor(Math.random() * 5);
  }
}