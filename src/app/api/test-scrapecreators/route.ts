import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api/scrape-creators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get("test") || "connection";

  try {
    let result;

    switch (test) {
      case "connection":
        result = await scrapeCreatorsApi.testConnection();
        break;

      case "tiktok-profile":
        const handle = searchParams.get("handle") || "iamsydneythomas";
        result = await scrapeCreatorsApi.tiktok.getProfile(handle);
        break;

      case "tiktok-videos":
        const tiktokHandle = searchParams.get("handle") || "iamsydneythomas";
        const videoCount = parseInt(searchParams.get("count") || "5");
        result = await scrapeCreatorsApi.tiktok.getProfileVideos(
          tiktokHandle,
          videoCount
        );
        break;

      case "instagram-profile":
        const igHandle = searchParams.get("handle") || "sydneythomas";
        result = await scrapeCreatorsApi.instagram.getProfile(igHandle);
        break;

      case "instagram-posts":
        const igPostsHandle = searchParams.get("handle") || "sydneythomas";
        const postsCount = parseInt(searchParams.get("count") || "5");
        result = await scrapeCreatorsApi.instagram.getPosts(
          igPostsHandle,
          postsCount
        );
        break;

      case "tiktok-transcript":
        const videoId = searchParams.get("video_id");
        if (!videoId) {
          return NextResponse.json(
            { error: "video_id parameter required for transcript" },
            { status: 400 }
          );
        }
        result = await scrapeCreatorsApi.tiktok.getVideoTranscript(videoId);
        break;

      case "instagram-transcript":
        const postId = searchParams.get("post_id");
        if (!postId) {
          return NextResponse.json(
            { error: "post_id parameter required for transcript" },
            { status: 400 }
          );
        }
        result = await scrapeCreatorsApi.instagram.getPostTranscript(postId);
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid test parameter. Use: connection, tiktok-profile, tiktok-videos, tiktok-transcript, instagram-profile, instagram-posts, or instagram-transcript",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ScrapeCreators API test error:", error);
    return NextResponse.json(
      { error: "Failed to test ScrapeCreators API" },
      { status: 500 }
    );
  }
}
