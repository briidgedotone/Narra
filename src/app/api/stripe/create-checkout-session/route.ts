import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, billingPeriod } = await request.json();

    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: "Plan ID and billing period are required" },
        { status: 400 }
      );
    }

    // For now, we'll create a simple checkout session
    // In a real implementation, you'd have Stripe price IDs
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planId} Plan`,
            },
            unit_amount:
              planId === "inspiration"
                ? billingPeriod === "monthly"
                  ? 2499
                  : 21000
                : planId === "growth"
                  ? billingPeriod === "monthly"
                    ? 4999
                    : 41999
                  : 0, // Enterprise - custom pricing
            recurring: {
              interval: billingPeriod === "monthly" ? "month" : "year",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 3,
      },
      success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/select-plan`,
      // Let Stripe collect email during checkout
      metadata: {
        userId,
        planId,
        billingPeriod,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
