export interface CompatibilityAnalysis {
  user1: UserProfile;
  user2: UserProfile;
  overallScore: number; // 0-100
  sections: CompatibilitySection[];
  advice: string[];
  challenges: string[];
  strengths: string[];
  generatedAt: string;
}

interface UserProfile {
  name: string;
  zodiacSign: string;
  birthDate: string;
}

interface CompatibilitySection {
  title: string;
  content: string;
  score?: number;
  icon?: string;
}