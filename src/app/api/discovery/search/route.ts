import { NextRequest, NextResponse } from "next/server";

import {
  fetchInstagramProfile,
  fetchTikTokProfile,
} from "@/lib/api/scrapecreators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const handle = searchParams.get("handle");

    // Validate inputs
    if (!platform || !handle) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing platform or handle parameter",
        },
        { status: 400 }
      );
    }

    if (!["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: "Platform must be 'instagram' or 'tiktok'",
        },
        { status: 400 }
      );
    }

    // Clean handle (remove @ if present)
    const cleanHandle = handle.replace(/^@/, "").trim();

    if (!cleanHandle) {
      return NextResponse.json(
        {
          success: false,
          error: "Handle cannot be empty",
        },
        { status: 400 }
      );
    }

    // Call appropriate API based on platform
    let result;
    if (platform === "instagram") {
      result = await fetchInstagramProfile(cleanHandle);
    } else {
      result = await fetchTikTokProfile(cleanHandle);
    }

    // Return the result from our ScrapeCreators client
    return NextResponse.json(result);
  } catch (error) {
    console.error("Discovery search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
