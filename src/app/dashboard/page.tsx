import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getFeaturedBoards } from "@/app/actions/folders";
import { DashboardLayout } from "@/components/layout";
import { DashboardContent } from "@/components/shared/dashboard-content";
import { syncUserToDatabase } from "@/lib/auth/sync";
import { isUserInCache } from "@/lib/middleware-cache";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
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
      <DashboardContent initialFeaturedBoards={featuredBoards} />
    </DashboardLayout>
  );
}
