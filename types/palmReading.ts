export interface UserData {
  id?: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth?: string; // HH:MM format (24-hour) - OPTIONAL for enhanced astrological accuracy
  zodiacSign?: string;
  age?: number;
  placeOfBirth?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number; // For precise astrological calculations
    longitude?: number; // For precise astrological calculations
    timezone?: string; // For birth time accuracy
  };
  relationshipStatus?: string;
}

export interface PalmReadingData {
  leftHandImage?: string;
  rightHandImage?: string;
  focusAreas?: string[];
  struggles?: string;
  goals?: string;
}

export interface PalmReadingFormData extends UserData, PalmReadingData {}