// Zodiac sign definitions with exact date ranges
export const ZODIAC_SIGNS = [
  {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    dateRange: {
      start: { month: 3, day: 21 },
      end: { month: 4, day: 19 }
    },
    element: 'Fire',
    modality: 'Cardinal',
    rulingPlanet: 'Mars',
    traits: ['energetic', 'pioneering', 'courageous', 'enthusiastic', 'confident'],
    compatibleSigns: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    colors: ['red', 'scarlet', 'carmine'],
    luckyNumbers: [1, 8, 17]
  },
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    dateRange: {
      start: { month: 4, day: 20 },
      end: { month: 5, day: 20 }
    },
    element: 'Earth',
    modality: 'Fixed',
    rulingPlanet: 'Venus',
    traits: ['reliable', 'patient', 'practical', 'devoted', 'responsible'],
    compatibleSigns: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    colors: ['green', 'pink', 'earth tones'],
    luckyNumbers: [2, 6, 9, 12, 24]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    dateRange: {
      start: { month: 5, day: 21 },
      end: { month: 6, day: 20 }
    },
    element: 'Air',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    traits: ['adaptable', 'communicative', 'witty', 'intellectual', 'curious'],
    compatibleSigns: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    colors: ['yellow', 'light green', 'silver'],
    luckyNumbers: [5, 7, 14, 23]
  },
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    dateRange: {
      start: { month: 6, day: 21 },
      end: { month: 7, day: 22 }
    },
    element: 'Water',
    modality: 'Cardinal',
    rulingPlanet: 'Moon',
    traits: ['nurturing', 'sensitive', 'compassionate', 'protective', 'intuitive'],
    compatibleSigns: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    colors: ['white', 'silver', 'sea green'],
    luckyNumbers: [2, 3, 15, 20]
  },
  {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    dateRange: {
      start: { month: 7, day: 23 },
      end: { month: 8, day: 22 }
    },
    element: 'Fire',
    modality: 'Fixed',
    rulingPlanet: 'Sun',
    traits: ['confident', 'ambitious', 'generous', 'loyal', 'encouraging'],
    compatibleSigns: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    colors: ['gold', 'orange', 'yellow'],
    luckyNumbers: [1, 3, 10, 19]
  },
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    dateRange: {
      start: { month: 8, day: 23 },
      end: { month: 9, day: 22 }
    },
    element: 'Earth',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    traits: ['practical', 'analytical', 'kind', 'hardworking', 'detailed'],
    compatibleSigns: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    colors: ['grey', 'beige', 'pale yellow'],
    luckyNumbers: [5, 14, 15, 23, 32]
  },
  {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    dateRange: {
      start: { month: 9, day: 23 },
      end: { month: 10, day: 22 }
    },
    element: 'Air',
    modality: 'Cardinal',
    rulingPlanet: 'Venus',
    traits: ['diplomatic', 'gracious', 'fair-minded', 'social', 'cooperative'],
    compatibleSigns: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    colors: ['pink', 'light blue', 'lavender'],
    luckyNumbers: [4, 6, 13, 15, 24]
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    dateRange: {
      start: { month: 10, day: 23 },
      end: { month: 11, day: 21 }
    },
    element: 'Water',
    modality: 'Fixed',
    rulingPlanet: 'Pluto',
    traits: ['passionate', 'resourceful', 'brave', 'determined', 'intuitive'],
    compatibleSigns: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    colors: ['scarlet', 'red', 'rust'],
    luckyNumbers: [8, 11, 18, 22]
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    dateRange: {
      start: { month: 11, day: 22 },
      end: { month: 12, day: 21 }
    },
    element: 'Fire',
    modality: 'Mutable',
    rulingPlanet: 'Jupiter',
    traits: ['optimistic', 'freedom-loving', 'hilarious', 'fair-minded', 'honest'],
    compatibleSigns: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    colors: ['turquoise', 'blue', 'purple'],
    luckyNumbers: [3, 7, 9, 12, 21]
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    dateRange: {
      start: { month: 12, day: 22 },
      end: { month: 1, day: 19 }
    },
    element: 'Earth',
    modality: 'Cardinal',
    rulingPlanet: 'Saturn',
    traits: ['responsible', 'disciplined', 'self-control', 'good managers', 'professional'],
    compatibleSigns: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    colors: ['brown', 'black', 'dark green'],
    luckyNumbers: [4, 8, 13, 22]
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    dateRange: {
      start: { month: 1, day: 20 },
      end: { month: 2, day: 18 }
    },
    element: 'Air',
    modality: 'Fixed',
    rulingPlanet: 'Uranus',
    traits: ['progressive', 'original', 'independent', 'humanitarian', 'intellectual'],
    compatibleSigns: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    colors: ['light blue', 'silver', 'turquoise'],
    luckyNumbers: [4, 7, 11, 22, 29]
  },
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    dateRange: {
      start: { month: 2, day: 19 },
      end: { month: 3, day: 20 }
    },
    element: 'Water',
    modality: 'Mutable',
    rulingPlanet: 'Neptune',
    traits: ['compassionate', 'artistic', 'intuitive', 'gentle', 'wise'],
    compatibleSigns: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    colors: ['mauve', 'lilac', 'purple', 'sea green'],
    luckyNumbers: [3, 9, 12, 15, 18, 24]
  }
];

// Element compatibility matrix
export const ELEMENT_COMPATIBILITY = {
  'Fire': {
    'Fire': { score: 90, description: 'Passionate and energetic match' },
    'Earth': { score: 40, description: 'Challenging but growth-oriented' },
    'Air': { score: 85, description: 'Stimulating and dynamic' },
    'Water': { score: 50, description: 'Requires understanding and balance' }
  },
  'Earth': {
    'Fire': { score: 40, description: 'Requires patience and compromise' },
    'Earth': { score: 95, description: 'Stable and harmonious' },
    'Air': { score: 55, description: 'Intellectual growth possible' },
    'Water': { score: 85, description: 'Nurturing and supportive' }
  },
  'Air': {
    'Fire': { score: 85, description: 'Exciting and adventurous' },
    'Earth': { score: 55, description: 'Different approaches to life' },
    'Air': { score: 90, description: 'Intellectual and communicative' },
    'Water': { score: 45, description: 'Emotional vs logical challenges' }
  },
  'Water': {
    'Fire': { score: 50, description: 'Steam or extinction - intense' },
    'Earth': { score: 85, description: 'Grounding and nurturing' },
    'Air': { score: 45, description: 'Different wavelengths' },
    'Water': { score: 95, description: 'Deep emotional connection' }
  }
};