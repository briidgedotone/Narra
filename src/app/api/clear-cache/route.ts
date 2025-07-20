import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clearUserCache } from "@/lib/middleware-cache";

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Clear cache for current user
    clearUserCache(userId);
    
    console.log(`[Clear Cache API] Cleared cache for user: ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cache cleared for user: ${userId}`,
      userId 
    });
  } catch (error) {
    console.error("[Clear Cache API] Error:", error);
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}