import { notFound } from "next/navigation";

import { BoardPageContent } from "@/app/boards/[id]/board-page-content";
import { DashboardLayout } from "@/components/layout";
import { DatabaseService } from "@/lib/database";

const db = new DatabaseService();

interface PublicBoardPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function PublicBoardPage({
  params,
}: PublicBoardPageProps) {
  try {
    const { publicId } = await params;
    const board = await db.getBoardByPublicId(publicId);

    if (!board) {
      notFound();
    }

    return (
      <DashboardLayout>
        <BoardPageContent boardId={board.id} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Failed to load public board:", error);
    notFound();
  }
}
