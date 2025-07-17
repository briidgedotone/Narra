import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Use local refresh function instead of edge function
    const { refreshProfileForUser } = await import("@/lib/refresh-profile");

    const result = await refreshProfileForUser(userId, profileId);

    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message,
    });
  } catch (error) {
    console.error("Refresh profile API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
