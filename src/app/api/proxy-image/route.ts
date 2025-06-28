import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  const platform = searchParams.get("platform");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter required" },
      { status: 400 }
    );
  }

  try {
    // Base headers for all requests
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    };

    // Add platform-specific headers
    if (
      platform === "instagram" ||
      imageUrl.includes("cdninstagram.com") ||
      imageUrl.includes("fbcdn.net")
    ) {
      headers["Referer"] = "https://www.instagram.com/";
      headers["Origin"] = "https://www.instagram.com";
      headers["sec-fetch-site"] = "cross-site";
      headers["sec-fetch-mode"] = "no-cors";
      headers["sec-fetch-dest"] = "image";
    } else if (platform === "tiktok" || imageUrl.includes("tiktokcdn")) {
      headers["Referer"] = "https://www.tiktok.com/";
      headers["Origin"] = "https://www.tiktok.com";
      headers["sec-fetch-site"] = "same-site";
      headers["sec-fetch-mode"] = "no-cors";
      headers["sec-fetch-dest"] = "image";
    }

    // Fetch the image from the original URL
    const response = await fetch(imageUrl, { headers });

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
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
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
