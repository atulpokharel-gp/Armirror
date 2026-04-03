import { BodyMeasurements, BodyModelEstimation } from "@/types/body-model";

export async function estimateBodyMeasurements(
  imageUrl: string,
  height?: number,
  weight?: number
): Promise<BodyModelEstimation> {
  // In production, this calls a pose estimation model (MediaPipe / OpenPose)
  // and uses the known height to scale pixel measurements to real-world values.
  // Here we return realistic mock data.
  await new Promise((r) => setTimeout(r, 1500));

  const baseChest = height ? height * 0.51 : 88;
  const baseWaist = height ? height * 0.41 : 70;
  const baseHip = height ? height * 0.55 : 95;

  const measurements: BodyMeasurements = {
    height: height ?? 168,
    weight: weight ?? 63,
    chest: Math.round(baseChest + (Math.random() * 4 - 2)),
    waist: Math.round(baseWaist + (Math.random() * 4 - 2)),
    hip: Math.round(baseHip + (Math.random() * 4 - 2)),
    shoulder: Math.round(38 + Math.random() * 4),
    inseam: Math.round(76 + Math.random() * 6),
    armLength: Math.round(58 + Math.random() * 4),
    neckCircumference: Math.round(35 + Math.random() * 3),
    unit: "cm",
  };

  const bodyShape = deriveBodyShape(measurements);

  return {
    measurements,
    bodyShape,
    confidence: 0.85 + Math.random() * 0.1,
    method: "photo",
  };
}

function deriveBodyShape(m: BodyMeasurements): string {
  const chest = m.chest ?? 88;
  const waist = m.waist ?? 70;
  const hip = m.hip ?? 95;
  const waistToHip = waist / hip;

  if (waistToHip < 0.75 && Math.abs(chest - hip) < 5) return "hourglass";
  if (hip > chest + 5) return "pear";
  if (chest > hip + 5) return "inverted-triangle";
  if (waistToHip > 0.85) return "apple";
  return "rectangle";
}

export function getSizeRecommendation(
  measurements: BodyMeasurements,
  _brand: string
): { top: string; bottom: string; dress: string } {
  const chest = measurements.chest ?? 88;
  const waist = measurements.waist ?? 70;
  const hip = measurements.hip ?? 95;

  const topSize = chest < 84 ? "XS" : chest < 88 ? "S" : chest < 92 ? "M" : chest < 96 ? "L" : "XL";
  const bottomSize = hip < 90 ? "XS" : hip < 94 ? "S" : hip < 98 ? "M" : hip < 102 ? "L" : "XL";
  const dressSize = Math.max(chest, hip) < 86 ? "XS" : Math.max(chest, hip) < 90 ? "S" : Math.max(chest, hip) < 94 ? "M" : "L";

  void waist;

  return { top: topSize, bottom: bottomSize, dress: dressSize };
}
