"use server";

import { revalidatePath } from "next/cache";

import { scrapeCreatorsApi, transformers } from "@/lib/api/scrape-creators";
import { db } from "@/lib/database";

export async function refreshProfile(profileId: string) {
  try {
    const profile = await db.getProfileById(profileId);

    if (!profile) {
      throw new Error("Profile not found");
    }

    let apiResult;
    if (profile.platform === "tiktok") {
      apiResult = await scrapeCreatorsApi.tiktok.getProfile(profile.handle);
    } else {
      apiResult = await scrapeCreatorsApi.instagram.getProfile(profile.handle);
    }

    if (!apiResult.success || !apiResult.data) {
      throw new Error("Failed to fetch latest profile data from API.");
    }

    let transformedProfile;
    if (profile.platform === "tiktok") {
      transformedProfile = transformers.tiktok.profileToAppFormat(
        apiResult.data
      );
    } else {
      transformedProfile = transformers.instagram.profileToAppFormat(
        apiResult.data
      );
    }

    if (!transformedProfile) {
      throw new Error("Failed to transform profile data.");
    }

    await db.updateProfile(profile.id, {
      display_name: transformedProfile.displayName,
      bio: transformedProfile.bio,
      followers_count: transformedProfile.followers,
      avatar_url: transformedProfile.avatarUrl,
      verified: transformedProfile.verified,
      last_updated: new Date().toISOString(),
    });

    revalidatePath("/following");

    return { success: true };
  } catch (error) {
    console.error(`Failed to refresh profile ${profileId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
