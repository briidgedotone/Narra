"use server";

import { auth } from "@clerk/nextjs/server";
import { setCachedUserData, clearUserCache } from "@/lib/middleware-cache";
import { createClient } from "@supabase/supabase-js";

/**
 * Force update the middleware cache with admin status
 * This bypasses the client-side environment variable issue
 */
export async function forceAdminCache() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    console.log(`[Force Admin Cache] Processing user: ${userId}`);

    // Clear existing cache
    clearUserCache(userId);
    console.log(`[Force Admin Cache] Cleared cache for: ${userId}`);

    // Query database with server-side service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(`[Force Admin Cache] Database error:`, error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    const isAdmin = user.role === "admin";
    console.log(`[Force Admin Cache] User role: ${user.role}, isAdmin: ${isAdmin}`);

    // Set fresh cache
    setCachedUserData(userId, null, isAdmin);
    console.log(`[Force Admin Cache] Set fresh cache: isAdmin=${isAdmin}`);

    return {
      success: true,
      userId,
      role: user.role,
      isAdmin,
      email: user.email
    };
  } catch (error) {
    console.error(`[Force Admin Cache] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}