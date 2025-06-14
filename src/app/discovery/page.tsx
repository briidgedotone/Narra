import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DiscoveryContent } from "@/components/discovery/discovery-content";
import { DashboardLayout } from "@/components/layout";

export default async function DiscoveryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <DiscoveryContent userId={userId} />
    </DashboardLayout>
  );
}
