import { NextRequest, NextResponse } from "next/server";

import { getTikTokEmbed, isValidTikTokUrl } from "@/lib/api/tiktok-embed";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Validate TikTok URL format
    if (!isValidTikTokUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid TikTok URL format. Expected format: https://www.tiktok.com/@username/video/123456789",
        },
        { status: 400 }
      );
    }

    console.log("Testing TikTok embed for URL:", url);

    // Get TikTok embed data
    const result = await getTikTokEmbed(url);

    if (result.success) {
      console.log(`TikTok embed successful via ${result.method}:`, {
        title: result.data?.title,
        author: result.data?.author_name,
        hasHtml: !!result.data?.html,
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        method: result.method,
        message: `Successfully generated embed using ${result.method} method`,
      });
    } else {
      console.error("TikTok embed failed:", result.error);

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "Failed to generate TikTok embed",
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("TikTok embed API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
        message: "Internal server error while generating TikTok embed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      {
        success: false,
        error: "URL parameter is required",
      },
      { status: 400 }
    );
  }

  // Reuse the POST logic
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: { "Content-Type": "application/json" },
    })
  );
}

// OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
