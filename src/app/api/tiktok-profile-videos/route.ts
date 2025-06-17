import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const maxCursor = searchParams.get("max_cursor") || undefined;

    if (!handle) {
      return NextResponse.json(
        { error: "Handle parameter is required" },
        { status: 400 }
      );
    }

    console.log(
      `[API] Fetching TikTok videos for handle: ${handle}${maxCursor ? `, cursor: ${maxCursor}` : ""}`
    );

    const startTime = Date.now();
    const result = await scrapeCreatorsApi.tiktok.getProfileVideos(
      handle,
      maxCursor
    );
    const endTime = Date.now();

    if (!result.success) {
      console.error(
        `[API] Failed to fetch TikTok videos for ${handle}:`,
        result.error
      );
      return NextResponse.json(
        { error: result.error || "Failed to fetch profile videos" },
        { status: 500 }
      );
    }

    console.log(
      `[API] Successfully fetched ${result.data!.posts.length} videos for ${handle} in ${endTime - startTime}ms (cached: ${result.cached})`
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      performance: {
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error in TikTok videos endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
