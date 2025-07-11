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

    // Validate that it's a supported platform URL
    const isTikTok = videoUrl.includes("tiktok.com");
    const isInstagram = videoUrl.includes("instagram.com");

    if (!isTikTok && !isInstagram) {
      return NextResponse.json(
        {
          success: false,
          error: "Only TikTok and Instagram URLs are supported",
        },
        { status: 400 }
      );
    }

    const result = isTikTok
      ? await scrapeCreatorsApi.tiktok.getVideoTranscript(videoUrl, language)
      : await scrapeCreatorsApi.instagram.getVideoTranscript(videoUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fetch transcript" },
        { status: 500 }
      );
    }

    // Transform the response to match our interface
    let transcriptText = "";

    if (isTikTok) {
      // TikTok response format: { transcript: "text..." }
      transcriptText = (result.data as any)?.transcript || "";
    } else {
      // Instagram response format: { transcripts: [{ text: "..." }] }
      const transcripts = (result.data as any)?.transcripts;
      if (transcripts && transcripts.length > 0) {
        transcriptText = transcripts[0].text || "";
      }
    }

    const transcriptData = {
      id: (result.data as any)?.id || "unknown",
      url: (result.data as any)?.url || videoUrl,
      transcript: transcriptText,
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
