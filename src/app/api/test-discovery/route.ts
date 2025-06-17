import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api";

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
      result = await scrapeCreatorsApi.instagram.getProfile(cleanHandle);
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
          rawApiData: apiData, // For debugging
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Instagram not implemented yet",
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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
