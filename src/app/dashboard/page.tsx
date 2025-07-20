import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getFeaturedBoards } from "@/app/actions/folders";
import { DashboardLayout } from "@/components/layout";
import { DashboardContent } from "@/components/shared/dashboard-content";
import { syncUserToDatabase } from "@/lib/auth/sync";
import { isUserInCache, clearUserCache } from "@/lib/middleware-cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get search params to check for successful payment redirect
  const params = await searchParams;
  const sessionId = params.session_id;

  // If coming from successful payment, clear cache to ensure fresh plan data
  if (sessionId && typeof sessionId === "string") {
    clearUserCache(userId);
    console.log(
      `Cleared cache for user ${userId} after payment success redirect`
    );
  }

  // Ensure user exists in database BEFORE checking subscription
  // This fixes the race condition where subscription check happens before user sync
  let userData;
  try {
    // First try to get user from database
    const { data: existingUser } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", userId)
      .single();
    
    userData = existingUser;
  } catch (error) {
    // User doesn't exist in database, sync from Clerk first
    console.log(`User ${userId} not found in database, syncing from Clerk...`);
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        await syncUserToDatabase(clerkUser);
        // Clear cache to ensure fresh data
        clearUserCache(userId);
        // Query again after sync
        const { data: syncedUser } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("id", userId)
          .single();
        userData = syncedUser;
      }
    } catch (syncError) {
      console.error("Error syncing user to database:", syncError);
      // If sync fails, redirect to sign-in to retry the flow
      redirect("/sign-in");
    }
  }

  // Now check subscription status with guaranteed user data
  if (
    !userData ||
    (userData.subscription_status !== "active" &&
      userData.subscription_status !== "trialing")
  ) {
    redirect("/select-plan");
  }

  // Additional sync for cache optimization (only if not already synced above)
  if (!isUserInCache(userId)) {
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        await syncUserToDatabase(clerkUser);
      }
    } catch (error) {
      console.error("Error with additional user sync:", error);
      // Don't fail here as user is already validated above
    }
  }

  // Fetch featured boards on the server
  let featuredBoards = [];
  try {
    const result = await getFeaturedBoards();
    if (result.success) {
      featuredBoards = result.data || [];
    }
  } catch (error) {
    console.error("Failed to load featured boards:", error);
  }

  return (
    <DashboardLayout>
      <DashboardContent initialFeaturedBoards={featuredBoards} />
    </DashboardLayout>
  );
}
