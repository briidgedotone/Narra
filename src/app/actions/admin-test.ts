"use server";

import { makeUserAdmin, getUserRole, refreshUserCache } from "@/lib/auth/admin-utils";
import { clearUserCache } from "@/lib/middleware-cache";

/**
 * Test action to ensure the admin user can access admin features
 * This will make the specific user an admin and clear their cache
 */
export async function ensureAdminAccess() {
  const adminUserId = "user_307c5ubX1EADRJlqmAMqDEm7fZ4"; // tejash.narwana001@gmail.com
  
  try {
    console.log(`[Admin Test] Checking current role for ${adminUserId}...`);
    
    // Check current role
    const currentRole = await getUserRole(adminUserId);
    console.log(`[Admin Test] Current role: ${currentRole}`);
    
    if (currentRole !== "admin") {
      console.log(`[Admin Test] Setting user as admin...`);
      await makeUserAdmin(adminUserId);
    } else {
      console.log(`[Admin Test] User is already admin, refreshing cache...`);
      await refreshUserCache(adminUserId);
    }
    
    // Aggressively clear middleware cache
    console.log(`[Admin Test] Clearing middleware cache directly...`);
    clearUserCache(adminUserId);
    
    // Verify the change
    const newRole = await getUserRole(adminUserId);
    console.log(`[Admin Test] Verified role: ${newRole}`);
    
    return {
      success: true,
      message: `User ${adminUserId} is now admin with role: ${newRole}`,
      userId: adminUserId,
      role: newRole
    };
  } catch (error) {
    console.error(`[Admin Test] Error ensuring admin access:`, error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      userId: adminUserId,
      role: null
    };
  }
}