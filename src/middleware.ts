import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isUserAdmin } from "@/lib/auth/admin";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
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

  // Check if user has selected a plan before accessing dashboard
  if (userId && requiresPlan(req) && !req.url.includes("/select-plan")) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user } = await supabase
      .from("users")
      .select("plan_id")
      .eq("id", userId)
      .single();

    // If user hasn't selected a plan, redirect to plan selection
    if (!user?.plan_id) {
      return NextResponse.redirect(new URL("/select-plan", req.url));
    }
  }

  // Additional admin route protection
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const adminStatus = await isUserAdmin(userId);
    if (!adminStatus) {
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
