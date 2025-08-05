export const getZodiacSign = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
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

export const getZodiacElement = (sign: string): string => {
  const elements: { [key: string]: string } = {
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
    'Pisces': 'Water',
  };
  return elements[sign] || 'Unknown';
};

export const getZodiacModality = (sign: string): string => {
  const modalities: { [key: string]: string } = {
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
    'Pisces': 'Mutable',
  };
  return modalities[sign] || 'Unknown';
};

export const getZodiacCompatibility = (sign1: string, sign2: string): number => {
  // Basic compatibility scoring based on elements
  const element1 = getZodiacElement(sign1);
  const element2 = getZodiacElement(sign2);
  
  // Same element = high compatibility
  if (element1 === element2) return 85;
  
  // Compatible elements
  if ((element1 === 'Fire' && element2 === 'Air') || 
      (element1 === 'Air' && element2 === 'Fire')) return 80;
  
  if ((element1 === 'Earth' && element2 === 'Water') || 
      (element1 === 'Water' && element2 === 'Earth')) return 75;
  
  // Neutral combinations
  if ((element1 === 'Fire' && element2 === 'Earth') || 
      (element1 === 'Earth' && element2 === 'Fire')) return 60;
  
  if ((element1 === 'Air' && element2 === 'Water') || 
      (element1 === 'Water' && element2 === 'Air')) return 55;
  
  // Challenging combinations
  if ((element1 === 'Fire' && element2 === 'Water') || 
      (element1 === 'Water' && element2 === 'Fire')) return 50;
  
  if ((element1 === 'Earth' && element2 === 'Air') || 
      (element1 === 'Air' && element2 === 'Earth')) return 45;
  
  return 65; // Default
};