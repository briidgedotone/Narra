import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { planId, billingPeriod } = body;

    // Validate input
    if (!planId || !billingPeriod) {
      return NextResponse.json(
        { error: "Plan ID and billing period are required" },
        { status: 400 }
      );
    }

    // Get the correct price ID based on plan and billing period
    const priceIds = {
      inspiration: {
        monthly: process.env.STRIPE_PRICE_INSPIRATION_MONTHLY,
        yearly: process.env.STRIPE_PRICE_INSPIRATION_YEARLY,
      },
      growth: {
        monthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY,
        yearly: process.env.STRIPE_PRICE_GROWTH_YEARLY,
      },
    };

    const priceId =
      priceIds[planId as keyof typeof priceIds]?.[
        billingPeriod as "monthly" | "yearly"
      ];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or billing period" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const sessionData: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/select-plan`,
      metadata: {
        userId: user.id,
        planId,
      },
    };

    // Only add customer_email if it exists
    if (user.emailAddresses[0]?.emailAddress) {
      sessionData.customer_email = user.emailAddresses[0].emailAddress;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
