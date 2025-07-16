"use server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/database";

export async function getUserSubscriptionStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.getUserById(userId);

    return {
      success: true,
      data: {
        hasActiveSubscription:
          user.subscription_status === "active" ||
          user.subscription_status === "trialing",
        subscriptionStatus: user.subscription_status,
        planId: user.plan_id,
      },
    };
  } catch (error) {
    console.error("Failed to get user subscription status:", error);
    return {
      success: false,
      error: "Failed to check subscription status",
      data: {
        hasActiveSubscription: false,
        subscriptionStatus: "inactive",
        planId: null,
      },
    };
  }
}
