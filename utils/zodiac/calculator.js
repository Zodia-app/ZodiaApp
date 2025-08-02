import { ZODIAC_SIGNS, ELEMENT_COMPATIBILITY } from './constants';

/**
 * Calculate zodiac sign from birth date
 * @param {Date|string} birthDate - The birth date
 * @returns {Object|null} Zodiac sign information or null if invalid
 */
export function calculateZodiacSign(birthDate) {
  try {
    const date = new Date(birthDate);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.error('Invalid date provided:', birthDate);
      return null;
    }
    
    const month = date.getMonth() + 1; // Convert to 1-based month
    const day = date.getDate();
    
    // Find matching zodiac sign
    for (const sign of ZODIAC_SIGNS) {
      if (isDateInRange(month, day, sign.dateRange)) {
        return {
          ...sign,
          birthDate: date,
          age: calculateAge(date)
        };
      }
    }
    
    console.error('Could not determine zodiac sign for date:', birthDate);
    return null;
  } catch (error) {
    console.error('Error calculating zodiac sign:', error);
    return null;
  }
}

/**
 * Check if date falls within zodiac date range
 */
function isDateInRange(month, day, range) {
  const { start, end } = range;
  
  // Handle Capricorn special case (crosses year boundary)
  if (start.month === 12 && end.month === 1) {
    return (month === 12 && day >= start.day) || 
           (month === 1 && day <= end.day);
  }
  
  // Normal case
  if (month === start.month && month === end.month) {
    return day >= start.day && day <= end.day;
  } else if (month === start.month) {
    return day >= start.day;
  } else if (month === end.month) {
    return day <= end.day;
  } else {
    return month > start.month && month < end.month;
  }
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calculate compatibility between two zodiac signs
 */
export function calculateCompatibility(sign1, sign2) {
  const zodiac1 = typeof sign1 === 'string' 
    ? ZODIAC_SIGNS.find(s => s.name === sign1 || s.id === sign1)
    : sign1;
    
  const zodiac2 = typeof sign2 === 'string'
    ? ZODIAC_SIGNS.find(s => s.name === sign2 || s.id === sign2)
    : sign2;
  
  if (!zodiac1 || !zodiac2) {
    console.error('Invalid zodiac signs provided:', sign1, sign2);
    return null;
  }
  
  const compatibility = ELEMENT_COMPATIBILITY[zodiac1.element]?.[zodiac2.element];
  
  return {
    sign1: zodiac1.name,
    sign2: zodiac2.name,
    score: compatibility?.score || 0,
    description: compatibility?.description || 'Unknown compatibility',
    element1: zodiac1.element,
    element2: zodiac2.element,
    recommendation: getCompatibilityRecommendation(compatibility?.score)
  };
}

/**
 * Get compatibility recommendation based on score
 */
function getCompatibilityRecommendation(score) {
  if (score >= 85) return 'Excellent match! Natural harmony and understanding.';
  if (score >= 70) return 'Good compatibility with great potential.';
  if (score >= 50) return 'Moderate compatibility - requires effort and understanding.';
  return 'Challenging match - significant differences to overcome.';
}

/**
 * Get zodiac sign by name or id
 */
export function getZodiacSign(identifier) {
  return ZODIAC_SIGNS.find(s => 
    s.name.toLowerCase() === identifier.toLowerCase() || 
    s.id === identifier.toLowerCase()
  );
}

/**
 * Get all zodiac signs
 */
export function getAllZodiacSigns() {
  return ZODIAC_SIGNS;
}