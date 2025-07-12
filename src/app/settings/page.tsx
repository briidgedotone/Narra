import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout";
import { UsagePage } from "@/components/usage-page";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <UsagePage />
      </div>
    </DashboardLayout>
  );
}
