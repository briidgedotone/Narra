import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

import { BoardsPageContent } from "./boards-page-content";

export default async function BoardsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <BoardsPageContent />
    </DashboardLayout>
  );
}
