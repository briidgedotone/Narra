import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Use Narra Dashboard
            </h1>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Welcome to Use Narra!
              </h2>
              <p className="text-gray-600 mb-6">
                You&apos;re successfully authenticated and ready to start
                curating content.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-500">
                  <strong>Clerk User ID:</strong> {userId}
                </p>
                {dbUser && (
                  <>
                    <p className="text-green-600">
                      ✅ <strong>Database Sync:</strong> Success
                    </p>
                    <p className="text-gray-500">
                      <strong>Database Email:</strong> {dbUser.email}
                    </p>
                    <p className="text-gray-500">
                      <strong>Role:</strong> {dbUser.role}
                    </p>
                    <p className="text-gray-500">
                      <strong>Subscription:</strong>{" "}
                      {dbUser.subscription_status}
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
      </main>
    </div>
  );
}
