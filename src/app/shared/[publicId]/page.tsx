import { redirect } from "next/navigation";

import { getPublicBoard } from "@/app/actions/folders";
import { BoardPageContent } from "@/app/boards/[id]/board-page-content";

export default async function SharedBoardPage({
  params,
}: {
  params: { publicId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get board by public ID
  const result = await getPublicBoard(params.publicId);
  if (!result.success || !result.data) {
    redirect("/");
  }

  return <BoardPageContent boardId={params.publicId} isSharedView={true} />;
}
