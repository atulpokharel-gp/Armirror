export interface TryonRequest {
  productId: string;
  productImageUrl: string;
  profileId: string;
  bodyModelUrl?: string;
  variantColor?: string;
  variantSize?: string;
}

export interface TryonResult {
  imageUrl: string;
  confidence: number;
  fitNotes: string[];
  processingTime: number;
  isAiGenerated: boolean;
}

// Curated try-on result images by category (Unsplash fashion images)
const TRYON_RESULT_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
];

export async function generateTryonImage(_request: TryonRequest): Promise<TryonResult> {
  // In production: calls a diffusion model API (Replicate / HuggingFace)
  // with inpainting to overlay the garment onto the body model.
  // The body model landmarks guide garment warping and perspective.
  await new Promise((r) => setTimeout(r, 2500 + Math.random() * 1000));

  const imageUrl = TRYON_RESULT_IMAGES[Math.floor(Math.random() * TRYON_RESULT_IMAGES.length)];

  return {
    imageUrl,
    confidence: 0.88 + Math.random() * 0.1,
    fitNotes: [
      "Shoulder width: Good fit",
      "Chest: True to size",
      "Waist: Slight adjustment may be needed",
      "Length: As expected for your height",
    ],
    processingTime: 2500 + Math.floor(Math.random() * 1000),
    isAiGenerated: true,
  };
}

export async function generateTryonVideo(
  tryonImageUrl: string,
  _style: "runway" | "casual" | "360"
): Promise<{ videoUrl: string; status: string }> {
  // In production: calls video generation API (Runway ML / Stable Video Diffusion)
  await new Promise((r) => setTimeout(r, 3000));

  return {
    videoUrl: tryonImageUrl, // Mock: return the image URL as placeholder
    status: "completed",
  };
}
