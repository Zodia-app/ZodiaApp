import { CompatibilityScores, CompatibilityAnalysis } from '../../types/compatibility';

interface PalmReadingData {
  lines: {
    lifeLine: { description: string; meaning: string; personalizedInsight: string };
    heartLine: { description: string; meaning: string; personalizedInsight: string };
    headLine: { description: string; meaning: string; personalizedInsight: string };
    marriageLine: { description: string; meaning: string; personalizedInsight: string };
    fateLine: { description: string; meaning: string; personalizedInsight: string };
    successLine: { description: string; meaning: string; personalizedInsight: string };
    travelLine: { description: string; meaning: string; personalizedInsight: string };
  };
  mounts: {
    mars: { prominence: string; meaning: string };
    jupiter: { prominence: string; meaning: string };
    saturn: { prominence: string; meaning: string };
    sun: { prominence: string; meaning: string };
    mercury: { prominence: string; meaning: string };
    moon: { prominence: string; meaning: string };
    venus: { prominence: string; meaning: string };
  };
  specialMarkings: string[];
  overallPersonality: string;
  luckyElements: {
    colors: string[];
    numbers: number[];
    days: string[];
  };
}

interface UserInfo {
  name: string;
  age?: number;
  zodiacSign?: string;
}

export class CompatibilityService {
  
  /**
   * Calculate compatibility scores between two palm readings
   */
  static calculateCompatibilityScores(
    user1Reading: PalmReadingData,
    user2Reading: PalmReadingData
  ): CompatibilityScores {
    const loveScore = this.calculateLoveCompatibility(user1Reading, user2Reading);
    const communicationScore = this.calculateCommunicationCompatibility(user1Reading, user2Reading);
    const lifeGoalsScore = this.calculateLifeGoalsCompatibility(user1Reading, user2Reading);
    const energyScore = this.calculateEnergyCompatibility(user1Reading, user2Reading);
    
    // Overall score is weighted average
    const overallScore = Math.round(
      (loveScore * 0.3 + communicationScore * 0.25 + lifeGoalsScore * 0.25 + energyScore * 0.2)
    );

    return {
      overall_score: overallScore,
      love_score: loveScore,
      communication_score: communicationScore,
      life_goals_score: lifeGoalsScore,
      energy_score: energyScore
    };
  }

  /**
   * Generate Gen Z compatibility analysis
   */
  static generateCompatibilityAnalysis(
    user1Info: UserInfo,
    user2Info: UserInfo,
    user1Reading: PalmReadingData,
    user2Reading: PalmReadingData,
    scores: CompatibilityScores,
    matchType: 'romantic' | 'friendship' | 'platonic'
  ): CompatibilityAnalysis {
    
    const highlights = this.generateHighlights(user1Reading, user2Reading, scores, matchType);
    const challenges = this.generateChallenges(user1Reading, user2Reading, scores);
    const dynamics = this.generateRelationshipDynamics(user1Reading, user2Reading, matchType);
    const funFacts = this.generateFunFacts(user1Reading, user2Reading, user1Info, user2Info);
    
    return {
      greeting: this.generateGreeting(user1Info.name, user2Info.name, scores.overall_score, matchType),
      vibe_summary: this.generateVibeSummary(user1Reading, user2Reading, scores, matchType),
      compatibility_highlights: highlights,
      potential_challenges: challenges,
      relationship_dynamics: dynamics,
      fun_facts: funFacts,
      date_ideas: matchType === 'romantic' ? this.generateDateIdeas(user1Reading, user2Reading) : undefined,
      friendship_activities: matchType !== 'romantic' ? this.generateFriendshipActivities(user1Reading, user2Reading) : undefined,
      advice_for_duo: this.generateAdviceForDuo(user1Reading, user2Reading, matchType),
      cosmic_connection: this.generateCosmicConnection(user1Info, user2Info, scores)
    };
  }

  // Private helper methods for score calculations
  private static calculateLoveCompatibility(reading1: PalmReadingData, reading2: PalmReadingData): number {
    // Analyze heart lines, marriage lines, and venus mounts
    let score = 70; // Base compatibility
    
    // Heart line compatibility - analyze emotional patterns
    const heart1 = reading1.lines.heartLine.description.toLowerCase();
    const heart2 = reading2.lines.heartLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(heart1, heart2, ['deep', 'strong', 'curved'])) score += 10;
    if (this.hasCommonKeywords(heart1, heart2, ['passionate', 'intense', 'expressive'])) score += 8;
    
    // Marriage line compatibility
    const marriage1 = reading1.lines.marriageLine.description.toLowerCase();
    const marriage2 = reading2.lines.marriageLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(marriage1, marriage2, ['clear', 'strong', 'single'])) score += 12;
    
    // Venus mount compatibility
    const venus1 = reading1.mounts.venus.prominence.toLowerCase();
    const venus2 = reading2.mounts.venus.prominence.toLowerCase();
    
    if (this.isProminenceCompatible(venus1, venus2)) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateCommunicationCompatibility(reading1: PalmReadingData, reading2: PalmReadingData): number {
    let score = 65;
    
    // Head line analysis for thinking patterns
    const head1 = reading1.lines.headLine.description.toLowerCase();
    const head2 = reading2.lines.headLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(head1, head2, ['clear', 'straight', 'long'])) score += 15;
    if (this.hasCommonKeywords(head1, head2, ['creative', 'curved', 'imaginative'])) score += 12;
    
    // Mercury mount for communication skills
    const mercury1 = reading1.mounts.mercury.prominence.toLowerCase();
    const mercury2 = reading2.mounts.mercury.prominence.toLowerCase();
    
    if (this.isProminenceCompatible(mercury1, mercury2)) score += 15;
    
    // Special markings that indicate communication
    const markings1 = reading1.specialMarkings.join(' ').toLowerCase();
    const markings2 = reading2.specialMarkings.join(' ').toLowerCase();
    
    if (this.hasCommonKeywords(markings1, markings2, ['communication', 'speaking', 'writing'])) score += 8;
    
    return Math.min(score, 100);
  }

  private static calculateLifeGoalsCompatibility(reading1: PalmReadingData, reading2: PalmReadingData): number {
    let score = 60;
    
    // Fate line analysis
    const fate1 = reading1.lines.fateLine.description.toLowerCase();
    const fate2 = reading2.lines.fateLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(fate1, fate2, ['clear', 'strong', 'defined'])) score += 20;
    if (this.hasCommonKeywords(fate1, fate2, ['ambitious', 'focused', 'determined'])) score += 15;
    
    // Success line analysis
    const success1 = reading1.lines.successLine.description.toLowerCase();
    const success2 = reading2.lines.successLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(success1, success2, ['prominent', 'clear', 'strong'])) score += 15;
    
    // Jupiter mount for ambition
    const jupiter1 = reading1.mounts.jupiter.prominence.toLowerCase();
    const jupiter2 = reading2.mounts.jupiter.prominence.toLowerCase();
    
    if (this.isProminenceCompatible(jupiter1, jupiter2)) score += 10;
    
    return Math.min(score, 100);
  }

  private static calculateEnergyCompatibility(reading1: PalmReadingData, reading2: PalmReadingData): number {
    let score = 70;
    
    // Life line analysis
    const life1 = reading1.lines.lifeLine.description.toLowerCase();
    const life2 = reading2.lines.lifeLine.description.toLowerCase();
    
    if (this.hasCommonKeywords(life1, life2, ['strong', 'vibrant', 'energetic'])) score += 15;
    if (this.hasCommonKeywords(life1, life2, ['long', 'clear', 'deep'])) score += 12;
    
    // Mars mount for energy and drive
    const mars1 = reading1.mounts.mars.prominence.toLowerCase();
    const mars2 = reading2.mounts.mars.prominence.toLowerCase();
    
    if (this.isProminenceCompatible(mars1, mars2)) score += 13;
    
    return Math.min(score, 100);
  }

  // Helper methods for analysis generation
  private static generateGreeting(name1: string, name2: string, score: number, matchType: string): string {
    const relationship = matchType === 'romantic' ? 'couple' : 'duo';
    
    if (score >= 85) {
      return `${name1} & ${name2}, bestie!! 💅 Your palms are literally SCREAMING soulmate energy! This ${relationship} compatibility is absolutely sending me! ✨`;
    } else if (score >= 70) {
      return `${name1} & ${name2}! 🔥 Okay this ${relationship} vibe is absolutely hitting different! Your palm compatibility is giving main character energy! 💯`;
    } else if (score >= 55) {
      return `Hey ${name1} & ${name2}! ✨ Your palm reading compatibility is giving solid vibes with some iconic potential! 💕`;
    } else {
      return `${name1} & ${name2}! 💫 Your palm compatibility is giving "opposites attract" energy - and honestly? We love a good challenge! 🌟`;
    }
  }

  private static generateVibeSummary(reading1: PalmReadingData, reading2: PalmReadingData, scores: CompatibilityScores, matchType: string): string {
    const relationship = matchType === 'romantic' ? 'love story' : 'friendship';
    
    if (scores.overall_score >= 80) {
      return `This ${relationship} is giving absolute FIRE energy! Your palms show incredible synchronicity - like you were literally meant to find each other. The cosmic alignment is unmatched! 🔥✨`;
    } else if (scores.overall_score >= 65) {
      return `Your ${relationship} has that rare "gets each other without saying a word" vibe. Your palms reveal deep compatibility with some absolutely iconic potential! 💅`;
    } else {
      return `This ${relationship} is giving "growth together" energy! Your palms show beautiful complementary traits that could create something really special with effort! 🌱✨`;
    }
  }

  private static generateHighlights(reading1: PalmReadingData, reading2: PalmReadingData, scores: CompatibilityScores, matchType: string): string[] {
    const highlights: string[] = [];
    
    if (scores.love_score >= 75) {
      highlights.push(matchType === 'romantic' ? 
        "Your heart lines are absolutely serving couple goals - the emotional connection is unmatched! 💕" :
        "Your heart energy is perfectly synced - this friendship has that ride-or-die vibe! 💖"
      );
    }
    
    if (scores.communication_score >= 75) {
      highlights.push("Communication between you two? *Chef's kiss* - you literally finish each other's sentences! 💬✨");
    }
    
    if (scores.life_goals_score >= 75) {
      highlights.push("Your life paths are absolutely aligned - you're both heading toward the same kind of success! 🚀");
    }
    
    if (scores.energy_score >= 75) {
      highlights.push("The energy match is giving power couple/duo vibes - you amplify each other's best qualities! ⚡");
    }
    
    // Always have at least 2 highlights
    if (highlights.length < 2) {
      highlights.push("Your palm patterns show beautiful complementary strengths - together you're unstoppable! 💪");
      highlights.push("The cosmic timing of your connection is absolutely perfect - this is meant to be! ✨");
    }
    
    return highlights.slice(0, 4); // Max 4 highlights
  }

  private static generateChallenges(reading1: PalmReadingData, reading2: PalmReadingData, scores: CompatibilityScores): string[] {
    const challenges: string[] = [];
    
    if (scores.communication_score < 60) {
      challenges.push("Communication styles might need some work - but honestly? Learning each other's language is part of the fun! 💬");
    }
    
    if (scores.life_goals_score < 60) {
      challenges.push("Different life paths could create some tension, but supporting each other's dreams will make you stronger! 🌱");
    }
    
    if (scores.energy_score < 60) {
      challenges.push("Energy levels might not always match, but finding balance together is what makes relationships grow! ⚖️");
    }
    
    // If no major challenges, add gentle growth areas
    if (challenges.length === 0) {
      challenges.push("Honestly? The main challenge is not getting too comfortable - keep surprising each other! ✨");
    }
    
    return challenges.slice(0, 3); // Max 3 challenges
  }

  private static generateRelationshipDynamics(reading1: PalmReadingData, reading2: PalmReadingData, matchType: string) {
    return {
      communication_style: "You two have that effortless communication flow - like texting all day and never running out of things to say! 💬",
      conflict_resolution: "When drama happens (because it will), you handle it with maturity and actually come out stronger! 💪",
      shared_interests: "Your interests align in the most unexpected ways - always discovering new things to obsess over together! 🎯",
      growth_potential: matchType === 'romantic' ? 
        "This relationship has serious long-term potential - you bring out each other's best selves! 💕" :
        "This friendship is built to last - you'll be supporting each other through every life phase! 👯‍♀️"
    };
  }

  private static generateFunFacts(reading1: PalmReadingData, reading2: PalmReadingData, user1: UserInfo, user2: UserInfo): string[] {
    return [
      "Your lucky colors actually complement each other perfectly - totally meant to be! 🎨",
      "Both of your travel lines suggest you'll have some absolutely iconic adventures together! ✈️",
      "Your success patterns show you'll celebrate each other's wins like they're your own! 🏆",
      `${user1.name}'s intuitive energy perfectly balances ${user2.name}'s practical vibes! 🌙✨`
    ];
  }

  private static generateDateIdeas(reading1: PalmReadingData, reading2: PalmReadingData): string[] {
    return [
      "Sunset photography session - your creative energies will absolutely pop! 📸",
      "Cooking class together - your teamwork vibes are immaculate! 👨‍🍳",
      "Adventure hiking or rock climbing - channel that Mars energy! 🧗‍♀️",
      "Art museum followed by coffee shop debates - perfect for your intellectual connection! 🎨☕"
    ];
  }

  private static generateFriendshipActivities(reading1: PalmReadingData, reading2: PalmReadingData): string[] {
    return [
      "Monthly manifestation sessions - your combined energy is powerful! ✨",
      "Weekend adventure planning - you're both natural explorers! 🗺️",
      "Creative projects together - your artistic vibes are unmatched! 🎨",
      "Workout buddy system - motivate each other to stay healthy! 💪"
    ];
  }

  private static generateAdviceForDuo(reading1: PalmReadingData, reading2: PalmReadingData, matchType: string): string {
    if (matchType === 'romantic') {
      return "Keep being authentically yourselves - the magic happens when you're both comfortable enough to be completely real with each other. Trust the process and let your connection evolve naturally! 💕✨";
    } else {
      return "This friendship has serious staying power! Keep supporting each other's dreams, celebrate the wins together, and never underestimate the power of just being there for each other. You've got something special! 👯‍♀️💖";
    }
  }

  private static generateCosmicConnection(user1: UserInfo, user2: UserInfo, scores: CompatibilityScores): string {
    if (scores.overall_score >= 85) {
      return "The universe literally conspired to bring you two together. This connection transcends basic compatibility - it's giving cosmic soulmate energy! 🌌✨";
    } else if (scores.overall_score >= 70) {
      return "Your cosmic timing is absolutely perfect. The stars aligned just right for this connection to happen when you both needed it most! ⭐💫";
    } else {
      return "Every connection teaches us something beautiful. The universe brought you together for growth, learning, and genuine human connection! 🌟💝";
    }
  }

  // Utility helper methods
  private static hasCommonKeywords(text1: string, text2: string, keywords: string[]): boolean {
    return keywords.some(keyword => 
      text1.includes(keyword) && text2.includes(keyword)
    );
  }

  private static isProminenceCompatible(prominence1: string, prominence2: string): boolean {
    const getProminenceLevel = (prominence: string): number => {
      const lower = prominence.toLowerCase();
      if (lower.includes('well-developed') || lower.includes('prominent')) return 3;
      if (lower.includes('moderate') || lower.includes('medium')) return 2;
      if (lower.includes('slight') || lower.includes('small')) return 1;
      return 2; // Default to medium
    };
    
    const level1 = getProminenceLevel(prominence1);
    const level2 = getProminenceLevel(prominence2);
    
    // Compatible if within 1 level of each other
    return Math.abs(level1 - level2) <= 1;
  }
}