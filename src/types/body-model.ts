export interface BodyModel {
  id: string;
  profileId: string;
  measurements: BodyMeasurements;
  bodyShape: string;
  confidence: number;
  generatedAt: Date;
  modelData?: Record<string, unknown>;
}

export interface BodyMeasurements {
  height?: number;
  weight?: number;
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
  unit: "cm" | "inches";
}

export interface BodyModelEstimation {
  measurements: BodyMeasurements;
  bodyShape: string;
  confidence: number;
  method: "photo" | "manual" | "hybrid";
  landmarks?: BodyLandmarks;
}

export interface BodyLandmarks {
  head?: Point3D;
  neck?: Point3D;
  leftShoulder?: Point3D;
  rightShoulder?: Point3D;
  leftElbow?: Point3D;
  rightElbow?: Point3D;
  leftWrist?: Point3D;
  rightWrist?: Point3D;
  leftHip?: Point3D;
  rightHip?: Point3D;
  leftKnee?: Point3D;
  rightKnee?: Point3D;
  leftAnkle?: Point3D;
  rightAnkle?: Point3D;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface SizeRecommendation {
  brand: string;
  top?: string;
  bottom?: string;
  dress?: string;
  outerwear?: string;
  shoes?: string;
  confidence: number;
}

export const BODY_SHAPES = [
  { value: "hourglass", label: "Hourglass", description: "Balanced bust and hips with defined waist" },
  { value: "pear", label: "Pear", description: "Hips wider than shoulders" },
  { value: "apple", label: "Apple", description: "Fuller midsection with slimmer legs" },
  { value: "rectangle", label: "Rectangle", description: "Similar bust, waist, and hip measurements" },
  { value: "inverted-triangle", label: "Inverted Triangle", description: "Shoulders wider than hips" },
] as const;
