import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profiles = await prisma.familyProfile.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { measurements: { orderBy: { createdAt: "desc" }, take: 1 }, skinToneProfile: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("GET /api/profiles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, relationship, ageGroup, gender, height, weight,
      bodyShape, clothingSize, shoeSize, fitPreference,
      stylePreference, favoriteBrands, favoriteColors, dislikedColors,
    } = body;

    if (!name || !relationship || !ageGroup || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profile = await prisma.familyProfile.create({
      data: {
        userId: session.user.id,
        name,
        relationship,
        ageGroup,
        gender,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bodyShape: bodyShape ?? null,
        clothingSize: clothingSize ?? null,
        shoeSize: shoeSize ?? null,
        fitPreference: fitPreference ?? null,
        stylePreference: stylePreference ?? [],
        favoriteBrands: favoriteBrands ?? [],
        favoriteColors: favoriteColors ?? [],
        dislikedColors: dislikedColors ?? [],
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("POST /api/profiles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
