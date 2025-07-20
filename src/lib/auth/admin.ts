import { db } from "@/lib/database";

/**
 * Check if a user is an admin
 * @param userId - Clerk user ID
 * @returns Promise<boolean> - true if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    console.log(`[isUserAdmin] Checking admin status for user: ${userId}`);
    const user = await db.getUserById(userId);
    console.log(`[isUserAdmin] Found user: ${JSON.stringify({ id: user.id, email: user.email, role: user.role })}`);
    const isAdmin = user.role === "admin";
    console.log(`[isUserAdmin] Admin check result: ${isAdmin}`);
    return isAdmin;
  } catch (error) {
    console.error(`[isUserAdmin] Error checking admin status for ${userId}:`, error);
    return false;
  }
}

/**
 * Get user with admin status
 * @param userId - Clerk user ID
 * @returns Promise<{isAdmin: boolean, user: User | null}>
 */
export async function getUserWithAdminStatus(userId: string) {
  try {
    const user = await db.getUserById(userId);
    return {
      isAdmin: user.role === "admin",
      user,
    };
  } catch (error) {
    console.error("Error getting user with admin status:", error);
    return {
      isAdmin: false,
      user: null,
    };
  }
}
