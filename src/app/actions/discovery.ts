"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { DatabaseService } from "@/lib/database";

const db = new DatabaseService();

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
