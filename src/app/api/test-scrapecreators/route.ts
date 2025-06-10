import { NextResponse } from "next/server";

import { scrapeCreatorsAPI } from "@/lib/api/scrapecreators";

export async function GET() {
  try {
    // Check if API is configured
    if (!scrapeCreatorsAPI.isConfigured()) {
      return NextResponse.json(
        {
          error: "ScrapeCreators API not configured",
          message: "Please add SCRAPECREATORS_API_KEY to environment variables",
        },
        { status: 500 }
      );
    }

    // Test with a simple search (using a popular account for testing)
    const testRequest = {
      handle: "test",
      platform: "instagram" as const,
      limit: 1,
      filters: {
        date_range: 30 as const,
      },
    };

    const result = await scrapeCreatorsAPI.searchProfiles(testRequest);

    return NextResponse.json({
      success: true,
      message: "ScrapeCreators API working",
      data: {
        profile: result.profile,
        posts_count: result.posts.length,
        total_posts: result.total_posts,
        has_more: result.has_more,
      },
    });
  } catch (error) {
    console.error("ScrapeCreators test error:", error);

    return NextResponse.json(
      {
        error: "ScrapeCreators API test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
