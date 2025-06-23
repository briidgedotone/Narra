import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";
import { transformers } from "@/lib/transformers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform") || "tiktok";

  if (!handle) {
    return NextResponse.json(
      { success: false, error: "Handle parameter required" },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();

    // Clean the handle - remove @ and whitespace
    const cleanHandle = handle.replace(/[@\s]/g, "");

    let result;
    if (platform === "tiktok") {
      result = await scrapeCreatorsApi.tiktok.getProfile(cleanHandle);
    } else if (platform === "instagram") {
      result = await scrapeCreatorsApi.instagram.getProfile(cleanHandle, true); // Use trim for faster response
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform. Use 'tiktok' or 'instagram'",
        },
        { status: 400 }
      );
    }

    const duration = Date.now() - startTime;

    if (result.success && result.data) {
      let profile;

      if (platform === "tiktok") {
        // Use transformer for TikTok
        const transformedProfile = transformers.tiktok.profileToAppFormat(
          result.data
        );

        if (!transformedProfile) {
          return NextResponse.json({
            success: false,
            error: "Failed to transform TikTok profile data",
            duration: `${duration}ms`,
          });
        }

        profile = {
          id: transformedProfile.handle,
          handle: transformedProfile.handle,
          displayName: transformedProfile.displayName,
          platform: "tiktok",
          followers: transformedProfile.followers,
          following: transformedProfile.following,
          posts: transformedProfile.posts,
          bio: transformedProfile.bio,
          avatarUrl:
            transformedProfile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${transformedProfile.handle}`,
          verified: transformedProfile.verified,
        };
      } else {
        // Use transformer for Instagram
        const transformedProfile = transformers.instagram.profileToAppFormat(
          result.data
        );

        if (!transformedProfile) {
          return NextResponse.json({
            success: false,
            error: "Failed to transform Instagram profile data",
            duration: `${duration}ms`,
          });
        }

        profile = {
          id: transformedProfile.handle,
          handle: transformedProfile.handle,
          displayName: transformedProfile.displayName,
          platform: "instagram",
          followers: transformedProfile.followers,
          following: transformedProfile.following,
          posts: transformedProfile.posts,
          bio: transformedProfile.bio,
          avatarUrl:
            transformedProfile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${transformedProfile.handle}`,
          verified: transformedProfile.verified,
          isPrivate: transformedProfile.isPrivate,
          isBusiness: transformedProfile.isBusiness,
          category: transformedProfile.category,
          externalUrl: transformedProfile.externalUrl,
        };
      }

      return NextResponse.json({
        success: true,
        data: profile,
        cached: result.cached || false,
        duration: `${duration}ms`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Profile not found",
        duration: `${duration}ms`,
      });
    }
  } catch (error) {
    console.error("Discovery API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
