import { NextRequest, NextResponse } from "next/server";

import { refreshProfileForUser } from "@/lib/refresh-profile";

export async function POST(request: NextRequest) {
  try {
    const { userId, profileId } = await request.json();

    if (!userId || !profileId) {
      return NextResponse.json(
        { error: "Missing userId or profileId" },
        { status: 400 }
      );
    }

    // Start the refresh process without waiting for it to complete
    refreshProfileForUser(userId, profileId).catch(error => {
      console.error("Background refresh failed:", error);
    });

    // Return immediately
    return NextResponse.json({ success: true, message: "Refresh started" });
  } catch (error) {
    console.error("Async refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
