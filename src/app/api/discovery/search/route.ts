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

    // Add debugging
    console.log("ScrapeCreators API Response for", platform, cleanHandle, ":");
    console.log("Success:", result.success);
    if (result.success && result.data) {
      console.log("Data keys:", Object.keys(result.data));
      if (result.data.user) {
        console.log("User keys:", Object.keys(result.data.user));
      } else {
        console.log("No 'user' property found in data");
        console.log(
          "Full data structure:",
          JSON.stringify(result.data, null, 2)
        );
      }
    } else if (!result.success) {
      console.log("Error:", result.error);
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
