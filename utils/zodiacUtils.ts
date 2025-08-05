// utils/zodiacUtils.ts

export const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof zodiacSigns[number];

export const zodiacElements: Record<ZodiacSign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  'Aries': 'Fire',
  'Taurus': 'Earth',
  'Gemini': 'Air',
  'Cancer': 'Water',
  'Leo': 'Fire',
  'Virgo': 'Earth',
  'Libra': 'Air',
  'Scorpio': 'Water',
  'Sagittarius': 'Fire',
  'Capricorn': 'Earth',
  'Aquarius': 'Air',
  'Pisces': 'Water'
};

export const zodiacModalities: Record<ZodiacSign, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  'Aries': 'Cardinal',
  'Taurus': 'Fixed',
  'Gemini': 'Mutable',
  'Cancer': 'Cardinal',
  'Leo': 'Fixed',
  'Virgo': 'Mutable',
  'Libra': 'Cardinal',
  'Scorpio': 'Fixed',
  'Sagittarius': 'Mutable',
  'Capricorn': 'Cardinal',
  'Aquarius': 'Fixed',
  'Pisces': 'Mutable'
};

export const getZodiacSign = (birthDate: Date): ZodiacSign => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

export const getElement = (sign: ZodiacSign): string => {
  return zodiacElements[sign];
};

export const getModality = (sign: ZodiacSign): string => {
  return zodiacModalities[sign];
};

export const areCompatibleElements = (element1: string, element2: string): boolean => {
  const compatiblePairs = [
    ['Fire', 'Air'],
    ['Earth', 'Water'],
    ['Fire', 'Fire'],
    ['Earth', 'Earth'],
    ['Air', 'Air'],
    ['Water', 'Water']
  ];
  
  return compatiblePairs.some(pair => 
    (pair.includes(element1) && pair.includes(element2))
  );
};

export const getElementCompatibilityScore = (element1: string, element2: string): number => {
  if (element1 === element2) return 80;
  if (areCompatibleElements(element1, element2)) return 65;
  return 40;
};