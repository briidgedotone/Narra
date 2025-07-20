"use server";

import { isAdmin } from "@/lib/auth/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Get all users with aggregated statistics - server action with proper admin client
 */
export async function getAdminUsers() {
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

    console.log("[Admin Users] Fetching users with aggregated stats...");

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("[Admin Users] Error fetching users:", usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Get aggregated stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get user's folders first
        const { data: userFolders, error: foldersError } = await supabase
          .from("folders")
          .select("id")
          .eq("user_id", user.id);

        let boardsCount = 0;
        let postsCount = 0;

        if (!foldersError && userFolders && userFolders.length > 0) {
          const folderIds = userFolders.map(folder => folder.id);

          // Get boards count for this user's folders
          const { count: boards, error: boardsError } = await supabase
            .from("boards")
            .select("*", { count: "exact", head: true })
            .in("folder_id", folderIds);

          if (!boardsError) {
            boardsCount = boards || 0;
          }

          // Get user's boards to count posts
          const { data: userBoards, error: userBoardsError } = await supabase
            .from("boards")
            .select("id")
            .in("folder_id", folderIds);

          if (!userBoardsError && userBoards && userBoards.length > 0) {
            const boardIds = userBoards.map(board => board.id);
            
            const { count: posts, error: postsError } = await supabase
              .from("board_posts")
              .select("*", { count: "exact", head: true })
              .in("board_id", boardIds);
            
            if (!postsError) {
              postsCount = posts || 0;
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as "user" | "admin",
          joinedAt: user.created_at,
          postsCount,
          boardsCount,
        };
      })
    );

    console.log(`[Admin Users] Successfully fetched ${usersWithStats.length} users with stats`);
    return { success: true, users: usersWithStats };
  } catch (error) {
    console.error("[Admin Users] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      users: []
    };
  }
}