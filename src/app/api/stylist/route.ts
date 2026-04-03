import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStylistResponse, StylistMessage } from "@/lib/ai/stylist-agent";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, context } = body as { messages: StylistMessage[]; context: Record<string, unknown> };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const response = await getStylistResponse(messages, context ?? {});

    return NextResponse.json({ response });
  } catch (error) {
    console.error("POST /api/stylist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
