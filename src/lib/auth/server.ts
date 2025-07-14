import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/database";

/**
 * Check if the current authenticated user is an admin (server-side only)
 * @returns Promise<boolean> - true if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await db.getUserById(userId);
    return user.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
