import { ZodiacSign } from '../../utils/zodiac/calculator';

export interface HoroscopeContent {
  overallEnergy: string;
  loveRelationships: string;
  careerMoney: string;
  healthWellness: string;
  luckyColor: string;
  luckyNumber: number;
  bestTime: string;
}

export interface HoroscopeResult {
  date: string;
  sign: string;
  content: HoroscopeContent;
  zodiacInfo: ZodiacSign;
  generatedAt?: string;
}

export interface CompatibilityReportResult {
  sign1: string;
  sign2: string;
  score: number;
  description: string;
  element1: string;
  element2: string;
  recommendation: string;
  content: {
    overall: string;
    strengths: string[];
    challenges: string[];
    advice: string;
  };
  zodiac1: ZodiacSign;
  zodiac2: ZodiacSign;
  generatedAt: string;
}

export function generateDailyHoroscope(birthDate: string | Date): Promise<HoroscopeResult>;
export function generateCompatibilityReport(birthDate1: string | Date, birthDate2: string | Date): Promise<CompatibilityReportResult>;
export function getHoroscopeHistory(limit?: number): Promise<any[]>;