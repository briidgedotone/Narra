"use server";

import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";

/**
 * Server action to check if current user is admin
 * This ensures the check happens server-side with proper service role key
 */
export async function checkCurrentUserAdmin() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        isAdmin: false,
        error: "Not authenticated"
      };
    }

    console.log(`[Check Admin Action] Checking admin status for: ${userId}`);
    const isAdmin = await isUserAdmin(userId);
    console.log(`[Check Admin Action] Result for ${userId}: ${isAdmin}`);

    return {
      success: true,
      isAdmin,
      userId
    };
  } catch (error) {
    console.error(`[Check Admin Action] Error:`, error);
    return {
      success: false,
      isAdmin: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}