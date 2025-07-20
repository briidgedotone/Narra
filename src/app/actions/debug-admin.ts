"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { getCachedUserData, clearUserCache, setCachedUserData } from "@/lib/middleware-cache";

export async function debugAdminAccess() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    console.log(`[Debug Admin] Starting debug for user: ${userId}`);

    // 1. Check database directly
    const user = await db.getUserById(userId);
    console.log(`[Debug Admin] Database user:`, { id: user.id, email: user.email, role: user.role });

    // 2. Check current cache
    const cachedData = getCachedUserData(userId);
    console.log(`[Debug Admin] Cached data:`, cachedData);

    // 3. Clear cache
    clearUserCache(userId);
    console.log(`[Debug Admin] Cache cleared for user: ${userId}`);

    // 4. Set fresh cache with admin status
    const isAdmin = user.role === "admin";
    setCachedUserData(userId, null, isAdmin);
    console.log(`[Debug Admin] Fresh cache set: isAdmin=${isAdmin}`);

    // 5. Verify cache
    const newCachedData = getCachedUserData(userId);
    console.log(`[Debug Admin] New cached data:`, newCachedData);

    return {
      success: true,
      userId,
      database: {
        role: user.role,
        email: user.email
      },
      cache: {
        before: cachedData,
        after: newCachedData
      },
      isAdmin,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`[Debug Admin] Error:`, error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}