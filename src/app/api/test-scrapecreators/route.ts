// Test route for ScrapeCreators API integration
import { NextRequest, NextResponse } from "next/server";

import { scrapeCreators } from "@/lib/api/scrapecreators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle") || "instagram"; // Default test handle

    console.log(`Testing ScrapeCreators API with handle: ${handle}`);

    const result = await scrapeCreators.getInstagramProfile(handle);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ScrapeCreators test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
