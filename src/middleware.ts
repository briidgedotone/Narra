import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getCachedUserData, setCachedUserData } from "@/lib/middleware-cache";
import { checkAndResetUserUsage } from "@/lib/usage-reset";

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
  "/api/refresh-profile", // Allow internal refresh calls from server actions
  "/api/webhook/clerk", // Allow Clerk webhook access
  "/api/stripe/webhook", // Allow Stripe webhook access
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Define routes that require an active subscription (for future use)
// const isSubscriptionRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/discovery",
//   "/following",
//   "/boards(.*)",
//   "/saved",
//   "/usage-and-billing"
// ]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.next();
  }

  // Check and reset user usage if needed (run in background)
  checkAndResetUserUsage(userId).catch(error => {
    console.error("Usage reset error in middleware:", error);
  });

  // Try to get cached user data first
  const cachedData = getCachedUserData(userId);
  let isAdmin = false;

  if (cachedData) {
    // Use cached data
    isAdmin = cachedData.isAdmin;
  } else {
    // Cache miss - query database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // User not found in database - don't cache anything
      // Let the page components handle user creation
      console.log(`User ${userId} not found in database during middleware`);
      isAdmin = false;
    } else if (error) {
      // Other database error - log but don't fail
      console.error("Database error in middleware:", error);
      isAdmin = false;
    } else {
      // User found - cache the result
      isAdmin = user?.role === "admin";
      setCachedUserData(userId, null, isAdmin);
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
