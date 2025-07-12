import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";
import { transformers } from "@/lib/transformers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .select("plan_id, monthly_profile_discoveries")
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

    const monthlyLimit = planData?.limits?.profile_discoveries || 0;
    const currentUsage = userData.monthly_profile_discoveries || 0;

    // Check if user has reached limit
    if (currentUsage >= monthlyLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "Monthly discovery limit reached",
          limitReached: true,
          currentUsage,
          monthlyLimit,
          planId: userData.plan_id,
        },
        { status: 429 }
      );
    }

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

      // Increment usage counter
      await supabase
        .from("users")
        .update({
          monthly_profile_discoveries: currentUsage + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        data: profile,
        cached: result.cached || false,
        duration: `${duration}ms`,
        usage: {
          current: currentUsage + 1,
          limit: monthlyLimit,
          remaining: monthlyLimit - (currentUsage + 1),
        },
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
