import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense, lazy } from "react";

import { DashboardLayout } from "@/components/layout";
import { LoadingSpinner } from "@/components/ui/loading";

// Lazy load the heavy BoardsPageContent component
const BoardsPageContent = lazy(() =>
  import("./boards-page-content").then(module => ({
    default: module.BoardsPageContent,
  }))
);

export default async function BoardsPage() {
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
              <p className="text-sm text-muted-foreground">Loading Boards...</p>
            </div>
          </div>
        }
      >
        <BoardsPageContent />
      </Suspense>
    </DashboardLayout>
  );
}
