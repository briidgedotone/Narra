import { auth } from "@clerk/nextjs/server";

// Get current user from Clerk
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const userId = await getCurrentUser();
  return !!userId;
}

// Clerk configuration validation
export function isClerkConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );
}
