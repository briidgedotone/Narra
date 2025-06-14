import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

export default async function SavedPostsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Saved Posts</h1>
            <p className="text-muted-foreground">
              All your saved content across all boards
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Your Saved Posts</h3>
            <p>All saved posts from TikTok and Instagram will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
