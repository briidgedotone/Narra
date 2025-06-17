import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api";

export async function GET() {
  try {
    const startTime = Date.now();

    // Test cached TikTok profile request
    const result = await scrapeCreatorsApi.tiktok.getProfile("iamsydneythomas");

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (result.success) {
      // Type-safe data extraction
      const responseData = result.data as any; // Using any for now since we don't have strict types yet
      const userData = responseData?.user;
      const statsData = responseData?.stats;

      return NextResponse.json({
        success: true,
        message: "Cache test successful",
        cached: result.cached || false,
        duration: `${duration}ms`,
        data: {
          handle: userData?.uniqueId || "unknown",
          followers: statsData?.followerCount || 0,
          nickname: userData?.nickname || "unknown",
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Cache test failed",
          error: result.error,
          duration: `${duration}ms`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test cache",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
