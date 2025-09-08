export interface UserData {
  id?: string;
  name: string;
  dateOfBirth: string;
  zodiacSign?: string;
  age?: number;
  placeOfBirth?: {
    city?: string;
    state?: string;
    country?: string;
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