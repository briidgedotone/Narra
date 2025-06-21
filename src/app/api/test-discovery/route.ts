import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

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

    console.log(`[Discovery API] Searching for ${platform} profile: ${cleanHandle}`);

    let result;
    if (platform === "tiktok") {
      result = await scrapeCreatorsApi.tiktok.getProfile(cleanHandle);
    } else {
      result = await scrapeCreatorsApi.instagram.getProfile(cleanHandle);
    }

    const duration = Date.now() - startTime;

    console.log(`[Discovery API] API call completed in ${duration}ms`, {
      success: result.success,
      hasData: !!result.data,
      error: result.error,
      cached: result.cached
    });

    if (result.success && result.data) {
      // Transform for Discovery page format
      const apiData = result.data as Record<string, unknown>;

      if (platform === "tiktok") {
        const user = apiData.user as Record<string, unknown>;
        const stats = (apiData.stats || apiData.statsV2) as Record<string, unknown>;

        const profile = {
          id: (user.id as string) || (user.uniqueId as string),
          handle: user.uniqueId as string,
          displayName: (user.nickname as string) || (user.uniqueId as string),
          platform: "tiktok" as const,
          followers: parseInt((stats.followerCount as string) || "0") || 0,
          following: parseInt((stats.followingCount as string) || "0") || 0,
          posts: parseInt((stats.videoCount as string) || "0") || 0,
          bio: (user.signature as string) || "",
          avatarUrl:
            (user.avatarLarger as string) ||
            (user.avatarMedium as string) ||
            (user.avatarThumb as string) ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uniqueId as string}`,
          verified: (user.verified as boolean) || false,
        };

        return NextResponse.json({
          success: true,
          data: profile,
          cached: result.cached || false,
          duration: `${duration}ms`,
          rawApiData: apiData, // For debugging
        });
      } else {
        // Instagram profile parsing with better error handling
        console.log(`[Discovery API] Instagram API response structure:`, {
          hasUser: !!apiData.user,
          dataKeys: Object.keys(apiData),
          userKeys: apiData.user ? Object.keys(apiData.user) : null
        });

        if (!apiData.user) {
          console.error(`[Discovery API] No user data in Instagram response:`, apiData);
          return NextResponse.json({
            success: false,
            error: "Invalid Instagram profile response - no user data found",
            duration: `${duration}ms`,
            debug: {
              apiData: apiData,
              message: "API returned success but no user object found"
            }
          });
        }

        const user = apiData.user as Record<string, unknown>;

        // Validate required fields
        if (!user.username) {
          console.error(`[Discovery API] Instagram user missing username:`, user);
          return NextResponse.json({
            success: false,
            error: "Invalid Instagram profile - missing username",
            duration: `${duration}ms`,
            debug: {
              userFields: Object.keys(user),
              message: "User object exists but missing required fields"
            }
          });
        }

        const profile = {
          id: (user.id as string) || (user.username as string),
          handle: user.username as string,
          displayName: (user.full_name as string) || (user.username as string),
          platform: "instagram" as const,
          followers: ((user.edge_followed_by as Record<string, unknown>)?.count as number) || 0,
          following: ((user.edge_follow as Record<string, unknown>)?.count as number) || 0,
          posts: ((user.edge_owner_to_timeline_media as Record<string, unknown>)?.count as number) || 0,
          bio: (user.biography as string) || "",
          avatarUrl:
            (user.profile_pic_url_hd as string) ||
            (user.profile_pic_url as string) ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username as string}`,
          verified: (user.is_verified as boolean) || false,
        };

        console.log(`[Discovery API] Successfully parsed Instagram profile:`, {
          handle: profile.handle,
          displayName: profile.displayName,
          followers: profile.followers,
          verified: profile.verified
        });

        return NextResponse.json({
          success: true,
          data: profile,
          cached: result.cached || false,
          duration: `${duration}ms`,
          rawApiData: apiData, // For debugging
        });
      }
    } else {
      console.error(`[Discovery API] API call failed:`, {
        success: result.success,
        error: result.error,
        platform,
        handle: cleanHandle
      });

      return NextResponse.json({
        success: false,
        error: result.error || "Profile not found",
        duration: `${duration}ms`,
        debug: {
          platform,
          handle: cleanHandle,
          apiResult: result
        }
      });
    }
  } catch (error) {
    console.error(`[Discovery API] Exception occurred:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          message: "Exception thrown during API processing",
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : error,
          platform,
          handle
        }
      },
      { status: 500 }
    );
  }
}
