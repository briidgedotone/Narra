import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";

import { FollowingPageContent } from "./following-page-content";

export default async function FollowingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <FollowingPageContent userId={userId} />
    </DashboardLayout>
  );
}
