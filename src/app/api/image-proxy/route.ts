import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("URL parameter is required", { status: 400 });
  }

  try {
    // The URL from search params might still be partially encoded. Fully decode it.
    const decodedUrl = decodeURIComponent(imageUrl);

    const url = new URL(decodedUrl);

    // Set specific headers for different domains
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    if (url.hostname.includes("tiktok")) {
      headers.Referer = "https://www.tiktok.com/";
    } else if (
      url.hostname.includes("instagram") ||
      url.hostname.includes("fbcdn")
    ) {
      headers.Referer = "https://www.instagram.com/";
    } else if (
      url.hostname.includes("scontent") &&
      url.hostname.includes("cdninstagram")
    ) {
      // Special handling for Instagram scontent CDN domains
      headers.Referer = "https://www.instagram.com/";
      headers["Accept"] = "image/webp,image/apng,image/*,*/*;q=0.8";
      headers["Accept-Language"] = "en-US,en;q=0.9";
      headers["Cache-Control"] = "no-cache";
      headers["Pragma"] = "no-cache";
      headers["Sec-Fetch-Dest"] = "image";
      headers["Sec-Fetch-Mode"] = "no-cors";
      headers["Sec-Fetch-Site"] = "cross-site";
    }

    const response = await fetch(decodedUrl, {
      headers,
    });

    if (!response.ok) {
      console.error(`Image proxy failed for URL: ${decodedUrl}`, {
        status: response.status,
        statusText: response.statusText,
      });
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable", // Cache for 1 day
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", {
      message: error.message,
      url: imageUrl,
    });
    return new NextResponse("Error processing image request", { status: 500 });
  }
}
