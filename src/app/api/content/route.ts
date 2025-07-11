import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi, transformers } from "@/lib/api/scrape-creators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const type = searchParams.get("type");
  const handle = searchParams.get("handle");

  if (!platform || !type || !handle) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required parameters: platform, type, handle",
      },
      { status: 400 }
    );
  }

  try {
    let result;

    if (platform === "tiktok") {
      if (type === "videos") {
        const videoCount = parseInt(searchParams.get("count") || "5");
        const cursorParam = searchParams.get("cursor") || undefined;
        result = await scrapeCreatorsApi.tiktok.getProfileVideos(
          handle,
          videoCount,
          cursorParam
        );
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid type for TikTok. Use: videos" },
          { status: 400 }
        );
      }
    } else if (platform === "instagram") {
      if (type === "posts") {
        const postsCount = parseInt(searchParams.get("count") || "5");
        const nextMaxId = searchParams.get("next_max_id");
        result = await scrapeCreatorsApi.instagram.getPosts(
          handle,
          postsCount,
          nextMaxId || undefined
        );
      } else if (type === "transformed") {
        // Get profile and posts data with transformation
        const profileResult = await scrapeCreatorsApi.instagram.getProfile(
          handle,
          true
        );
        let profileData = null;

        if (profileResult.success && profileResult.data) {
          profileData = transformers.instagram.profileToAppFormat(
            profileResult.data
          );
        }

        const postsResult = await scrapeCreatorsApi.instagram.getPosts(
          handle,
          5
        );
        let postsData: any[] = [];

        if (postsResult.success && postsResult.data) {
          postsData = transformers.instagram.postsToAppFormat(
            postsResult.data,
            handle
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            profile: profileData,
            posts: postsData,
            postsCount: postsData.length,
          },
          cached: profileResult.cached || postsResult.cached,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid type for Instagram. Use: posts, transformed",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform. Use: tiktok, instagram",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Content API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
