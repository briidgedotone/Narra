import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { DashboardContent } from "@/components/shared/dashboard-content";
import { syncUserToDatabase } from "@/lib/auth/sync";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Sync user to database on dashboard access
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      await syncUserToDatabase(clerkUser);
    }
  } catch (error) {
    console.error("Error syncing user to database:", error);
  }

  return (
    <DashboardLayout>
      <DashboardContent userId={userId} />
    </DashboardLayout>
  );
}
