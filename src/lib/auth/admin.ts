import { db } from "@/lib/database";

/**
 * Check if a user is an admin
 * @param userId - Clerk user ID
 * @returns Promise<boolean> - true if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await db.getUserById(userId);
    return user.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
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
