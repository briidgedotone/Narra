import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { SavedPostsContent } from "@/components/saved/saved-posts-content";

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

        <SavedPostsContent userId={userId} />
      </div>
    </DashboardLayout>
  );
}
