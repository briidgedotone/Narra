import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { DiscoveryContent } from "@/components/shared/discovery-content";

export default async function DiscoveryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <DiscoveryContent />
    </DashboardLayout>
  );
}
