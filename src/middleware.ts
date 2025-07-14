import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getCachedUserData, setCachedUserData } from "@/lib/middleware-cache";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/discovery", // Allow public access to discovery API
  "/api/content", // Allow public access to content API
  "/api/transcript", // Allow public access to transcript API
  "/api/instagram-embed", // Allow public access to Instagram embed API
  "/api/proxy-image", // Allow public access to image proxy
  "/api/stripe/webhooks", // Allow Stripe webhook access
  "/api/webhook/clerk", // Allow Clerk webhook access
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Define routes that require plan selection
const requiresPlan = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.next();
  }

  // Try to get cached user data first
  const cachedData = getCachedUserData(userId);
  let planId: string | null = null;
  let isAdmin = false;

  if (cachedData) {
    // Use cached data
    planId = cachedData.planId;
    isAdmin = cachedData.isAdmin;
  } else {
    // Cache miss - query database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from("users")
      .select("plan_id, role")
      .eq("id", userId)
      .single();

    planId = user?.plan_id || null;
    isAdmin = user?.role === "admin";

    // Cache the result
    setCachedUserData(userId, planId, isAdmin);
  }

  // Check if user has selected a plan before accessing dashboard
  if (requiresPlan(req) && !req.url.includes("/select-plan")) {
    if (!planId) {
      // Check if this is a successful payment redirect with session_id
      const url = new URL(req.url);
      const sessionId = url.searchParams.get("session_id");

      // Skip plan check if user is coming from successful payment
      if (!sessionId) {
        return NextResponse.redirect(new URL("/select-plan", req.url));
      }
    }
  }

  // Additional admin route protection
  if (isAdminRoute(req)) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
