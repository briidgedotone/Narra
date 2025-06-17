import { NextRequest, NextResponse } from "next/server";

import {
  scrapeCreatorsApi,
  transformTikTokProfile,
  transformTikTokVideo,
  type TikTokVideo,
  type TikTokProfile,
} from "@/lib/api/scrape-creators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const platform = searchParams.get("platform") || "tiktok";
    const count = parseInt(searchParams.get("count") || "12");

    if (!handle) {
      return NextResponse.json(
        { success: false, error: "Handle parameter is required" },
        { status: 400 }
      );
    }

    if (platform !== "tiktok") {
      return NextResponse.json(
        { success: false, error: "Only TikTok is supported currently" },
        { status: 400 }
      );
    }

    console.log(
      `[Creator Posts API] Fetching posts for ${platform} handle: ${handle}`
    );

    // First, get the profile to ensure it exists and get profile data
    const profileResponse = await scrapeCreatorsApi.tiktok.getProfile(handle);

    if (!profileResponse.success || !profileResponse.data) {
      return NextResponse.json({
        success: false,
        error: profileResponse.error || "Profile not found",
      });
    }

    // Transform profile data
    const profileData: TikTokProfile = transformTikTokProfile(
      profileResponse.data
    );

    // Get the profile videos
    const videosResponse = await scrapeCreatorsApi.tiktok.getProfileVideos(
      handle,
      count
    );

    if (!videosResponse.success || !videosResponse.data) {
      return NextResponse.json({
        success: false,
        error: videosResponse.error || "Failed to fetch videos",
      });
    }

    // Transform videos data - handle different possible response structures
    let videos: any[] = [];
    const responseData: any = videosResponse.data;

    if (Array.isArray(responseData)) {
      videos = responseData;
    } else if (responseData && typeof responseData === "object") {
      if (responseData.videos && Array.isArray(responseData.videos)) {
        videos = responseData.videos;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        videos = responseData.data;
      } else {
        console.log(
          "[Creator Posts API] Unexpected video response structure:",
          responseData
        );
        return NextResponse.json({
          success: false,
          error: "Unexpected video response structure",
        });
      }
    } else {
      console.log(
        "[Creator Posts API] Unexpected video response structure:",
        responseData
      );
      return NextResponse.json({
        success: false,
        error: "Unexpected video response structure",
      });
    }

    // Transform each video
    const transformedVideos: TikTokVideo[] = videos.map(video =>
      transformTikTokVideo(video, profileData)
    );

    console.log(
      `[Creator Posts API] Successfully fetched ${transformedVideos.length} posts`
    );

    return NextResponse.json({
      success: true,
      data: {
        profile: profileData,
        posts: transformedVideos,
        cached: videosResponse.cached,
      },
    });
  } catch (error) {
    console.error("[Creator Posts API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
