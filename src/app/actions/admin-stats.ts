"use server";

import { isAdmin } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get admin statistics - server action with proper admin client
 */
export async function getAdminStats() {
  try {
    // Check if current user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Use server-side admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("[Admin Stats] Fetching admin statistics...");

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("[Admin Stats] Error fetching users count:", usersError);
    }

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    if (newUsersError) {
      console.error("[Admin Stats] Error fetching new users:", newUsersError);
    }

    // Get total boards count (collections)
    const { count: totalCollections, error: boardsError } = await supabase
      .from("boards")
      .select("*", { count: "exact", head: true });

    if (boardsError) {
      console.error("[Admin Stats] Error fetching boards count:", boardsError);
    }

    // Get total posts count
    const { count: totalPosts, error: postsError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    if (postsError) {
      console.error("[Admin Stats] Error fetching posts count:", postsError);
    }

    const stats = {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      totalCollections: totalCollections || 0,
      totalPosts: totalPosts || 0,
    };

    console.log("[Admin Stats] Successfully fetched stats:", stats);
    return { success: true, stats };
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalCollections: 0,
        totalPosts: 0,
      }
    };
  }
}