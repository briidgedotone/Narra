import { NextResponse } from "next/server";

import { scrapeCreatorsApi, transformers } from "@/lib/api";

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

    // Clean the handle
    const cleanHandle = handle.replace(/[@\s]/g, "");

    let result;
    if (platform === "tiktok") {
      result = await scrapeCreatorsApi.tiktok.getProfile(cleanHandle);
    } else {
      result = await scrapeCreatorsApi.instagram.getProfile(cleanHandle, true); // Use trim for faster response
    }

    const duration = Date.now() - startTime;

    if (result.success && result.data) {
      // Transform for Discovery page format
      const apiData = result.data as any;

      if (platform === "tiktok") {
        const user = apiData.user;
        const stats = apiData.stats || apiData.statsV2;

        const profile = {
          id: user.id || user.uniqueId,
          handle: user.uniqueId,
          displayName: user.nickname || user.uniqueId,
          platform: "tiktok",
          followers: parseInt(stats.followerCount) || 0,
          following: parseInt(stats.followingCount) || 0,
          posts: parseInt(stats.videoCount) || 0,
          bio: user.signature || "",
          avatarUrl:
            user.avatarLarger ||
            user.avatarMedium ||
            user.avatarThumb ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uniqueId}`,
          verified: user.verified || false,
        };

        return NextResponse.json({
          success: true,
          data: profile,
          cached: result.cached || false,
          duration: `${duration}ms`,
        });
      } else {
        // Instagram profile handling - Fixed to use correct data structure
        console.log("Instagram API response structure:", {
          hasData: !!apiData.data,
          hasUser: !!apiData.data?.user,
          userKeys: apiData.data?.user
            ? Object.keys(apiData.data.user).slice(0, 10)
            : [],
        });

        // Use our transformer function for consistent data extraction
        const transformedProfile =
          transformers.instagram.profileToAppFormat(apiData);

        if (!transformedProfile) {
          return NextResponse.json({
            success: false,
            error: "Failed to transform Instagram profile data",
            duration: `${duration}ms`,
            debug: {
              hasData: !!apiData.data,
              hasUser: !!apiData.data?.user,
              rawStructure: Object.keys(apiData).slice(0, 5),
            },
          });
        }

        // Convert to Discovery page format
        const profile = {
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

        console.log("Successfully transformed Instagram profile:", {
          handle: profile.handle,
          followers: profile.followers,
          posts: profile.posts,
          verified: profile.verified,
        });

        return NextResponse.json({
          success: true,
          data: profile,
          cached: result.cached || false,
          duration: `${duration}ms`,
        });
      }
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
