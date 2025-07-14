"use client";

import { useState, useCallback, useMemo } from "react";

import { getCached, setCache } from "@/lib/utils/cache";
import { proxyInstagramImage } from "@/lib/utils/image-proxy";
import {
  Post,
  Profile,
  TikTokVideoData,
  InstagramPostData,
  SortOption,
} from "@/types/discovery";

export function usePostsData() {
  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [tiktokHasMore, setTiktokHasMore] = useState(false);
  const [tiktokMaxCursor, setTiktokMaxCursor] = useState<string | null>(null);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");

  const loadPosts = useCallback(async (searchResults: Profile | null) => {
    if (!searchResults) return;

    setPosts([]);

    try {
      const handle = searchResults.handle;
      const platform = searchResults.platform;
      const postsCacheKey = `posts:${platform}:${handle}`;

      // Check cache first
      const cachedPosts = getCached<Post[]>(postsCacheKey);
      if (cachedPosts) {
        console.log("Using cached posts for", handle);
        setPosts(cachedPosts);
        return;
      }

      // Call our API to get real posts
      const type = platform === "tiktok" ? "videos" : "posts";
      const response = await fetch(
        `/api/content?platform=${platform}&type=${type}&handle=${encodeURIComponent(handle)}&count=30`
      );

      // Check if response is ok and has valid content type
      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API response is not valid JSON");
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("API response is empty");
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText.substring(0, 500) + "...");
        throw new Error("Invalid JSON response from API");
      }

      if (result.success && result.data) {
        // Handle different possible response structures
        let videosArray = result.data;

        // Use our transformer functions for consistent data processing
        if (platform === "tiktok") {
          // TikTok API returns videos in aweme_list
          if (result.data.aweme_list) {
            videosArray = result.data.aweme_list;
          } else if (result.data.videos) {
            videosArray = result.data.videos;
          } else if (result.data.data) {
            videosArray = result.data.data;
          } else if (!Array.isArray(result.data)) {
            console.log("TikTok API response structure:", result.data);
            videosArray = [];
          }

          // Set pagination metadata for TikTok
          setTiktokHasMore(result.data.has_more === 1 || false);
          setTiktokMaxCursor(result.data.max_cursor || null);
        } else {
          // Instagram API returns posts in items array - use our client-safe transformer
          const { transformers } = await import("@/lib/transformers");
          const transformedPosts = transformers.instagram.postsToAppFormat(
            result.data,
            handle
          );

          // Set pagination metadata for Instagram
          setHasMorePosts(result.data.more_available || false);
          setNextMaxId(result.data.next_max_id || null);

          // Convert to our Post interface format - preserve all content type properties
          const newPosts: Post[] = transformedPosts.map((post: Post) => ({
            id: post.id,
            embedUrl: post.embedUrl,
            caption: post.caption || "",
            thumbnail: post.thumbnail,
            metrics: {
              // For Instagram: Only show metrics that are actually available
              ...(post.metrics?.views !== undefined && {
                views: post.metrics.views,
              }),
              likes: post.metrics?.likes || 0,
              comments: post.metrics?.comments || 0,
              ...(post.metrics?.shares !== undefined && {
                shares: post.metrics.shares,
              }),
            },
            datePosted: post.datePosted,
            platform: post.platform,
            // Preserve content type properties for proper UI handling
            isVideo: post.isVideo || false,
            isCarousel: post.isCarousel || false,
            carouselMedia: post.carouselMedia || [],
            carouselCount: post.carouselCount || 0,
            ...(post.shortcode && { shortcode: post.shortcode }),
          }));

          // Cache the Instagram posts
          setCache(postsCacheKey, newPosts);
          // Set the posts directly since we cleared the array at the start
          setPosts(newPosts);
          return; // Exit early since we've already processed Instagram posts
        }

        // Transform the API response to our Post interface (TikTok)
        const realPosts: Post[] = Array.isArray(videosArray)
          ? videosArray.map(
              (
                item: TikTokVideoData | InstagramPostData,
                index: number
              ): Post => {
                if (platform === "tiktok") {
                  // Transform TikTok video data
                  const tiktokItem = item as TikTokVideoData;

                  return {
                    id: tiktokItem.aweme_id || `tiktok-${index}`,
                    embedUrl:
                      tiktokItem.video?.play_addr?.url_list?.[0] ||
                      tiktokItem.video?.download_addr?.url_list?.[0] ||
                      "",
                    caption: tiktokItem.desc || "No caption available",
                    thumbnail:
                      tiktokItem.video?.dynamic_cover?.url_list?.[0] ||
                      tiktokItem.video?.origin_cover?.url_list?.[0] ||
                      "",
                    metrics: {
                      views: tiktokItem.statistics?.play_count || 0,
                      likes: tiktokItem.statistics?.digg_count || 0,
                      comments: tiktokItem.statistics?.comment_count || 0,
                      shares: tiktokItem.statistics?.share_count || 0,
                    },
                    datePosted: new Date(
                      tiktokItem.create_time * 1000
                    ).toISOString(),
                    platform: "tiktok" as const,
                    tiktokUrl: `https://www.tiktok.com/@${handle}/video/${tiktokItem.aweme_id}`,
                  };
                } else {
                  // Transform Instagram post data
                  const instagramItem = item as InstagramPostData;

                  // Handle different possible Instagram API response structures
                  const postId = instagramItem.id || `instagram-${index}`;
                  const caption =
                    instagramItem.caption?.text ||
                    instagramItem.edge_media_to_caption?.edges?.[0]?.node
                      ?.text ||
                    "No caption available";

                  // Handle different image/video URL structures
                  const mediaUrl =
                    instagramItem.video_url ||
                    instagramItem.display_url ||
                    instagramItem.image_versions2?.candidates?.[0]?.url ||
                    instagramItem.carousel_media?.[0]?.image_versions2
                      ?.candidates?.[0]?.url ||
                    "";

                  const thumbnailUrl = proxyInstagramImage(
                    instagramItem.display_url ||
                      instagramItem.thumbnail_src ||
                      instagramItem.image_versions2?.candidates?.[0]?.url ||
                      mediaUrl ||
                      ""
                  );

                  // Handle different metrics structures
                  const likes =
                    instagramItem.like_count ||
                    instagramItem.edge_media_preview_like?.count ||
                    0;
                  const comments =
                    instagramItem.comment_count ||
                    instagramItem.edge_media_to_comment?.count ||
                    0;
                  const views =
                    instagramItem.view_count ||
                    instagramItem.video_view_count ||
                    instagramItem.play_count;

                  // Handle timestamp
                  const timestamp =
                    instagramItem.taken_at ||
                    instagramItem.taken_at_timestamp ||
                    Date.now() / 1000;

                  return {
                    id: postId,
                    embedUrl: mediaUrl,
                    caption: caption,
                    thumbnail: thumbnailUrl,
                    metrics: {
                      likes: likes,
                      comments: comments,
                      ...(views !== undefined && { views: views }),
                    },
                    datePosted: new Date(timestamp * 1000).toISOString(),
                    platform: "instagram" as const,
                  };
                }
              }
            )
          : [];

        // For TikTok posts, ensure all metrics are shown (even if 0)
        const processedPosts =
          platform === "tiktok"
            ? realPosts.map(post => ({
                ...post,
                metrics: {
                  views: post.metrics.views || 0,
                  likes: post.metrics.likes || 0,
                  comments: post.metrics.comments || 0,
                  shares: post.metrics.shares || 0,
                },
              }))
            : realPosts;

        // Cache the posts
        setCache(postsCacheKey, processedPosts);
        setPosts(processedPosts);
      } else {
        console.error("Failed to load posts:", result.error);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  }, []);

  const loadMorePosts = useCallback(
    async (searchResults: Profile | null) => {
      if (!searchResults || isLoadingMorePosts) return;

      // Check if there are more posts for the current platform
      const hasMore =
        searchResults.platform === "instagram" ? hasMorePosts : tiktokHasMore;
      if (!hasMore) return;

      setIsLoadingMorePosts(true);
      try {
        const handle = searchResults.handle;
        const platform = searchResults.platform;

        if (platform === "instagram") {
          if (!nextMaxId) return;

          // Call Instagram API with pagination
          const response = await fetch(
            `/api/content?platform=instagram&type=posts&handle=${encodeURIComponent(handle)}&count=30&next_max_id=${nextMaxId}`
          );

          // Check if response is valid
          if (!response.ok) {
            throw new Error(
              `API request failed: ${response.status} ${response.statusText}`
            );
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim().length === 0) {
            throw new Error("API response is empty");
          }

          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              "JSON parse error in loadMorePosts (Instagram):",
              parseError
            );
            throw new Error("Invalid JSON response from API");
          }

          if (result.success && result.data) {
            const { transformers } = await import("@/lib/transformers");
            const transformedPosts = transformers.instagram.postsToAppFormat(
              result.data,
              handle
            );

            // Update pagination metadata
            setHasMorePosts(result.data.more_available || false);
            setNextMaxId(result.data.next_max_id || null);

            // Convert to our Post interface format and append to existing posts - preserve content type properties
            const newPosts: Post[] = transformedPosts.map((post: Post) => ({
              id: post.id,
              embedUrl: post.embedUrl,
              caption: post.caption || "",
              thumbnail: post.thumbnail,
              metrics: {
                ...(post.metrics?.views !== undefined && {
                  views: post.metrics.views,
                }),
                likes: post.metrics?.likes || 0,
                comments: post.metrics?.comments || 0,
                ...(post.metrics?.shares !== undefined && {
                  shares: post.metrics.shares,
                }),
              },
              datePosted: post.datePosted,
              platform: post.platform,
              // Preserve content type properties for proper UI handling
              isVideo: post.isVideo || false,
              isCarousel: post.isCarousel || false,
              carouselMedia: post.carouselMedia || [],
              carouselCount: post.carouselCount || 0,
              ...(post.shortcode && { shortcode: post.shortcode }),
            }));

            // Append new posts to existing posts
            setPosts(prevPosts => [...prevPosts, ...newPosts]);
          }
        } else if (platform === "tiktok") {
          if (!tiktokMaxCursor) return;

          // Call TikTok API with pagination
          const response = await fetch(
            `/api/content?platform=tiktok&type=videos&handle=${encodeURIComponent(handle)}&count=30&cursor=${tiktokMaxCursor}`
          );

          // Check if response is valid
          if (!response.ok) {
            throw new Error(
              `API request failed: ${response.status} ${response.statusText}`
            );
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim().length === 0) {
            throw new Error("API response is empty");
          }

          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error(
              "JSON parse error in loadMorePosts (TikTok):",
              parseError
            );
            throw new Error("Invalid JSON response from API");
          }

          if (result.success && result.data) {
            // Get videos array from TikTok response
            let videosArray = [];
            if (result.data.aweme_list) {
              videosArray = result.data.aweme_list;
            } else if (result.data.videos) {
              videosArray = result.data.videos;
            } else if (result.data.data) {
              videosArray = result.data.data;
            }

            // Update TikTok pagination metadata
            setTiktokHasMore(
              result.data.has_more === 1 || result.data.has_more === true
            );
            setTiktokMaxCursor(result.data.max_cursor || null);

            // Transform TikTok videos using the same logic as loadPosts
            const newPosts: Post[] = Array.isArray(videosArray)
              ? videosArray.map(
                  (item: TikTokVideoData, index: number): Post => {
                    return {
                      id: item.aweme_id || `tiktok-${index}`,
                      embedUrl:
                        item.video?.play_addr?.url_list?.[0] ||
                        item.video?.download_addr?.url_list?.[0] ||
                        "",
                      caption: item.desc || "No caption available",
                      thumbnail:
                        item.video?.dynamic_cover?.url_list?.[0] ||
                        item.video?.origin_cover?.url_list?.[0] ||
                        "",
                      metrics: {
                        views: item.statistics?.play_count || 0,
                        likes: item.statistics?.digg_count || 0,
                        comments: item.statistics?.comment_count || 0,
                        shares: item.statistics?.share_count || 0,
                      },
                      datePosted: new Date(
                        item.create_time * 1000
                      ).toISOString(),
                      platform: "tiktok" as const,
                      tiktokUrl: `https://www.tiktok.com/@${handle}/video/${item.aweme_id}`,
                    };
                  }
                )
              : [];

            // Append new posts to existing posts
            setPosts(prevPosts => [...prevPosts, ...newPosts]);
          }
        }
      } catch (error) {
        console.error("Failed to load more posts:", error);
      } finally {
        setIsLoadingMorePosts(false);
      }
    },
    [
      hasMorePosts,
      nextMaxId,
      tiktokHasMore,
      tiktokMaxCursor,
      isLoadingMorePosts,
    ]
  );

  const sortedPosts = useMemo(() => {
    const postsToSort = [...posts];
    switch (sortOption) {
      case "most-viewed":
        return postsToSort.sort(
          (a, b) => (b.metrics.views ?? 0) - (a.metrics.views ?? 0)
        );
      case "most-liked":
        return postsToSort.sort((a, b) => b.metrics.likes - a.metrics.likes);
      case "most-commented":
        return postsToSort.sort(
          (a, b) => b.metrics.comments - a.metrics.comments
        );
      case "most-recent":
      default:
        // Assuming datePosted is a string that can be parsed into a Date
        return postsToSort.sort(
          (a, b) =>
            new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        );
    }
  }, [posts, sortOption]);

  return {
    // State
    posts: sortedPosts,
    hasMorePosts,
    tiktokHasMore,
    isLoadingMorePosts,
    sortOption,

    // Actions
    loadPosts,
    loadMorePosts,
    setSortOption,
    setPosts,
  };
}
