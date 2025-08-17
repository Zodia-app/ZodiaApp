export interface UserData {
  id?: string;
  name: string;
  dateOfBirth: string;
  zodiacSign?: string;
}

export interface PalmReadingData {
  leftHandImage?: string;
  rightHandImage?: string;
}

export interface PalmReadingFormData extends UserData, PalmReadingData {}