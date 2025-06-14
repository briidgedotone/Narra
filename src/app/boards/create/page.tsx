import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

export default async function CreateBoardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create New Board</h1>
            <p className="text-muted-foreground">
              Create a new board to organize your saved content
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p>Board creation functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
