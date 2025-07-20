import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCachedUserData, setCachedUserData, clearUserCache } from "@/lib/middleware-cache";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Check current cache state
    const cachedData = getCachedUserData(userId);
    
    // Check database directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", userId)
      .single();
    
    console.log(`[Debug Cache] User: ${userId}`);
    console.log(`[Debug Cache] Cached data:`, cachedData);
    console.log(`[Debug Cache] Database data:`, user);
    
    return NextResponse.json({ 
      userId,
      cached: cachedData ? {
        isAdmin: cachedData.isAdmin,
        timestamp: new Date(cachedData.timestamp).toISOString(),
        ageMinutes: Math.round((Date.now() - cachedData.timestamp) / 60000)
      } : null,
      database: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      databaseError: error?.message || null
    });
  } catch (error) {
    console.error("[Debug Cache API] Error:", error);
    return NextResponse.json({ error: "Failed to debug cache" }, { status: 500 });
  }
}