import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateRecommendations } from "@/lib/ai/recommendations";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const occasion = searchParams.get("occasion") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "6");

    // In production, fetch real profile from DB and use it for recommendations
    const mockProfile = {
      bodyShape: "hourglass",
      stylePreference: ["Minimalist", "Classic"],
      favoriteColors: ["Cream", "Navy"],
      dislikedColors: [],
    };

    const recommendations = await generateRecommendations(mockProfile, occasion, limit);

    return NextResponse.json({ recommendations, profileId });
  } catch (error) {
    console.error("GET /api/recommendations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
