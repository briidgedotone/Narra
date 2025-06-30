import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense, lazy } from "react";

import { DashboardLayout } from "@/components/layout";
import { LoadingSpinner } from "@/components/ui/loading";

// Lazy load the heavy SavedPostsContent component
const SavedPostsContent = lazy(() =>
  import("@/components/saved/saved-posts-content").then(module => ({
    default: module.SavedPostsContent,
  }))
);

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

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <LoadingSpinner className="h-8 w-8 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading Saved Posts...
                </p>
              </div>
            </div>
          }
        >
          <SavedPostsContent userId={userId} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
