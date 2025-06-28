import { redirect } from "next/navigation";

import { getPublicBoard } from "@/app/actions/folders";
import { BoardPageContent } from "@/app/boards/[id]/board-page-content";

export default async function SharedBoardPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { publicId } = await params;

  // Get board by public ID
  const result = await getPublicBoard(publicId);
  if (!result.success || !result.data) {
    redirect("/");
  }

  return <BoardPageContent boardId={publicId} isSharedView={true} />;
}
