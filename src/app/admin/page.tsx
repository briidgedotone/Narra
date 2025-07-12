import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardLayout } from "@/components/layout";
import { isUserAdmin } from "@/lib/auth/admin";

import { AdminContent } from "./admin-content";
import { AdminContentSkeleton } from "./admin-content-skeleton";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const adminStatus = await isUserAdmin(userId);

  if (!adminStatus) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<AdminContentSkeleton />}>
        <AdminContent />
      </Suspense>
    </DashboardLayout>
  );
}
