import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getFeaturedBoards } from "@/app/actions/folders";
import { DashboardLayout } from "@/components/layout";
import { DashboardContent } from "@/components/shared/dashboard-content";
import { PaymentSuccessHandler } from "@/components/shared/payment-success-handler";
import { syncUserToDatabase } from "@/lib/auth/sync";
import { isUserInCache, clearUserCache } from "@/lib/middleware-cache";

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

  // Sync user to database only if not in cache (new user or cache miss)
  if (!isUserInCache(userId)) {
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        await syncUserToDatabase(clerkUser);
      }
    } catch (error) {
      console.error("Error syncing user to database:", error);
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
      {sessionId && typeof sessionId === "string" ? (
        <PaymentSuccessHandler sessionId={sessionId}>
          <DashboardContent initialFeaturedBoards={featuredBoards} />
        </PaymentSuccessHandler>
      ) : (
        <DashboardContent initialFeaturedBoards={featuredBoards} />
      )}
    </DashboardLayout>
  );
}
