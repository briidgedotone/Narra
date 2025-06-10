import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { syncUserToDatabase } from "@/lib/auth/sync";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Sync user to database on dashboard access
  let dbUser = null;
  let syncError = null;
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      dbUser = await syncUserToDatabase(clerkUser);
    }
  } catch (error) {
    console.error("Error syncing user to database:", error);
    syncError = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="content-spacing">
        <div className="bg-card border border-border rounded-lg card-spacing">
          <div className="text-center">
            <h2 className="mb-4">🎉 Welcome to Use Narra!</h2>
            <p className="text-muted-foreground mb-6">
              You&apos;re successfully authenticated and ready to start curating
              content.
            </p>
            <div className="content-spacing text-small">
              <p className="text-muted-foreground">
                <strong>Clerk User ID:</strong> {userId}
              </p>
              {dbUser && (
                <>
                  <p className="text-green-600">
                    ✅ <strong>Database Sync:</strong> Success
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Database Email:</strong> {dbUser.email}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Role:</strong> {dbUser.role}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Subscription:</strong> {dbUser.subscription_status}
                  </p>
                </>
              )}
              {syncError && (
                <p className="text-red-600">
                  ❌ <strong>Database Sync Error:</strong> {syncError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
