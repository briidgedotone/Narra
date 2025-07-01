import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get("url");
  const platform = searchParams.get("platform");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter required" },
      { status: 400 }
    );
  }

  // 🔧 FIX: Convert HEIC URLs to JPEG for TikTok thumbnails
  if (platform === "tiktok" && imageUrl.includes(".heic")) {
    imageUrl = imageUrl.replace(".heic", ".jpeg");
  }

  try {
    // Base headers for all requests
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      DNT: "1",
      Connection: "keep-alive",
      "Sec-Fetch-Site": "cross-site",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Dest": "image",
    };

    // Add platform-specific headers
    if (
      platform === "instagram" ||
      imageUrl.includes("cdninstagram.com") ||
      imageUrl.includes("fbcdn.net")
    ) {
      headers["Referer"] = "https://www.instagram.com/";
      headers["Origin"] = "https://www.instagram.com";
      headers["Sec-Ch-Ua"] =
        '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"';
      headers["Sec-Ch-Ua-Mobile"] = "?0";
      headers["Sec-Ch-Ua-Platform"] = '"macOS"';
    } else if (platform === "tiktok" || imageUrl.includes("tiktokcdn")) {
      headers["Referer"] = "https://www.tiktok.com/";
      headers["Origin"] = "https://www.tiktok.com";
    }

    // Fetch the image from the original URL
    const response = await fetch(imageUrl, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch image from ${imageUrl} with status ${response.status}`
      );
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
