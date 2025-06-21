import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { SettingsContent } from "@/components/settings/settings-content";
import { syncUserToDatabase } from "@/lib/auth/sync";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user data and sync to database
  let userData = null;
  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      await syncUserToDatabase(clerkUser);
      userData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        imageUrl: clerkUser.imageUrl || "",
        createdAt: clerkUser.createdAt,
      };
    }
  } catch (error) {
    console.error("Error syncing user to database:", error);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <SettingsContent userId={userId} userData={userData} />
      </div>
    </DashboardLayout>
  );
}
