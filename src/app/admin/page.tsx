import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardLayout } from "@/components/layout";
import { isUserAdmin } from "@/lib/auth/admin";

import { AdminContent } from "./admin-content";
import { AdminContentSkeleton } from "./admin-content-skeleton";

export default async function AdminPage() {
  const { userId } = await auth();
  console.log(`[Admin Page] Auth check - userId: ${userId || 'null'}`);

  if (!userId) {
    console.log(`[Admin Page] No userId, redirecting to sign-in`);
    redirect("/sign-in");
  }

  // Check if user is admin
  console.log(`[Admin Page] Checking admin status for user: ${userId}`);
  const adminStatus = await isUserAdmin(userId);
  console.log(`[Admin Page] Admin status for ${userId}: ${adminStatus}`);

  if (!adminStatus) {
    console.log(`[Admin Page] User ${userId} is not admin, redirecting to dashboard`);
    redirect("/dashboard");
  }

  console.log(`[Admin Page] Admin access granted for user: ${userId}`);

  return (
    <DashboardLayout>
      <Suspense fallback={<AdminContentSkeleton />}>
        <AdminContent />
      </Suspense>
    </DashboardLayout>
  );
}
