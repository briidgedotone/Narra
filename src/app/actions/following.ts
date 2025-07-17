"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/database";

export async function followProfile(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check user's plan and current follows
    const user = await db.getUserById(userId);
    if (!user?.plan_id) {
      throw new Error("No active plan. Please select a plan to continue.");
    }

    // Get plan limits by creating a temporary client query
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: planData } = await supabase
      .from("plans")
      .select("limits")
      .eq("id", user.plan_id)
      .single();

    const followLimit = planData?.limits?.profile_follows || 0;

    // Get current follow count
    const { count: currentFollows } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Check if user has reached limit
    if ((currentFollows || 0) >= followLimit) {
      throw new Error(
        `Profile follow limit reached. You can follow up to ${followLimit} profiles on your current plan.`
      );
    }

    const result = await db.followProfile(userId, profileId);

    // Trigger immediate refresh for the new follow (via API)
    try {
      console.log(`🔄 Triggering immediate refresh for profile: ${profileId}`);
      
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/refresh-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profileId, userId }),
        }
      );
      
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        console.log(`📊 Refresh result:`, refreshResult);
        console.log(`✅ Successfully refreshed profile: ${refreshResult.data?.newPosts || 0} new posts`);
      } else {
        const errorResult = await refreshResponse.json();
        console.error(`❌ Refresh failed with status ${refreshResponse.status}:`, errorResult);
      }
    } catch (error) {
      // Don't let refresh failures affect the follow action
      console.error("Failed to trigger immediate refresh:", error);
    }

    // Revalidate relevant pages
    revalidatePath("/following");
    revalidatePath("/discovery");

    return { success: true, data: result };
  } catch (error) {
    console.error("Follow profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to follow profile",
    };
  }
}

export async function unfollowProfile(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await db.unfollowProfile(userId, profileId);

    // Revalidate relevant pages
    revalidatePath("/following");
    revalidatePath("/discovery");

    return { success: true };
  } catch (error) {
    console.error("Unfollow profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unfollow profile",
    };
  }
}

export async function getFollowedProfiles() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const profiles = await db.getFollowedProfiles(userId);

    return { success: true, data: profiles || [] };
  } catch (error) {
    console.error("Get followed profiles error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch followed profiles",
      data: [],
    };
  }
}

export async function getFollowedPosts(limit = 50, offset = 0) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const posts = await db.getFollowedPosts(userId, limit, offset);

    return { success: true, data: posts || [] };
  } catch (error) {
    console.error("Get followed posts error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch followed posts",
      data: [],
    };
  }
}

export async function checkIfFollowing(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: true, data: false };
    }

    const isFollowing = await db.isFollowing(userId, profileId);

    return { success: true, data: isFollowing };
  } catch (error) {
    console.error("Check following status error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check following status",
      data: false,
    };
  }
}

export async function getLastRefreshTime() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const lastRefresh = await db.getLastRefreshTime(userId);

    return { success: true, data: lastRefresh };
  } catch (error) {
    console.error("Get last refresh time error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get last refresh time",
      data: null,
    };
  }
}
