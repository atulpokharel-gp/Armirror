import { MockProduct, MOCK_PRODUCTS } from "@/types/product";
import { FamilyProfile } from "@/types/profile";

export interface RecommendationResult {
  product: MockProduct;
  score: number;
  reasons: string[];
  colorScore: number;
  fitScore: number;
  styleScore: number;
  occasion?: string;
}

export async function generateRecommendations(
  profile: Partial<FamilyProfile>,
  occasion?: string,
  limit = 6
): Promise<RecommendationResult[]> {
  // In production: calls OpenAI Embeddings + vector similarity search
  // against product catalog. Uses profile's style preferences, body shape,
  // color analysis results to rank items.
  await new Promise((r) => setTimeout(r, 800));

  const results: RecommendationResult[] = MOCK_PRODUCTS.map((product) => {
    const colorScore = scoreColorMatch(product, profile);
    const fitScore = scoreFitMatch(product, profile);
    const styleScore = scoreStyleMatch(product, profile);
    const score = (colorScore * 0.3 + fitScore * 0.35 + styleScore * 0.35);

    return {
      product,
      score,
      colorScore,
      fitScore,
      styleScore,
      occasion,
      reasons: buildReasons(product, profile, colorScore, fitScore, styleScore),
    };
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function scoreColorMatch(product: MockProduct, profile: Partial<FamilyProfile>): number {
  const favoriteColors = profile.favoriteColors ?? [];
  const dislikedColors = profile.dislikedColors ?? [];

  const productColors = product.variants.map((v) => v.color?.toLowerCase() ?? "");
  const hasPreferred = productColors.some((c) =>
    favoriteColors.some((fc) => c.includes(fc.toLowerCase()))
  );
  const hasDisliked = productColors.some((c) =>
    dislikedColors.some((dc) => c.includes(dc.toLowerCase()))
  );

  if (hasPreferred && !hasDisliked) return 0.9 + Math.random() * 0.1;
  if (hasDisliked) return 0.3 + Math.random() * 0.2;
  return 0.6 + Math.random() * 0.25;
}

function scoreFitMatch(product: MockProduct, profile: Partial<FamilyProfile>): number {
  // Body shape based fit scoring
  const bodyShape = profile.bodyShape ?? "rectangle";
  const category = product.category;

  const fitMap: Record<string, Record<string, number>> = {
    hourglass: { dresses: 0.95, tops: 0.9, bottoms: 0.85, outerwear: 0.8 },
    pear: { dresses: 0.85, tops: 0.9, bottoms: 0.75, outerwear: 0.8 },
    apple: { dresses: 0.8, tops: 0.85, bottoms: 0.9, outerwear: 0.75 },
    rectangle: { dresses: 0.8, tops: 0.85, bottoms: 0.85, outerwear: 0.9 },
    "inverted-triangle": { dresses: 0.8, tops: 0.75, bottoms: 0.9, outerwear: 0.7 },
  };

  return (fitMap[bodyShape]?.[category] ?? 0.75) + (Math.random() * 0.1 - 0.05);
}

function scoreStyleMatch(product: MockProduct, profile: Partial<FamilyProfile>): number {
  const stylePrefs = profile.stylePreference ?? [];
  const tags = product.tags;
  const matches = tags.filter((t) => stylePrefs.some((sp) => sp.toLowerCase().includes(t.toLowerCase())));
  const base = matches.length > 0 ? 0.8 + matches.length * 0.05 : 0.6;
  return Math.min(base + Math.random() * 0.1, 1.0);
}

function buildReasons(
  product: MockProduct,
  profile: Partial<FamilyProfile>,
  colorScore: number,
  fitScore: number,
  styleScore: number
): string[] {
  const reasons: string[] = [];

  if (colorScore > 0.8) reasons.push("Colors complement your skin tone analysis");
  if (fitScore > 0.85) reasons.push(`Excellent fit for ${profile.bodyShape ?? "your"} body shape`);
  if (styleScore > 0.8) reasons.push("Matches your style preferences");
  if (product.isTrending) reasons.push("Trending this season");
  if (product.isNew) reasons.push("New arrival curated for you");
  if (product.rating && product.rating >= 4.8) reasons.push("Highly rated by customers with similar profiles");

  return reasons.slice(0, 3);
}
