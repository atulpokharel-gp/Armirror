export interface FamilyProfile {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  ageGroup: string;
  gender: string;
  height?: number;
  weight?: number;
  bodyShape?: string;
  clothingSize?: string;
  shoeSize?: string;
  fitPreference?: string;
  stylePreference: string[];
  favoriteBrands: string[];
  favoriteColors: string[];
  dislikedColors: string[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  measurements?: BodyMeasurement;
  skinToneProfile?: SkinToneProfile;
}

export interface BodyMeasurement {
  id: string;
  profileId: string;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  inseam?: number;
  armLength?: number;
  neckCircumference?: number;
  bustSize?: string;
  thighCircumference?: number;
  calfCircumference?: number;
  unit: string;
  confidence?: number;
  isConfirmed: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkinToneProfile {
  id: string;
  profileId: string;
  undertone?: string;
  season?: string;
  fitzpatrickScale?: number;
  dominantColors: string[];
  bestColors: string[];
  avoidColors: string[];
  analysisSource?: string;
  analysisData?: Record<string, unknown>;
  createdAt: Date;
}

export interface StylePreference {
  id: string;
  profileId: string;
  occasions: string[];
  aesthetics: string[];
  colorPalette: string[];
  avoidColors: string[];
  budgetMin?: number;
  budgetMax?: number;
  favoriteBrands: string[];
  currency: string;
}

export type AgeGroup = "child" | "teen" | "adult" | "senior";
export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";
export type Relationship = "self" | "partner" | "child" | "parent" | "sibling" | "other";
export type BodyShape = "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle";
export type FitPreference = "slim" | "regular" | "relaxed" | "oversized";
