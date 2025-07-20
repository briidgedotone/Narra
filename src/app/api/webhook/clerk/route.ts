import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { sendTemplateEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Get the headers - await is required in Next.js 15
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response("No email found", { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", id)
      .single();

    // Prepare user data
    const userData: any = {
      id: id,
      email: email,
      role: "user",
      updated_at: new Date().toISOString(),
    };

    // Only set subscription_status for new users
    if (!existingUser) {
      userData.subscription_status = "inactive";
      console.log(`[Clerk Webhook] Creating new user ${id} with inactive status`);
    } else {
      console.log(`[Clerk Webhook] Updating existing user ${id}, preserving subscription status: ${existingUser.subscription_status}`);
    }

    // Upsert user in Supabase
    const { error } = await supabase
      .from("users")
      .upsert(userData)
      .eq("id", id);

    if (error) {
      console.error("Error upserting user:", error);
      return new Response("Error creating user", { status: 500 });
    }

    // Send welcome email for new users only
    if (eventType === "user.created") {
      await sendTemplateEmail('welcome', {
        userEmail: email,
      });
    }
  }

  return NextResponse.json({ received: true });
}
