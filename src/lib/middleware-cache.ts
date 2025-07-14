/**
 * Simple in-memory cache for middleware to avoid database queries
 */

interface CachedUserData {
  planId: string | null;
  isAdmin: boolean;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const userCache = new Map<string, CachedUserData>();

/**
 * Get cached user data
 */
export function getCachedUserData(userId: string): CachedUserData | null {
  const cached = userCache.get(userId);
  if (!cached) return null;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    userCache.delete(userId);
    return null;
  }

  return cached;
}

/**
 * Cache user data
 */
export function setCachedUserData(
  userId: string,
  planId: string | null,
  isAdmin: boolean
): void {
  userCache.set(userId, {
    planId,
    isAdmin,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache for a specific user (useful when plan changes)
 */
export function clearUserCache(userId: string): void {
  userCache.delete(userId);
}

/**
 * Clear all expired cache entries (cleanup function)
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [userId, data] of userCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      userCache.delete(userId);
    }
  }
}
