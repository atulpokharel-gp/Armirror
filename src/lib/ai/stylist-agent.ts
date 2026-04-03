export interface StylistMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StylistContext {
  profileName?: string;
  bodyShape?: string;
  colorSeason?: string;
  stylePreferences?: string[];
  occasion?: string;
  budget?: { min: number; max: number };
}

const STYLIST_RESPONSES: Record<string, string[]> = {
  default: [
    "Based on your profile, I'd recommend building a capsule wardrobe around neutral tones with a few statement pieces in your best colors.",
    "For your body shape, A-line silhouettes and wrap styles will be incredibly flattering. Would you like specific recommendations?",
    "I'm analyzing your style preferences to curate the perfect looks for you. Shall we start with occasion wear or everyday essentials?",
  ],
  occasion: [
    "For a formal occasion with your profile, I'd suggest a tailored midi dress in a jewel tone or a classic pantsuit.",
    "A work-appropriate look for you could be high-waisted trousers paired with a silk blouse and structured blazer.",
    "For a casual weekend, try relaxed wide-leg pants with a fitted top – it will balance your proportions beautifully.",
  ],
  color: [
    "Your seasonal color palette suggests warm earth tones will make your complexion glow. Think terracotta, camel, and olive.",
    "Based on your skin tone analysis, I'd recommend staying away from cool grays and opt for warmer neutrals instead.",
    "Your best accent colors are jewel tones – emerald, burgundy, and sapphire will all complement your undertone perfectly.",
  ],
  budget: [
    "Great news! I can find excellent options within your budget. Quality investments in basics pay off long-term.",
    "For your budget, I'd prioritize a versatile blazer and quality denim – these will work with everything.",
    "Smart shopping tip: invest in timeless basics and be selective with trend pieces.",
  ],
};

export async function getStylistResponse(
  messages: StylistMessage[],
  context: StylistContext
): Promise<string> {
  // In production: calls OpenAI GPT-4o with system prompt containing
  // the user's full style profile, body measurements, and color analysis.
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));

  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  let category = "default";
  if (lastMessage.includes("occasion") || lastMessage.includes("event") || lastMessage.includes("wear")) {
    category = "occasion";
  } else if (lastMessage.includes("color") || lastMessage.includes("colour") || lastMessage.includes("tone")) {
    category = "color";
  } else if (lastMessage.includes("budget") || lastMessage.includes("price") || lastMessage.includes("afford")) {
    category = "budget";
  }

  const responses = STYLIST_RESPONSES[category];
  const response = responses[Math.floor(Math.random() * responses.length)];

  const profileGreeting = context.profileName
    ? `Great question! As your personal AI stylist for ${context.profileName}, `
    : "As your personal AI stylist, ";

  return `${profileGreeting}${response}\n\n*AI Estimated recommendation based on your style profile and body analysis.*`;
}
