import { NextRequest, NextResponse } from "next/server";

interface InstagramEmbedResponse {
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  author_id: string;
  media_id: string;
  provider_name: string;
  provider_url: string;
  type: string;
  width: number | null;
  height: number | null;
  html: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
}

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

    // Validate Instagram URL format
    if (!isValidInstagramUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Instagram URL format",
        },
        { status: 400 }
      );
    }

    console.log("Fetching Instagram embed for URL:", url);

    // Instagram oEmbed endpoint
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN || ""}`;

    const response = await fetch(oembedUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Use Narra Bot/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // If no access token or oEmbed fails, generate fallback embed
      console.log("Instagram oEmbed failed, using fallback embed");
      return generateFallbackEmbed(url);
    }

    const data: InstagramEmbedResponse = await response.json();

    console.log("Instagram embed successful:", {
      author: data.author_name,
      hasHtml: !!data.html,
    });

    return NextResponse.json({
      success: true,
      data,
      method: "oembed",
    });
  } catch (error) {
    console.error("Instagram embed API error:", error);

    // If oEmbed fails, try fallback embed
    const url = (await request.json()).url;
    if (url) {
      return generateFallbackEmbed(url);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
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

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: { "Content-Type": "application/json" },
    })
  );
}

function isValidInstagramUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
    /^https:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
    /^https:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
  ];

  return patterns.some(pattern => pattern.test(url));
}

function generateFallbackEmbed(url: string): NextResponse {
  // Extract shortcode from URL
  const shortcodeMatch = url.match(/\/(p|reel|tv)\/([\w-]+)/);
  if (!shortcodeMatch) {
    return NextResponse.json(
      {
        success: false,
        error: "Could not extract post ID from Instagram URL",
      },
      { status: 400 }
    );
  }

  const shortcode = shortcodeMatch[2];

  // Generate Instagram embed HTML without oEmbed API
  const embedHtml = `<blockquote class="instagram-media" 
    data-instgrm-captioned 
    data-instgrm-permalink="${url}" 
    data-instgrm-version="14"
    style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
    <div style="padding:16px;">
      <a href="${url}" 
         style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" 
         target="_blank">
        View this post on Instagram
      </a>
    </div>
  </blockquote>
  <script async src="//www.instagram.com/embed.js"></script>`;

  const embedData = {
    version: "1.0",
    title: `Instagram Post`,
    author_name: "Instagram User",
    author_url:
      url.split("/p/")[0] || url.split("/reel/")[0] || url.split("/tv/")[0],
    author_id: "",
    media_id: shortcode,
    provider_name: "Instagram",
    provider_url: "https://www.instagram.com",
    type: "rich",
    width: 540,
    height: null,
    html: embedHtml,
    thumbnail_url: "",
    thumbnail_width: 640,
    thumbnail_height: 640,
  };

  return NextResponse.json({
    success: true,
    data: embedData,
    method: "fallback",
  });
}
