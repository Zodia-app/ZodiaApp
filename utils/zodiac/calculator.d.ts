// Type declarations for calculator.js

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  dateRange: {
    start: { month: number; day: number };
    end: { month: number; day: number };
  };
  element: string;
  modality: string;
  rulingPlanet: string;
  traits: string[];
  compatibleSigns: string[];
  colors: string[];
  luckyNumbers: number[];
  birthDate?: Date;
  age?: number;
}

export interface CompatibilityResult {
  sign1: string;
  sign2: string;
  score: number;
  description: string;
  element1: string;
  element2: string;
  recommendation: string;
}

export function calculateZodiacSign(birthDate: string | Date): ZodiacSign | null;
export function calculateCompatibility(sign1: string | ZodiacSign, sign2: string | ZodiacSign): CompatibilityResult | null;
export function getZodiacSign(identifier: string): ZodiacSign | undefined;
export function getAllZodiacSigns(): ZodiacSign[];