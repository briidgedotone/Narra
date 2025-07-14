"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/database";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createAndFollowProfile(profileData: {
  handle: string;
  platform: "tiktok" | "instagram";
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  avatarUrl: string;
  verified: boolean;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check user's plan and current follow count
    const { data: userData } = await supabase
      .from("users")
      .select("plan_id")
      .eq("id", userId)
      .single();

    if (!userData?.plan_id) {
      throw new Error("No active plan. Please select a plan to continue.");
    }

    // Get plan limits
    const { data: planData } = await supabase
      .from("plans")
      .select("limits")
      .eq("id", userData.plan_id)
      .single();

    const followLimit = planData?.limits?.profile_follows || 0;

    // Count current follows
    const { count: currentFollows } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Check if user has reached follow limit
    if ((currentFollows || 0) >= followLimit) {
      throw new Error(
        `Follow limit reached (${currentFollows}/${followLimit}). Upgrade to follow more profiles.`
      );
    }

    // First, check if profile already exists
    let profile = await db.getProfileByHandle(
      profileData.handle,
      profileData.platform
    );

    if (!profile) {
      // Create the profile if it doesn't exist
      profile = await db.createProfile({
        handle: profileData.handle,
        platform: profileData.platform,
        display_name: profileData.displayName,
        bio: profileData.bio,
        followers_count: profileData.followers,
        avatar_url: profileData.avatarUrl,
        verified: profileData.verified,
      });
    } else {
      // Update existing profile with latest data
      await db.updateProfile(profile.id, {
        display_name: profileData.displayName,
        bio: profileData.bio,
        followers_count: profileData.followers,
        avatar_url: profileData.avatarUrl,
        verified: profileData.verified,
        last_updated: new Date().toISOString(),
      });
    }

    // Now follow the profile
    const followResult = await db.followProfile(userId, profile.id);

    // Revalidate relevant pages
    revalidatePath("/following");
    revalidatePath("/discovery");

    return { success: true, data: { profile, follow: followResult } };
  } catch (error) {
    console.error("Create and follow profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to follow profile",
    };
  }
}

export async function unfollowProfileByHandle(
  handle: string,
  platform: "tiktok" | "instagram"
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find the profile
    const profile = await db.getProfileByHandle(handle, platform);

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Unfollow the profile
    await db.unfollowProfile(userId, profile.id);

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

export async function checkFollowStatus(
  handle: string,
  platform: "tiktok" | "instagram"
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: true, data: false };
    }

    // Find the profile
    const profile = await db.getProfileByHandle(handle, platform);

    if (!profile) {
      return { success: true, data: false };
    }

    // Check if following
    const isFollowing = await db.isFollowing(userId, profile.id);

    return { success: true, data: isFollowing };
  } catch (error) {
    console.error("Check follow status error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check follow status",
      data: false,
    };
  }
}
