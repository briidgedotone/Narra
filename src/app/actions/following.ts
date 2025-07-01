"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { DatabaseService } from "@/lib/database";

const db = new DatabaseService();

export async function followProfile(profileId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const result = await db.followProfile(userId, profileId);

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
