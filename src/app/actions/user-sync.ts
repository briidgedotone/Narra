"use server";

import { currentUser } from "@clerk/nextjs/server";

import { syncUserToDatabase } from "@/lib/auth/sync";

/**
 * Server action to sync current user to database
 * Called from client components to ensure user exists in database
 */
export async function syncCurrentUserToDatabase() {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      throw new Error("No authenticated user found");
    }

    // Sync to database
    const dbUser = await syncUserToDatabase(clerkUser);

    return {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        subscriptionStatus: dbUser.subscription_status,
      },
    };
  } catch (error) {
    console.error("Error in syncCurrentUserToDatabase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
