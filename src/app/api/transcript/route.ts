import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check user's plan and usage
    const { data: userData } = await supabase
      .from("users")
      .select("plan_id, monthly_transcripts_viewed")
      .eq("id", user.id)
      .single();

    if (!userData?.plan_id) {
      return NextResponse.json(
        {
          success: false,
          error: "No active plan. Please select a plan to continue.",
        },
        { status: 403 }
      );
    }

    // Get plan limits
    const { data: planData } = await supabase
      .from("plans")
      .select("limits")
      .eq("id", userData.plan_id)
      .single();

    const monthlyLimit = planData?.limits?.transcript_views || 0;
    const currentUsage = userData.monthly_transcripts_viewed || 0;

    // Check if user has reached limit
    if (currentUsage >= monthlyLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly transcript limit reached",
          limitReached: true,
          currentUsage,
          monthlyLimit,
          planId: userData.plan_id,
        },
        { status: 429 }
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

    // Increment usage counter
    await supabase
      .from("users")
      .update({
        monthly_transcripts_viewed: currentUsage + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      data: transcriptData,
      usage: {
        current: currentUsage + 1,
        limit: monthlyLimit,
        remaining: monthlyLimit - (currentUsage + 1),
      },
    });
  } catch (error) {
    console.error("Transcript API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
