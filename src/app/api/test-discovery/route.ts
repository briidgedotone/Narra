import { NextResponse } from "next/server";

import { scrapeCreatorsApi, transformers } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform") || "tiktok";
  const includePosts = searchParams.get("includePosts") === "true";

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

    let profileResult;
    let postsResult = null;

    if (platform === "tiktok") {
      profileResult = await scrapeCreatorsApi.tiktok.getProfile(cleanHandle);

      // Fetch posts if requested
      if (includePosts && profileResult.success) {
        postsResult = await scrapeCreatorsApi.tiktok.getProfileVideos(
          cleanHandle,
          20
        );
      }
    } else {
      profileResult = await scrapeCreatorsApi.instagram.getProfile(
        cleanHandle,
        true
      ); // Use trim for faster response

      // Fetch posts if requested
      if (includePosts && profileResult.success) {
        postsResult = await scrapeCreatorsApi.instagram.getPosts(
          cleanHandle,
          20
        );
      }
    }

    const duration = Date.now() - startTime;

    if (profileResult.success && profileResult.data) {
      // Transform for Discovery page format
      const apiData = profileResult.data as any;

      if (platform === "tiktok") {
        const user = apiData.user;
        const stats = apiData.stats || apiData.statsV2;

        const profile = {
          id: user.id || user.uniqueId,
          handle: user.uniqueId,
          displayName: user.nickname || user.uniqueId,
          platform: "tiktok",
          followers: parseInt(stats.followerCount) || 0,
          following: parseInt(stats.followingCount) || 0,
          posts: parseInt(stats.videoCount) || 0,
          bio: user.signature || "",
          avatarUrl:
            user.avatarLarger ||
            user.avatarMedium ||
            user.avatarThumb ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uniqueId}`,
          verified: user.verified || false,
        };

        // Process posts if included
        let transformedPosts = null;
        if (postsResult && postsResult.success && postsResult.data) {
          const videosArray =
            postsResult.data.aweme_list ||
            postsResult.data.videos ||
            postsResult.data.data ||
            [];
          transformedPosts = Array.isArray(videosArray)
            ? videosArray.map((item: any, index: number) => {
                const originCover =
                  item.video?.origin_cover?.url_list?.[0] || "";
                const dynamicCover =
                  item.video?.dynamic_cover?.url_list?.[0] || "";
                let thumbnailUrl = dynamicCover || originCover;

                if (thumbnailUrl && thumbnailUrl.includes(".heic")) {
                  thumbnailUrl = thumbnailUrl.replace(".heic", ".jpeg");
                }

                return {
                  id: item.aweme_id || `tiktok-${index}`,
                  embedUrl:
                    item.video?.play_addr?.url_list?.[0] ||
                    item.video?.download_addr?.url_list?.[0] ||
                    "",
                  caption: item.desc || "No caption available",
                  thumbnail: thumbnailUrl,
                  metrics: {
                    views: item.statistics?.play_count || 0,
                    likes: item.statistics?.digg_count || 0,
                    comments: item.statistics?.comment_count || 0,
                    shares: item.statistics?.share_count || 0,
                  },
                  datePosted: new Date(item.create_time * 1000).toISOString(),
                  platform: "tiktok" as const,
                  tiktokUrl: `https://www.tiktok.com/@${cleanHandle}/video/${item.aweme_id}`,
                };
              })
            : [];
        }

        return NextResponse.json({
          success: true,
          data: {
            profile,
            posts: transformedPosts,
          },
          cached: profileResult.cached || false,
          duration: `${duration}ms`,
        });
      } else {
        // Instagram profile handling
        const transformedProfile =
          transformers.instagram.profileToAppFormat(apiData);

        if (!transformedProfile) {
          return NextResponse.json({
            success: false,
            error: "Failed to transform Instagram profile data",
            duration: `${duration}ms`,
          });
        }

        // Convert to Discovery page format
        const profile = {
          id: transformedProfile.handle,
          handle: transformedProfile.handle,
          displayName: transformedProfile.displayName,
          platform: "instagram",
          followers: transformedProfile.followers,
          following: transformedProfile.following,
          posts: transformedProfile.posts,
          bio: transformedProfile.bio,
          avatarUrl:
            transformedProfile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${transformedProfile.handle}`,
          verified: transformedProfile.verified,
          isPrivate: transformedProfile.isPrivate,
          isBusiness: transformedProfile.isBusiness,
          category: transformedProfile.category,
          externalUrl: transformedProfile.externalUrl,
        };

        // Process posts if included
        let transformedPosts = null;
        if (postsResult && postsResult.success && postsResult.data) {
          const postsData = transformers.instagram.postsToAppFormat(
            postsResult.data,
            cleanHandle
          );
          transformedPosts = postsData.map((post: any) => ({
            id: post.id,
            embedUrl: post.embedUrl,
            caption: post.caption || "",
            thumbnail: post.thumbnail,
            metrics: {
              views: post.metrics?.views || 0,
              likes: post.metrics?.likes || 0,
              comments: post.metrics?.comments || 0,
              shares: post.metrics?.shares || 0,
            },
            datePosted: post.datePosted,
            platform: post.platform,
          }));
        }

        return NextResponse.json({
          success: true,
          data: {
            profile,
            posts: transformedPosts,
          },
          cached: profileResult.cached || false,
          duration: `${duration}ms`,
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: profileResult.error || "Profile not found",
        duration: `${duration}ms`,
      });
    }
  } catch (error) {
    console.error("Discovery API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
