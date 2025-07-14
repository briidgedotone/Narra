import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get the authenticated user ID
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    console.log(`🔍 [Admin Check] Checking admin status for user ${userId}`);

    // Query the database using the service role key
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ [Admin Check] Database error:", error);
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const isAdmin = user?.role === "admin";
    console.log(`✅ [Admin Check] User ${userId} admin status: ${isAdmin}`);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("❌ [Admin Check] Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
