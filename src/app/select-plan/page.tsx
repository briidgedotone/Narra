import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { SelectPlanContent } from "@/components/select-plan-content";

export default async function SelectPlanPage() {
  // Get the authenticated user
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check user's subscription status
  const { data: userData, error } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  // If user has an active or trialing subscription, redirect to dashboard
  if (
    userData &&
    (userData.subscription_status === "active" ||
      userData.subscription_status === "trialing")
  ) {
    console.log(
      `[Select Plan] User ${userId} has ${userData.subscription_status} subscription, redirecting to dashboard`
    );
    redirect("/dashboard");
  }

  // If error, log it but allow access to select-plan page
  if (error && error.code !== "PGRST116") {
    console.error("Error checking user subscription status:", error);
  }

  // Render the client component for plan selection
  return <SelectPlanContent />;
}