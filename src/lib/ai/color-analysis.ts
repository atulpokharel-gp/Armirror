export interface ColorAnalysis {
  undertone: "warm" | "cool" | "neutral";
  season: "spring" | "summer" | "autumn" | "winter";
  fitzpatrickScale: 1 | 2 | 3 | 4 | 5 | 6;
  dominantColors: string[];
  bestColors: string[];
  avoidColors: string[];
  seasonalPalette: Record<string, string[]>;
}

export async function analyzeColorPalette(_imageUrl: string): Promise<ColorAnalysis> {
  // In production: calls computer vision API (Google Vision / custom CNN)
  // to extract dominant skin tone hex values, then classifies undertone.
  await new Promise((r) => setTimeout(r, 1200));

  const analyses: ColorAnalysis[] = [
    {
      undertone: "warm",
      season: "autumn",
      fitzpatrickScale: 3,
      dominantColors: ["#c8956c", "#e8b89a", "#a0714f"],
      bestColors: ["#c19a6b", "#8b4513", "#2e8b57", "#d2691e", "#8fbc8f", "#cd853f"],
      avoidColors: ["#c0c0c0", "#add8e6", "#ffb6c1", "#e6e6fa"],
      seasonalPalette: {
        primary: ["#8b4513", "#d2691e", "#228b22", "#2e8b57"],
        neutral: ["#c19a6b", "#d2b48c", "#f5deb3", "#8b7355"],
        accent: ["#cd853f", "#a0522d", "#6b8e23"],
      },
    },
    {
      undertone: "cool",
      season: "winter",
      fitzpatrickScale: 2,
      dominantColors: ["#f5e6d3", "#e8d5c4", "#c9b5a8"],
      bestColors: ["#000080", "#800000", "#4b0082", "#ffffff", "#808080", "#dc143c"],
      avoidColors: ["#ff7f50", "#ffd700", "#98fb98", "#f0e68c"],
      seasonalPalette: {
        primary: ["#000080", "#800000", "#4b0082", "#008080"],
        neutral: ["#ffffff", "#c0c0c0", "#808080", "#000000"],
        accent: ["#dc143c", "#9400d3", "#1e90ff"],
      },
    },
    {
      undertone: "neutral",
      season: "spring",
      fitzpatrickScale: 2,
      dominantColors: ["#ffe4b5", "#ffd5a5", "#f5c89a"],
      bestColors: ["#ff69b4", "#98fb98", "#87ceeb", "#ffd700", "#ff6347", "#7fffd4"],
      avoidColors: ["#8b4513", "#4a4a4a", "#8b0000"],
      seasonalPalette: {
        primary: ["#ff69b4", "#ff6347", "#ffd700", "#32cd32"],
        neutral: ["#fffaf0", "#fff5ee", "#faebd7", "#faf0e6"],
        accent: ["#87ceeb", "#98fb98", "#dda0dd"],
      },
    },
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
}

export function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    spring: "Spring (Light & Warm)",
    summer: "Summer (Light & Cool)",
    autumn: "Autumn (Deep & Warm)",
    winter: "Winter (Deep & Cool)",
  };
  return labels[season] ?? season;
}
