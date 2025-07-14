import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { clearUserCache } from "@/lib/middleware-cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;

          if (!userId || !planId) {
            console.error("Missing metadata in session");
            return NextResponse.json(
              { error: "Missing metadata" },
              { status: 400 }
            );
          }

          // Get the subscription details
          const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
          )) as any;

          // Update user with plan_id
          const { error: userError } = await supabase
            .from("users")
            .update({
              plan_id: planId,
              subscription_status: "active",
            })
            .eq("id", userId);

          if (userError) {
            console.error("Error updating user:", userError);
            throw userError;
          }

          // Create or update subscription record
          const { error: subError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              plan_id: planId,
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            });

          if (subError) {
            console.error("Error creating subscription:", subError);
            throw subError;
          }

          // Clear the user cache so middleware will fetch fresh plan data
          clearUserCache(userId);
          console.log(
            `Cleared cache for user ${userId} after successful payment`
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        // Update subscription status
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }

        // Update user subscription status
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (subData) {
          await supabase
            .from("users")
            .update({
              subscription_status:
                subscription.status === "active" ? "active" : "inactive",
            })
            .eq("id", subData.user_id);

          // Clear cache when subscription status changes
          clearUserCache(subData.user_id);
          console.log(
            `Cleared cache for user ${subData.user_id} after subscription update`
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        // Only process subscription invoices (not one-time payments)
        if (invoice.subscription) {
          // Get user from subscription
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription)
            .single();

          if (subData) {
            // Reset usage counters for new billing cycle
            await supabase
              .from("users")
              .update({
                monthly_profile_discoveries: 0,
                monthly_transcripts_viewed: 0,
                usage_reset_date: new Date().toISOString(),
              })
              .eq("id", subData.user_id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        // Update subscription status to canceled
        const { data: subData } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id)
          .select("user_id")
          .single();

        if (subData) {
          // Update user to inactive
          await supabase
            .from("users")
            .update({
              subscription_status: "inactive",
              plan_id: null,
            })
            .eq("id", subData.user_id);

          // Clear cache when subscription is canceled
          clearUserCache(subData.user_id);
          console.log(
            `Cleared cache for user ${subData.user_id} after subscription cancellation`
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
