import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") || "adrianhorning";

  try {
    console.log(`Testing Instagram profile fetch for: ${handle}`);

    const result = await scrapeCreatorsApi.instagram.getProfile(handle);

    console.log("Raw API result:", JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      const apiData = result.data as Record<string, unknown>;

      const user = apiData.user as Record<string, unknown>;

      console.log("API data structure:", {
        hasUser: !!user,
        userKeys: user ? Object.keys(user) : [],
        sampleFields: user
          ? {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              followers: (user.edge_followed_by as Record<string, unknown>)
                ?.count,
              following: (user.edge_follow as Record<string, unknown>)?.count,
              posts: (
                user.edge_owner_to_timeline_media as Record<string, unknown>
              )?.count,
            }
          : null,
      });
      const profile = {
        id: user.id as string,
        handle: user.username as string,
        displayName: (user.full_name as string) || (user.username as string),
        platform: "instagram" as const,
        followers:
          ((user.edge_followed_by as Record<string, unknown>)
            ?.count as number) || 0,
        following:
          ((user.edge_follow as Record<string, unknown>)?.count as number) || 0,
        posts:
          ((user.edge_owner_to_timeline_media as Record<string, unknown>)
            ?.count as number) || 0,
        bio: (user.biography as string) || "",
        avatarUrl:
          (user.profile_pic_url_hd as string) ||
          (user.profile_pic_url as string) ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username as string}`,
        verified: (user.is_verified as boolean) || false,
      };

      return NextResponse.json({
        success: true,
        data: profile,
        cached: result.cached || false,
        rawApiData: apiData,
        debug: {
          message: "Instagram profile successfully parsed",
          transformedProfile: profile,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Profile not found",
        debug: {
          message: "API call failed",
          result: result,
        },
      });
    }
  } catch (error) {
    console.error("Instagram test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          message: "Exception thrown during API call",
          error: error,
        },
      },
      { status: 500 }
    );
  }
}
