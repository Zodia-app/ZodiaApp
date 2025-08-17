// Simple zodiac sign calculator
export interface ZodiacSign {
  name: string;
  symbol: string;
  element: string;
  startDate: string;
  endDate: string;
}

const zodiacSigns: ZodiacSign[] = [
  { name: 'Capricorn', symbol: '♑', element: 'Earth', startDate: '12-22', endDate: '01-19' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', startDate: '01-20', endDate: '02-18' },
  { name: 'Pisces', symbol: '♓', element: 'Water', startDate: '02-19', endDate: '03-20' },
  { name: 'Aries', symbol: '♈', element: 'Fire', startDate: '03-21', endDate: '04-19' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', startDate: '04-20', endDate: '05-20' },
  { name: 'Gemini', symbol: '♊', element: 'Air', startDate: '05-21', endDate: '06-20' },
  { name: 'Cancer', symbol: '♋', element: 'Water', startDate: '06-21', endDate: '07-22' },
  { name: 'Leo', symbol: '♌', element: 'Fire', startDate: '07-23', endDate: '08-22' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', startDate: '08-23', endDate: '09-22' },
  { name: 'Libra', symbol: '♎', element: 'Air', startDate: '09-23', endDate: '10-22' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', startDate: '10-23', endDate: '11-21' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', startDate: '11-22', endDate: '12-21' },
];

export function calculateZodiacSign(birthDate: string): ZodiacSign | null {
  if (!birthDate) return null;
  
  try {
    const date = new Date(birthDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${month}-${day}`;
    
    // Handle year boundaries for Capricorn
    for (const sign of zodiacSigns) {
      if (sign.name === 'Capricorn') {
        // Capricorn spans from Dec 22 to Jan 19
        if (dateStr >= '12-22' || dateStr <= '01-19') {
          return sign;
        }
      } else {
        // Check if date falls within the sign's range
        if (dateStr >= sign.startDate && dateStr <= sign.endDate) {
          return sign;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating zodiac sign:', error);
    return null;
  }
}