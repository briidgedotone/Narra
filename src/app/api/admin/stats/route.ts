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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🔍 [Admin Stats] Checking admin stats for user ${userId}`);

    // First verify user is admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || user?.role !== "admin") {
      console.log(`❌ [Admin Stats] User ${userId} is not admin`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`✅ [Admin Stats] User ${userId} is admin, fetching stats...`);

    // Get total users count
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    // Get total boards count (collections)
    const { count: totalCollections } = await supabase
      .from("boards")
      .select("*", { count: "exact", head: true });

    // Get total posts count
    const { count: totalPosts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    const stats = {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      totalCollections: totalCollections || 0,
      totalPosts: totalPosts || 0,
    };

    console.log(`📊 [Admin Stats] Stats fetched successfully:`, stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ [Admin Stats] Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
