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
        const { userId, planId, billingPeriod } = session.metadata || {};

        if (userId && planId && session.subscription) {
          // Get the subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Create or update subscription record
          try {
            const periodStart = (subscription as any).current_period_start;
            const periodEnd = (subscription as any).current_period_end;
            const cancelAtPeriodEnd = (subscription as any)
              .cancel_at_period_end;

            console.log("Subscription data:", {
              id: subscription.id,
              customer: subscription.customer,
              status: subscription.status,
              periodStart,
              periodEnd,
              cancelAtPeriodEnd,
            });

            // For trialing subscriptions, calculate proper end date based on billing period
            let actualPeriodEnd = periodEnd
              ? new Date(periodEnd * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (
              subscription.status === "trialing" &&
              billingPeriod === "yearly"
            ) {
              // For yearly trials, set period end to 1 year from trial end
              const trialEnd = subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 day trial
              actualPeriodEnd = new Date(trialEnd);
              actualPeriodEnd.setFullYear(actualPeriodEnd.getFullYear() + 1);
            } else if (
              subscription.status === "trialing" &&
              billingPeriod === "monthly"
            ) {
              // For monthly trials, set period end to 1 month from trial end
              const trialEnd = subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 day trial
              actualPeriodEnd = new Date(trialEnd);
              actualPeriodEnd.setMonth(actualPeriodEnd.getMonth() + 1);
            }

            await db.createSubscription({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              plan_id: planId,
              status: subscription.status as any,
              billing_period:
                (billingPeriod as "monthly" | "yearly") || "monthly",
              current_period_start: periodStart
                ? new Date(periodStart * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: actualPeriodEnd.toISOString(),
              cancel_at_period_end: cancelAtPeriodEnd || false,
            });

            console.log("Subscription record created successfully");
          } catch (error) {
            console.error("Error creating subscription record:", error);
            console.error("Subscription object:", subscription);
          }

          // Update user's subscription status
          await db.updateUser(userId, {
            subscription_status: subscription.status as any,
            plan_id: planId,
          } as any);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        // Update subscription in database
        try {
          await db.updateSubscription(stripeSubscription.id, {
            status: stripeSubscription.status as any,
            current_period_start: new Date(
              (stripeSubscription as any).current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              (stripeSubscription as any).current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: (stripeSubscription as any)
              .cancel_at_period_end,
          });
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        // Mark subscription as cancelled
        try {
          await db.updateSubscription(stripeSubscription.id, {
            status: "canceled",
            cancel_at_period_end: false,
          });
        } catch (error) {
          console.error("Error cancelling subscription:", error);
        }
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
