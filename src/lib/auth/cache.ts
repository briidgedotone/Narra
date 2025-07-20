import { clearUserCache } from "@/lib/middleware-cache";

/**
 * Clear user cache when role or other critical data changes
 * This ensures middleware picks up the latest role immediately
 */
export function invalidateUserCache(userId: string, reason?: string): void {
  clearUserCache(userId);
  console.log(`[Auth Cache] Cleared cache for user ${userId}${reason ? `: ${reason}` : ""}`);
}

/**
 * Clear cache for multiple users (useful for batch operations)
 */
export function invalidateMultipleUserCaches(userIds: string[], reason?: string): void {
  userIds.forEach(userId => {
    clearUserCache(userId);
  });
  console.log(`[Auth Cache] Cleared cache for ${userIds.length} users${reason ? `: ${reason}` : ""}`);
}