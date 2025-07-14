import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🧪 [Manual Test] Testing plan update for user ${userId}`);

    // Check current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("id, plan_id, subscription_status")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("❌ [Manual Test] Error fetching user:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    console.log(`📊 [Manual Test] Current user data:`, currentUser);

    // Try to update user with test plan
    const { data: updateResult, error: updateError } = await supabase
      .from("users")
      .update({
        plan_id: "growth",
        subscription_status: "active",
      })
      .eq("id", userId)
      .select("id, plan_id, subscription_status");

    if (updateError) {
      console.error("❌ [Manual Test] Error updating user:", updateError);
      return NextResponse.json(
        {
          error: "Failed to update user",
          details: updateError,
        },
        { status: 500 }
      );
    }

    console.log(`✅ [Manual Test] User updated successfully:`, updateResult);

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      before: currentUser,
      after: updateResult[0],
    });
  } catch (error) {
    console.error("❌ [Manual Test] Error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
