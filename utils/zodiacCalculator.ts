// utils/zodiac/zodiacCalculator.ts

export const calculateZodiacSign = (date: Date): string => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();

  const zodiacDates = [
    { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 }
  ];

  for (const zodiac of zodiacDates) {
    if (
      (month === zodiac.startMonth && day >= zodiac.startDay) ||
      (month === zodiac.endMonth && day <= zodiac.endDay)
    ) {
      return zodiac.sign;
    }
  }

  // Default case (December 22-31 is Capricorn)
  if (month === 12 && day >= 22) {
    return 'Capricorn';
  }

  return 'Unknown';
};

// Helper function to get zodiac emoji
export const getZodiacEmoji = (sign: string): string => {
  const zodiacEmojis: { [key: string]: string } = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };
  
  return zodiacEmojis[sign] || '⭐';
};

// Helper function to get zodiac element
export const getZodiacElement = (sign: string): string => {
  const elements: { [key: string]: string } = {
    'Aries': 'Fire',
    'Leo': 'Fire',
    'Sagittarius': 'Fire',
    'Taurus': 'Earth',
    'Virgo': 'Earth',
    'Capricorn': 'Earth',
    'Gemini': 'Air',
    'Libra': 'Air',
    'Aquarius': 'Air',
    'Cancer': 'Water',
    'Scorpio': 'Water',
    'Pisces': 'Water'
  };
  
  return elements[sign] || 'Unknown';
};

// Helper function to get zodiac dates range
export const getZodiacDateRange = (sign: string): string => {
  const dateRanges: { [key: string]: string } = {
    'Capricorn': 'December 22 - January 19',
    'Aquarius': 'January 20 - February 18',
    'Pisces': 'February 19 - March 20',
    'Aries': 'March 21 - April 19',
    'Taurus': 'April 20 - May 20',
    'Gemini': 'May 21 - June 20',
    'Cancer': 'June 21 - July 22',
    'Leo': 'July 23 - August 22',
    'Virgo': 'August 23 - September 22',
    'Libra': 'September 23 - October 22',
    'Scorpio': 'October 23 - November 21',
    'Sagittarius': 'November 22 - December 21'
  };
  
  return dateRanges[sign] || 'Unknown';
};