import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      console.log("❌ [Verification] No userId from auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      console.log("❌ [Verification] No sessionId provided");
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 [Verification] Starting verification for user ${userId} with session ${sessionId}`
    );

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(
      `📋 [Verification] Stripe session status: ${session.status}, mode: ${session.mode}`
    );
    console.log(`📋 [Verification] Session metadata:`, session.metadata);

    // Verify the session belongs to the current user
    if (session.metadata?.userId !== userId) {
      console.log(
        `❌ [Verification] Session userId mismatch: ${session.metadata?.userId} !== ${userId}`
      );
      return NextResponse.json(
        { error: "Session does not belong to user" },
        { status: 403 }
      );
    }

    // Check if the session was completed
    if (session.status !== "complete") {
      console.log(`⏳ [Verification] Session not complete: ${session.status}`);
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
      });
    }

    console.log(
      `✅ [Verification] Session completed successfully, checking database...`
    );

    // Check if the user has been updated in the database
    const { data: user, error: dbError } = await supabase
      .from("users")
      .select("plan_id, subscription_status")
      .eq("id", userId)
      .single();

    if (dbError) {
      console.error(`❌ [Verification] Database query error:`, dbError);
      return NextResponse.json({
        success: false,
        message: "Database query failed",
        error: dbError.message,
      });
    }

    console.log(`📊 [Verification] User data from database:`, user);

    if (user?.plan_id && user?.subscription_status === "active") {
      // User has been successfully updated by webhook
      console.log(
        `✅ [Verification] User verified successfully with plan ${user.plan_id}`
      );
      return NextResponse.json({
        success: true,
        planId: user.plan_id,
        subscriptionStatus: user.subscription_status,
      });
    }

    // Payment completed but user not yet updated (webhook still processing)
    console.log(
      `⏳ [Verification] Payment completed but user not updated yet. Current plan_id: ${user?.plan_id}, status: ${user?.subscription_status}`
    );
    return NextResponse.json({
      success: false,
      message: "Payment completed, webhook still processing",
      currentPlanId: user?.plan_id,
      currentStatus: user?.subscription_status,
    });
  } catch (error) {
    console.error("❌ [Verification] Session verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
