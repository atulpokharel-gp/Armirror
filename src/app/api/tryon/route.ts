import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateTryonImage } from "@/lib/ai/tryon";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, productImageUrl, profileId, variantColor } = body;

    if (!productId || !profileId) {
      return NextResponse.json({ error: "productId and profileId are required" }, { status: 400 });
    }

    const result = await generateTryonImage({
      productId,
      productImageUrl: productImageUrl ?? "",
      profileId,
      variantColor,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/tryon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
