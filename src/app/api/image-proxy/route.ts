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
    let referer = url.origin;

    // Set specific referer for TikTok and Instagram
    if (url.hostname.includes("tiktok")) {
      referer = "https://www.tiktok.com/";
    } else if (
      url.hostname.includes("instagram") ||
      url.hostname.includes("fbcdn")
    ) {
      referer = "https://www.instagram.com/";
    }

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: referer,
      },
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
