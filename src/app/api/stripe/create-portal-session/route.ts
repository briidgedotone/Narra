import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription to find Stripe customer ID
    const subscription = await db.getSubscriptionByUserId(userId);

    console.log("Portal session debug:", {
      userId,
      subscription: subscription
        ? {
            id: subscription.id,
            stripe_customer_id: subscription.stripe_customer_id,
            status: subscription.status,
          }
        : null,
    });

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Additional validation checks
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Stripe configuration error" },
        { status: 500 }
      );
    }

    // Validate return URL formation
    const returnUrl = `${request.nextUrl.origin}/dashboard`;
    console.log("Return URL:", returnUrl);

    if (!returnUrl.startsWith("http")) {
      console.error("Invalid return URL format:", returnUrl);
      return NextResponse.json(
        { error: "Invalid return URL" },
        { status: 500 }
      );
    }

    // Validate customer ID format
    if (!subscription.stripe_customer_id.startsWith("cus_")) {
      console.error(
        "Invalid Stripe customer ID format:",
        subscription.stripe_customer_id
      );
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 500 }
      );
    }

    console.log(
      "Creating portal session for customer:",
      subscription.stripe_customer_id
    );

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    console.log("Portal session created successfully:", portalSession.id);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check if it's a Stripe-specific error
    if (typeof error === "object" && error !== null && "type" in error) {
      console.error("Stripe error type:", (error as any).type);
      console.error("Stripe error code:", (error as any).code);
      console.error("Stripe error param:", (error as any).param);
    }

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
