// Data transformers for social media APIs
// This file contains only transformation logic and can be used client-side

export const transformers = {
  instagram: {
    // Transform Instagram profile data to our application format
    profileToAppFormat(apiResponse: any) {
      const user = apiResponse?.data?.user;
      if (!user) return null;

      return {
        handle: user.username,
        displayName: user.full_name,
        platform: "instagram" as const,
        followers: user.edge_followed_by?.count || 0,
        following: user.edge_follow?.count || 0,
        posts: user.edge_owner_to_timeline_media?.count || 0,
        bio: user.biography || "",
        avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
        verified: user.is_verified || false,
        isPrivate: user.is_private || false,
        isBusiness: user.is_business_account || false,
        category: user.category_name,
        externalUrl: user.external_url,
        bioLinks: user.bio_links || [],
      };
    },

    // Transform Instagram posts to our application format - UPDATED for v2 API
    postsToAppFormat(apiResponse: any, profileHandle: string) {
      // Handle multiple possible response structures
      let items = [];

      if (apiResponse?.items) {
        // v2 API direct items response
        items = apiResponse.items;
      } else if (apiResponse?.data?.items) {
        // v2 API nested items response
        items = apiResponse.data.items;
      } else if (apiResponse?.data?.user?.edge_owner_to_timeline_media?.edges) {
        // Profile response with embedded posts (fallback)
        items = apiResponse.data.user.edge_owner_to_timeline_media.edges.map(
          (edge: any) => edge.node
        );
      } else {
        // Fallback for other structures
        items = apiResponse?.data?.items || [];
      }

      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      return items.map((post: any, index: number) => {
        // Determine post structure type
        const isV2ApiPost = post.pk && post.code; // v2 API posts have pk and code fields
        const isProfilePost = post.shortcode && post.display_url; // Profile posts have these fields

        // Extract caption from the complex structure
        let caption = "";
        if (post.caption?.text) {
          caption = post.caption.text;
        } else if (post.edge_media_to_caption?.edges?.[0]?.node?.text) {
          caption = post.edge_media_to_caption.edges[0].node.text;
        }

        // Handle media URLs based on post structure
        let embedUrl,
          thumbnail,
          carouselMedia = [];

        // Check if this is a carousel post (multiple images/videos)
        const isCarousel =
          post.media_type === 8 && post.carousel_media?.length > 0;

        if (isCarousel) {
          // Handle carousel posts with multiple media items
          carouselMedia = post.carousel_media.map(
            (item: any, itemIndex: number) => {
              const itemVideoUrl = item.video_versions?.[0]?.url;

              // Try to find the best image URL from candidates array
              // Prefer fbcdn.net domains over scontent domains for better proxy compatibility
              let itemImageUrl = "";
              if (item.image_versions2?.candidates) {
                // First try to find fbcdn.net URLs
                const fbcdnCandidate = item.image_versions2.candidates.find(
                  (candidate: any) =>
                    candidate.url && candidate.url.includes("fbcdn.net")
                );

                if (fbcdnCandidate) {
                  itemImageUrl = fbcdnCandidate.url;
                } else {
                  // Fallback to first available candidate
                  itemImageUrl = item.image_versions2.candidates[0]?.url || "";
                }
              }

              return {
                id: item.pk || `carousel-${itemIndex}`,
                type: item.media_type === 2 ? "video" : "image",
                url: itemVideoUrl || itemImageUrl || "",
                thumbnail: itemImageUrl || "",
                isVideo: item.media_type === 2 || !!item.video_versions?.length,
              };
            }
          );

          // Use first carousel item for main display
          const firstItem = carouselMedia[0];
          embedUrl =
            firstItem?.url || `https://www.instagram.com/p/${post.code}/`;
          thumbnail = firstItem?.thumbnail || "";
        } else if (isV2ApiPost) {
          // v2 API post structure - use direct video URLs for better modal playback
          const videoUrl = post.video_versions?.[0]?.url;
          const imageUrl =
            post.image_versions2?.candidates?.[0]?.url || post.display_uri;

          // For Instagram videos, use direct video URL as embedUrl for modal playback
          embedUrl =
            videoUrl || imageUrl || `https://www.instagram.com/p/${post.code}/`;
          thumbnail = imageUrl || post.display_uri || "";
        } else if (isProfilePost) {
          // Profile-embedded post structure
          embedUrl = `https://www.instagram.com/p/${post.shortcode}/`;
          thumbnail = post.display_url || post.thumbnail_src || "";
        } else {
          // v2 API post structure - use direct video URLs
          const videoUrl = post.video_versions?.[0]?.url || post.video_url;
          const imageUrl =
            post.image_versions2?.candidates?.[0]?.url || post.display_url;

          // For Instagram videos, use direct video URL as embedUrl for modal playback
          embedUrl =
            videoUrl || imageUrl || `https://www.instagram.com/p/${post.code}/`;
          thumbnail =
            post.image_versions2?.candidates?.[1]?.url ||
            post.image_versions2?.candidates?.[0]?.url ||
            post.display_url ||
            imageUrl;
        }

        // Handle metrics with proper field mapping
        let likes, comments, views;

        if (isV2ApiPost) {
          likes = post.like_count || 0;
          comments = post.comment_count || 0;
          views = post.play_count || post.view_count || undefined;
        } else {
          likes = post.like_count || post.edge_liked_by?.count || 0;
          comments =
            post.comment_count || post.edge_media_to_comment?.count || 0;
          views = post.view_count || post.video_view_count || undefined;
        }

        // Handle timestamp
        const timestamp =
          post.taken_at || post.taken_at_timestamp || Date.now() / 1000;

        // Determine if it's a video (for carousel, check if first item is video)
        const isVideo = isCarousel
          ? carouselMedia[0]?.isVideo || false
          : post.media_type === 2 ||
            post.is_video ||
            !!post.video_url ||
            !!post.video_versions?.length;

        return {
          id: post.pk || post.id || `instagram-${index}`,
          platformPostId: post.pk || post.id || `instagram-${index}`,
          platform: "instagram" as const,
          embedUrl: embedUrl,
          caption: caption,
          thumbnail: thumbnail,
          metrics: {
            likes: likes,
            comments: comments,
            ...(views !== undefined && { views: views }),
            // Note: Instagram API doesn't provide shares data
          },
          datePosted: new Date(timestamp * 1000).toISOString(),
          isVideo: isVideo,
          isCarousel: isCarousel,
          carouselMedia: carouselMedia,
          carouselCount: isCarousel ? carouselMedia.length : 0,
          videoUrl: post.video_versions?.[0]?.url || post.video_url,
          displayUrl:
            post.display_uri ||
            post.display_url ||
            post.image_versions2?.candidates?.[0]?.url,
          shortcode: post.code || post.shortcode,
          dimensions:
            post.original_width && post.original_height
              ? {
                  width: post.original_width,
                  height: post.original_height,
                }
              : post.dimensions || undefined,
          originProfile: {
            handle: profileHandle,
            platform: "instagram" as const,
          },
        };
      });
    },
  },

  tiktok: {
    // Transform TikTok profile data to our application format
    profileToAppFormat(apiResponse: any) {
      const user = apiResponse?.user;
      const stats = apiResponse?.stats || apiResponse?.statsV2;
      if (!user) return null;

      return {
        handle: user.uniqueId,
        displayName: user.nickname || user.uniqueId,
        platform: "tiktok" as const,
        followers: parseInt(stats?.followerCount) || 0,
        following: parseInt(stats?.followingCount) || 0,
        posts: parseInt(stats?.videoCount) || 0,
        bio: user.signature || "",
        avatarUrl:
          user.avatarLarger || user.avatarMedium || user.avatarThumb || "",
        verified: user.verified || false,
      };
    },
  },
};
