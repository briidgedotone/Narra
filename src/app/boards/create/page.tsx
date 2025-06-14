import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { BoardHeader } from "@/components/shared/board-header";

export default async function CreateBoardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <BoardHeader boardName="Create New Board" boardId="create" />

      <div className="p-6 space-y-6">
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
