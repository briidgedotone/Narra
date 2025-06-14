import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "@/components/ui/icons";

export default async function BoardsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Boards</h1>
            <p className="text-muted-foreground">
              Organize your saved content into boards
            </p>
          </div>
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Board
          </Button>
        </div>

        <div className="bg-card rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Your Boards</h3>
            <p>All your boards and folders will be displayed here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
