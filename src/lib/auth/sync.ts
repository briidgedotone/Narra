import { User } from "@clerk/nextjs/server";

import { DatabaseService } from "@/lib/database";
import type { Database } from "@/types/database";

const db = new DatabaseService();

/**
 * Sync a Clerk user to our database
 * Creates or updates user record based on Clerk data
 */
export async function syncUserToDatabase(
  clerkUser: User
): Promise<Database["public"]["Tables"]["users"]["Row"]> {
  try {
    // Check if user already exists in our database
    let dbUser;
    try {
      dbUser = await db.getUserById(clerkUser.id);
    } catch {
      // User doesn't exist, we'll create them
      dbUser = null;
    }

    // Extract user data from Clerk
    const userData: Database["public"]["Tables"]["users"]["Insert"] = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      role: "user", // Default role
      subscription_status: "inactive", // Default subscription status
    };

    if (dbUser) {
      // User exists, update their information
      const updatedUser = await db.updateUser(clerkUser.id, {
        email: userData.email,
        // Don't update role or subscription_status on sync
      });
      return updatedUser;
    } else {
      // User doesn't exist, create them
      const newUser = await db.createUser(userData);
      return newUser;
    }
  } catch (error) {
    console.error("Error syncing user to database:", error);
    throw new Error("Failed to sync user to database");
  }
}

/**
 * Get or create user in database from Clerk user ID
 * Fetches user from Clerk if needed and syncs to database
 */
export async function ensureUserInDatabase(
  userId: string
): Promise<Database["public"]["Tables"]["users"]["Row"]> {
  try {
    // First try to get user from our database
    try {
      const dbUser = await db.getUserById(userId);
      return dbUser;
    } catch {
      // User not in our database, need to sync from Clerk
      console.log(
        `User ${userId} not found in database, syncing from Clerk...`
      );

      // For now, we'll need the Clerk user object passed in
      // In a real implementation, you might fetch from Clerk API here
      throw new Error(
        "User not found in database and Clerk user object not provided"
      );
    }
  } catch (error) {
    console.error("Error ensuring user in database:", error);
    throw error;
  }
}

/**
 * Utility to check if a user exists in our database
 */
export async function userExistsInDatabase(userId: string): Promise<boolean> {
  try {
    await db.getUserById(userId);
    return true;
  } catch {
    return false;
  }
}
