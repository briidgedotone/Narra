import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");
    const language = searchParams.get("language") || "en";

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Validate that it's a TikTok URL
    if (!videoUrl.includes("tiktok.com")) {
      return NextResponse.json(
        { success: false, error: "Only TikTok URLs are supported" },
        { status: 400 }
      );
    }

    console.log(
      `🎯 API: Fetching transcript for: ${videoUrl} (language: ${language})`
    );

    const result = await scrapeCreatorsApi.tiktok.getVideoTranscript(
      videoUrl,
      language
    );

    console.log(`📡 API: ScrapeCreators response:`, {
      success: result.success,
      cached: result.cached,
      hasData: !!result.data,
      error: result.error,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fetch transcript" },
        { status: 500 }
      );
    }

    // Transform the response to match our interface
    const transcriptData = {
      id: (result.data as any)?.id || "unknown",
      url: (result.data as any)?.url || videoUrl,
      transcript: (result.data as any)?.transcript || "",
      cached: result.cached || false,
    };

    return NextResponse.json({
      success: true,
      data: transcriptData,
    });
  } catch (error) {
    console.error("Transcript API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
