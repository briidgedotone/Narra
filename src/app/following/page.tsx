import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense, lazy } from "react";

import { DashboardLayout } from "@/components/layout";
import { LoadingSpinner } from "@/components/ui/loading";

// Lazy load the heavy FollowingPageContent component
const FollowingPageContent = lazy(() =>
  import("./following-page-content").then(module => ({
    default: module.FollowingPageContent,
  }))
);

export default async function FollowingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <LoadingSpinner className="h-8 w-8 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Loading Following...
              </p>
            </div>
          </div>
        }
      >
        <FollowingPageContent userId={userId} />
      </Suspense>
    </DashboardLayout>
  );
}
