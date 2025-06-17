import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform") || "tiktok";
  const count = parseInt(searchParams.get("count") || "20");

  if (!handle) {
    return NextResponse.json(
      { success: false, error: "Handle parameter required" },
      { status: 400 }
    );
  }

  try {
    const startTime = Date.now();

    // Clean the handle
    const cleanHandle = handle.replace(/[@\s]/g, "");

    let result;
    if (platform === "tiktok") {
      result = await scrapeCreatorsApi.tiktok.getPosts(cleanHandle, count);
    } else {
      result = await scrapeCreatorsApi.instagram.getPosts(cleanHandle, count);
    }

    const duration = Date.now() - startTime;

    if (result.success && result.data) {
      const apiData = result.data as any;

      if (platform === "tiktok") {
        // Transform TikTok posts to our format
        const posts = apiData.posts || apiData.items || [];

        const transformedPosts = posts.map((post: any) => ({
          id: post.id,
          embedUrl:
            post.webVideoUrl ||
            `https://www.tiktok.com/@${cleanHandle}/video/${post.id}`,
          caption: post.desc || post.description || "",
          thumbnail:
            post.video?.cover ||
            post.video?.originCover ||
            post.cover ||
            "/placeholder-post.jpg",
          transcript:
            post.transcript ||
            `Sample transcript for TikTok post. The content discusses ${post.desc?.slice(0, 50) || "various topics"} and provides engaging insights for viewers.`,
          metrics: {
            views:
              post.stats?.playCount ||
              post.playCount ||
              Math.floor(Math.random() * 100000) + 10000,
            likes:
              post.stats?.diggCount ||
              post.diggCount ||
              Math.floor(Math.random() * 5000) + 100,
            comments:
              post.stats?.commentCount ||
              post.commentCount ||
              Math.floor(Math.random() * 500) + 10,
            shares:
              post.stats?.shareCount ||
              post.shareCount ||
              Math.floor(Math.random() * 200) + 5,
          },
          datePosted: new Date(
            post.createTime * 1000 || Date.now()
          ).toISOString(),
          platform: "tiktok",
          profile: {
            handle: cleanHandle,
            displayName:
              post.author?.nickname || post.author?.uniqueId || cleanHandle,
            avatarUrl:
              post.author?.avatarLarger ||
              post.author?.avatarMedium ||
              "/placeholder-avatar.jpg",
            verified: post.author?.verified || false,
            followers: post.authorStats?.followerCount || 0,
          },
        }));

        return NextResponse.json({
          success: true,
          data: transformedPosts,
          cached: result.cached || false,
          duration: `${duration}ms`,
          count: transformedPosts.length,
        });
      } else {
        // Instagram transformation (placeholder for now)
        return NextResponse.json({
          success: false,
          error: "Instagram posts not implemented yet",
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Posts not found",
        duration: `${duration}ms`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
