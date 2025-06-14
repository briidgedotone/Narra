import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { BoardHeader } from "@/components/shared/board-header";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  // Mock board names for display
  const boardNames: Record<string, string> = {
    "1": "Social Media",
    "2": "Email Campaigns",
    "3": "UI/UX",
    "4": "Branding",
  };

  // Check if it's a dynamically created board (timestamp-based ID)
  const isNewBoard = !boardNames[id] && !isNaN(Number(id));
  const boardName =
    boardNames[id] || (isNewBoard ? "Untitled Board" : `Board ${id}`);

  return (
    <DashboardLayout
      header={<BoardHeader boardName={boardName} boardId={id} />}
    >
      <div className="px-[76px] py-[56px] space-y-6">
        <div className="bg-card rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Board Content</h3>
            <p>
              Posts and content for &quot;{boardName}&quot; will be displayed
              here.
            </p>
            <p className="text-sm mt-2">Board ID: {id}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
