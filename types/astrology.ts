// Enhanced Astrological Types for Palm Reading Integration

export interface AstrologicalBirthData {
  dateOfBirth: string; // ISO date string
  timeOfBirth?: string; // HH:MM format (24-hour)
  placeOfBirth: {
    city: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

export interface ZodiacProfile {
  sunSign: string;
  moonSign?: string;
  risingSign?: string;
  venusSign?: string;
  marsSign?: string;
  mercurySign?: string;
  // Birth chart elements (if time is available)
  houses?: {
    first?: string;  // Rising sign/Ascendant
    seventh?: string; // Descendant (relationships)
    fifth?: string;  // Romance/creativity
    tenth?: string;  // Career/reputation
  };
}

export interface AstrologicalCompatibility {
  sunSignCompatibility: number; // 0-100
  elementalHarmony: {
    userElement: 'fire' | 'earth' | 'air' | 'water';
    partnerElement: 'fire' | 'earth' | 'air' | 'water';
    harmonyScore: number; // 0-100
    description: string;
  };
  modalityAlignment: {
    userModality: 'cardinal' | 'fixed' | 'mutable';
    partnerModality: 'cardinal' | 'fixed' | 'mutable';
    alignmentScore: number; // 0-100
    description: string;
  };
  venusCompatibility?: number; // Love/attraction compatibility
  marsCompatibility?: number;  // Passion/conflict resolution
}

export interface PalmAstrologyCorrelation {
  // Correlate palm lines with astrological elements
  lifeLine: {
    astrologicalCorrelation: string;
    planetaryInfluence: string[];
    elementalConnection: string;
  };
  heartLine: {
    venusInfluence: number; // 0-100
    relationshipHouses: string[];
    romanticCompatibilityFactors: string[];
  };
  headLine: {
    mercuryInfluence: number; // 0-100
    mentalCompatibility: string[];
    communicationStyle: string;
  };
  fateLine: {
    saturnInfluence: number; // 0-100
    careerHouseAlignment: string;
    lifePathCompatibility: string;
  };
}

export interface EnhancedUserData extends AstrologicalBirthData {
  id?: string;
  name: string;
  age?: number;
  relationshipStatus?: string;
  // Calculated astrological profile
  astrologicalProfile?: ZodiacProfile;
  // Palm reading correlation data
  palmAstrologyCorrelation?: PalmAstrologyCorrelation;
}

export interface EnhancedCompatibilityAnalysis {
  // Combined palm + astrology compatibility
  overallScore: number; // 0-100 (weighted combination)
  
  // Breakdown of compatibility sources
  palmReadingCompatibility: {
    score: number;
    weight: number; // 0-1 (how much this contributes to overall)
    analysis: string;
  };
  
  astrologicalCompatibility: {
    score: number;
    weight: number; // 0-1 (how much this contributes to overall)
    analysis: AstrologicalCompatibility;
  };
  
  // Cross-correlations between palm and astrology
  palmAstroCorrelations: {
    score: number;
    correlations: string[]; // Specific correlations found
    enhancementFactors: string[]; // How they enhance each other
    conflictAreas?: string[]; // Any conflicting indicators
  };
  
  // Enhanced insights combining both systems
  enhancedInsights: {
    strengthAreas: string[]; // Where both systems agree strongly
    growthAreas: string[]; // Where both systems suggest development
    balancingFactors: string[]; // How partners complement each other
    timeBasedInsights?: string[]; // If birth time available
  };
  
  // Personalized recommendations
  relationshipAdvice: {
    communicationTips: string[];
    conflictResolution: string[];
    strengthBuilding: string[];
    timingConsiderations?: string[]; // Astrological timing
  };
}