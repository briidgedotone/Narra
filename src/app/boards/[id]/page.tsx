import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

import { BoardPageContent } from "./board-page-content";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  return (
    <DashboardLayout>
      <BoardPageContent boardId={id} />
    </DashboardLayout>
  );
}
