import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense, lazy } from "react";

import { DashboardLayout } from "@/components/layout";

// Lazy load the heavy DiscoveryContent component
const DiscoveryContent = lazy(() =>
  import("@/components/discovery/discovery-content").then(module => ({
    default: module.DiscoveryContent,
  }))
);

export default async function DiscoveryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <Suspense>
        <DiscoveryContent userId={userId} />
      </Suspense>
    </DashboardLayout>
  );
}
