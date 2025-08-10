export interface UserData {
  id?: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth: {
    city: string;
    state?: string;
    country: string;
  };
  relationshipStatus: string;
}

export interface PalmReadingData {
  focusAreas: string[];
  leftHandImage?: string;
  rightHandImage?: string;
  struggles?: string;
  goals?: string;
}

export interface PalmReadingFormData extends UserData, PalmReadingData {}