import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Check if we've already processed this event
    const existingEvent = await db.getWebhookEvent(event.id);
    if (existingEvent) {
      return NextResponse.json({ received: true });
    }

    // Record the event for idempotency
    await db.createWebhookEvent({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata || {};

        if (userId && planId) {
          // Update user's subscription status
          await db.updateUser(userId, {
            subscription_status: "active",
            plan_id: planId,
          } as any);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Handle subscription updates
        console.log("Subscription updated:", event.id);
        break;
      }

      case "customer.subscription.deleted": {
        // Handle subscription cancellation
        console.log("Subscription cancelled:", event.id);
        break;
      }

      case "invoice.payment_succeeded": {
        // Handle successful payment
        console.log("Payment succeeded:", event.id);
        break;
      }

      case "invoice.payment_failed": {
        // Handle failed payment
        console.log("Payment failed:", event.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
