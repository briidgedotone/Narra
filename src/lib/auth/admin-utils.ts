import { db } from "@/lib/database";
import { invalidateUserCache } from "@/lib/auth/cache";

/**
 * Set a user's role (admin utility)
 * This function should only be used by other admin users or in development
 */
export async function setUserRole(userId: string, role: "user" | "admin"): Promise<void> {
  try {
    console.log(`[Admin Utils] Setting role for user ${userId} to: ${role}`);
    
    await db.updateUser(userId, { role });
    
    // Clear cache to ensure immediate effect
    invalidateUserCache(userId, `role change to ${role}`);
    
    console.log(`[Admin Utils] Successfully set role for ${userId} to: ${role}`);
  } catch (error) {
    console.error(`[Admin Utils] Error setting role for ${userId}:`, error);
    throw error;
  }
}

/**
 * Make a user an admin
 */
export async function makeUserAdmin(userId: string): Promise<void> {
  return setUserRole(userId, "admin");
}

/**
 * Remove admin privileges from a user
 */
export async function removeUserAdmin(userId: string): Promise<void> {
  return setUserRole(userId, "user");
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<"user" | "admin" | null> {
  try {
    const user = await db.getUserById(userId);
    return user.role as "user" | "admin";
  } catch (error) {
    console.error(`[Admin Utils] Error getting role for ${userId}:`, error);
    return null;
  }
}

/**
 * Manually refresh user cache (useful for testing)
 */
export async function refreshUserCache(userId: string): Promise<void> {
  invalidateUserCache(userId, "manual refresh");
  console.log(`[Admin Utils] Cache cleared for user: ${userId}`);
}