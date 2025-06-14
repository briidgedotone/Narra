import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

export default async function FollowingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Following</h1>
            <p className="text-muted-foreground">
              Latest posts from creators you follow
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Following Feed</h3>
            <p>
              Latest posts from your followed TikTok and Instagram creators will
              appear here.
            </p>
            <p className="text-sm mt-2">Content refreshes daily</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
