import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count current follows
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      current_follows: count || 0,
    });
  } catch (error) {
    console.error("Follows API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow count" },
      { status: 500 }
    );
  }
}
