import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateBodyMeasurements } from "@/lib/ai/body-model";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, imageUrl, height, weight } = body;

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    // Verify profile belongs to user
    const profile = await prisma.familyProfile.findFirst({
      where: { id: profileId, userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Run AI estimation
    const estimation = await estimateBodyMeasurements(imageUrl, height, weight);

    // Persist measurements
    const measurement = await prisma.bodyMeasurement.create({
      data: {
        profileId,
        chest: estimation.measurements.chest,
        waist: estimation.measurements.waist,
        hip: estimation.measurements.hip,
        shoulder: estimation.measurements.shoulder,
        inseam: estimation.measurements.inseam,
        armLength: estimation.measurements.armLength,
        neckCircumference: estimation.measurements.neckCircumference,
        unit: estimation.measurements.unit,
        confidence: estimation.confidence,
      },
    });

    // Update profile body shape
    await prisma.familyProfile.update({
      where: { id: profileId },
      data: { bodyShape: estimation.bodyShape },
    });

    // Persist model version
    await prisma.bodyModelVersion.create({
      data: {
        profileId,
        estimationMethod: estimation.method,
        modelData: JSON.parse(JSON.stringify(estimation.measurements)),
        isActive: true,
      },
    });

    return NextResponse.json({ measurement, estimation }, { status: 201 });
  } catch (error) {
    console.error("POST /api/body-model error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
