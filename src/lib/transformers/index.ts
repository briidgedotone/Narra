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

    // Transform Instagram posts to our application format - FIXED
    postsToAppFormat(apiResponse: any, profileHandle: string) {
      // Handle both posts API response and profile-extracted posts
      let items = [];

      if (apiResponse?.items) {
        // Direct items response from our getPosts method
        items = apiResponse.items;
      } else if (apiResponse?.data?.items) {
        // Direct posts API response
        items = apiResponse.data.items;
      } else if (apiResponse?.data?.user?.edge_owner_to_timeline_media?.edges) {
        // Profile response with embedded posts
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
        // Handle different post structures (API vs Profile-embedded)
        const isProfilePost = post.shortcode && post.display_url; // Profile posts have these fields

        // Extract caption from the complex structure
        const caption =
          post.caption?.text ||
          post.edge_media_to_caption?.edges?.[0]?.node?.text ||
          "";

        // Handle media URLs - different structures for API vs Profile posts
        let mediaUrl, embedUrl, thumbnail;

        if (isProfilePost) {
          // Profile-embedded post structure
          mediaUrl = post.video_url || post.display_url || "";
          embedUrl = `https://www.instagram.com/p/${post.shortcode}/`;
          thumbnail = post.display_url || post.thumbnail_src || "";
        } else {
          // Direct API post structure
          mediaUrl =
            post.video_url ||
            post.image_versions2?.candidates?.[0]?.url ||
            post.display_url ||
            "";
          embedUrl = post.code
            ? `https://www.instagram.com/p/${post.code}/`
            : mediaUrl;
          thumbnail =
            post.image_versions2?.candidates?.[1]?.url || // Second candidate is usually smaller
            post.image_versions2?.candidates?.[0]?.url ||
            post.display_url ||
            mediaUrl;
        }

        // Handle metrics - different field names
        const likes = post.like_count || post.edge_liked_by?.count || 0;
        const comments =
          post.comment_count || post.edge_media_to_comment?.count || 0;
        const views = post.view_count || post.video_view_count || undefined;

        // Handle timestamp
        const timestamp =
          post.taken_at || post.taken_at_timestamp || Date.now() / 1000;

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
            views: views,
          },
          datePosted: new Date(timestamp * 1000).toISOString(),
          isVideo: post.media_type === 2 || post.is_video || !!post.video_url,
          videoUrl: post.video_url,
          displayUrl:
            post.display_url || post.image_versions2?.candidates?.[0]?.url,
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
