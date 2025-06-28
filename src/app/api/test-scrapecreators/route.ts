import { NextRequest, NextResponse } from "next/server";

import { scrapeCreatorsApi, transformers } from "@/lib/api/scrape-creators";

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
        const cursorParam =
          searchParams.get("cursor") ||
          searchParams.get("max_cursor") ||
          undefined;
        result = await scrapeCreatorsApi.tiktok.getProfileVideos(
          tiktokHandle,
          videoCount,
          cursorParam
        );
        break;

      case "instagram-profile":
        const igHandle = searchParams.get("handle") || "sydneythomas";
        const trim = searchParams.get("trim") === "true";
        result = await scrapeCreatorsApi.instagram.getProfile(igHandle, trim);

        // Transform the response to show how to extract key data
        if (result.success && result.data) {
          const apiData = result.data as any;
          const user = apiData.data?.user;

          if (user) {
            const transformedData = {
              original: result.data,
              extracted: {
                handle: user.username,
                displayName: user.full_name,
                bio: user.biography,
                followers: user.edge_followed_by?.count || 0,
                following: user.edge_follow?.count || 0,
                posts: user.edge_owner_to_timeline_media?.count || 0,
                avatarUrl: user.profile_pic_url_hd || user.profile_pic_url,
                verified: user.is_verified,
                isPrivate: user.is_private,
                isBusiness: user.is_business_account,
                category: user.category_name,
                externalUrl: user.external_url,
                bioLinks: user.bio_links,
                recentPosts:
                  user.edge_owner_to_timeline_media?.edges
                    ?.slice(0, 3)
                    .map((edge: any) => ({
                      id: edge.node.id,
                      shortcode: edge.node.shortcode,
                      isVideo: edge.node.is_video,
                      displayUrl: edge.node.display_url,
                      caption:
                        edge.node.edge_media_to_caption?.edges?.[0]?.node
                          ?.text || "",
                      likes: edge.node.edge_liked_by?.count || 0,
                      comments: edge.node.edge_media_to_comment?.count || 0,
                      views: edge.node.video_view_count,
                      timestamp: edge.node.taken_at_timestamp,
                    })) || [],
              },
            };

            return NextResponse.json({
              success: true,
              ...transformedData,
              cached: result.cached,
              status: result.status,
            });
          }
        }
        break;

      case "instagram-posts":
        const igPostsHandle = searchParams.get("handle") || "sydneythomas";
        const postsCount = parseInt(searchParams.get("count") || "5");
        const nextMaxId = searchParams.get("next_max_id");
        result = await scrapeCreatorsApi.instagram.getPosts(
          igPostsHandle,
          postsCount,
          nextMaxId || undefined
        );
        break;

      case "instagram-profile-simple":
        // Simple test without transformation
        const simpleHandle = searchParams.get("handle") || "instagram";
        result = await scrapeCreatorsApi.instagram.getProfile(
          simpleHandle,
          true
        );
        break;

      case "instagram-transformed":
        // Test using our transformer functions
        const transformHandle = searchParams.get("handle") || "nike";
        const transformTrim = searchParams.get("trim") === "true";

        // Get profile data
        const profileResult = await scrapeCreatorsApi.instagram.getProfile(
          transformHandle,
          transformTrim
        );
        let profileData = null;

        if (profileResult.success && profileResult.data) {
          profileData = transformers.instagram.profileToAppFormat(
            profileResult.data
          );
        }

        // Get posts data separately
        const postsResult = await scrapeCreatorsApi.instagram.getPosts(
          transformHandle,
          5
        );
        let postsData: any[] = [];

        if (postsResult.success && postsResult.data) {
          postsData = transformers.instagram.postsToAppFormat(
            postsResult.data,
            transformHandle
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            profile: profileData,
            posts: postsData,
            postsCount: postsData.length,
          },

          cached: profileResult.cached || postsResult.cached,
          status: profileResult.status,
          message:
            "Data transformed using official ScrapeCreators API structure with separate posts call",
        });
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid test parameter. Use: connection, tiktok-profile, tiktok-videos, instagram-profile, instagram-posts, instagram-profile-simple, or instagram-transformed",
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
