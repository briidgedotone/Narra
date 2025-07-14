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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the current user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: "Session does not belong to user" },
        { status: 403 }
      );
    }

    // Check if the session was completed
    if (session.status !== "complete") {
      return NextResponse.json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Check if the user has been updated in the database
    const { data: user } = await supabase
      .from("users")
      .select("plan_id, subscription_status")
      .eq("id", userId)
      .single();

    if (user?.plan_id && user?.subscription_status === "active") {
      // User has been successfully updated by webhook
      return NextResponse.json({
        success: true,
        planId: user.plan_id,
        subscriptionStatus: user.subscription_status,
      });
    }

    // Payment completed but user not yet updated (webhook still processing)
    return NextResponse.json({
      success: false,
      message: "Payment completed, webhook still processing",
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
