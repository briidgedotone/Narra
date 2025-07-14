import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data with plan info
    const { data: userData } = await supabase
      .from("users")
      .select(
        "plan_id, monthly_profile_discoveries, monthly_transcripts_viewed, subscription_status"
      )
      .eq("id", user.id)
      .single();

    if (!userData?.plan_id) {
      return NextResponse.json({ error: "No active plan" }, { status: 404 });
    }

    // Get plan limits
    const { data: planData } = await supabase
      .from("plans")
      .select("limits")
      .eq("id", userData.plan_id)
      .single();

    return NextResponse.json({
      plan_id: userData.plan_id,
      monthly_profile_discoveries: userData.monthly_profile_discoveries || 0,
      monthly_transcripts_viewed: userData.monthly_transcripts_viewed || 0,
      subscription_status: userData.subscription_status || "inactive",
      limits: planData?.limits || {
        profile_discoveries: 0,
        transcript_views: 0,
        profile_follows: 0,
      },
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
