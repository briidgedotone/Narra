import { createClient } from "@supabase/supabase-js";

import { scrapeCreatorsApi } from "./api/scrape-creators";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RefreshResult {
  success: boolean;
  newPosts: number;
  errors: number;
  message: string;
}

export async function refreshProfileForUser(
  userId: string,
  profileId: string
): Promise<RefreshResult> {
  try {
    console.log(`🔄 Refreshing profile ${profileId} for user ${userId}`);

    // Get the profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    console.log(`📝 Found profile: ${profile.platform}/@${profile.handle}`);

    // Fetch latest posts from the profile
    let posts: any[] = [];

    if (profile.platform === "tiktok") {
      const response = await scrapeCreatorsApi.tiktok.getProfileVideos(
        profile.handle,
        10 // Get 10 latest posts
      );

      if (response.success && response.data) {
        posts = (response.data as any).aweme_list || [];
      }
    } else if (profile.platform === "instagram") {
      const response = await scrapeCreatorsApi.instagram.getPosts(
        profile.handle,
        10 // Get 10 latest posts
      );

      if (response.success && response.data) {
        posts = (response.data as any).items || [];
      }
    }

    console.log(`📊 Found ${posts.length} posts to process`);

    let newPostsCount = 0;
    let errorsCount = 0;

    // Process posts (limit to 7 like the edge function)
    for (let i = 0; i < Math.min(7, posts.length); i++) {
      const post = posts[i];

      try {
        let postId: string | undefined;
        let transformedPost: any | undefined;

        if (profile.platform === "tiktok") {
          if (!post.aweme_id) continue;

          postId = post.aweme_id;

          const thumbnail =
            post.video?.dynamic_cover?.url_list?.[0] ||
            post.video?.cover?.url_list?.find((url: string) =>
              url.includes(".jpeg")
            ) ||
            post.video?.cover?.url_list?.[0] ||
            null;

          transformedPost = {
            user_id: userId,
            profile_id: profileId,
            platform: "tiktok",
            platform_post_id: postId,
            embed_url: `https://www.tiktok.com/@${profile.handle}/video/${postId}`,
            caption: post.desc || "",
            transcript: "",
            thumbnail_url: thumbnail,
            metrics: {
              views: post.statistics?.play_count || 0,
              likes: post.statistics?.digg_count || 0,
              comments: post.statistics?.comment_count || 0,
              shares: post.statistics?.share_count || 0,
            },
            date_posted: post.create_time
              ? new Date(post.create_time * 1000).toISOString()
              : new Date().toISOString(),
          };
        } else if (profile.platform === "instagram") {
          if (!post.id && !post.code) continue;

          postId = post.id || post.code;
          const caption = post.caption?.text || "";

          transformedPost = {
            user_id: userId,
            profile_id: profileId,
            platform: "instagram",
            platform_post_id: postId,
            embed_url: `https://www.instagram.com/p/${post.code}/`,
            caption: caption,
            transcript: "",
            thumbnail_url: post.image_versions2?.candidates?.[0]?.url || null,
            metrics: {
              views: post.video_view_count || post.view_count || 0,
              likes: post.like_count || 0,
              comments: post.comment_count || 0,
              shares: 0,
            },
            date_posted: post.taken_at
              ? new Date(post.taken_at * 1000).toISOString()
              : new Date().toISOString(),
          };
        }

        // Only proceed if we have valid data
        if (!postId || !transformedPost) continue;

        // Check if post already exists
        const { data: existingPost } = await supabase
          .from("followed_posts")
          .select("id")
          .eq("user_id", userId)
          .eq("profile_id", profileId)
          .eq("platform_post_id", postId)
          .single();

        if (existingPost) {
          console.log(`ℹ️ Post ${postId} already exists, skipping`);
          continue;
        }

        // Insert new post
        const { error: insertError } = await supabase
          .from("followed_posts")
          .insert(transformedPost);

        if (insertError) {
          console.error(`❌ Error inserting post ${postId}:`, insertError);
          errorsCount++;
        } else {
          console.log(`✅ Successfully inserted post ${postId}`);
          newPostsCount++;
        }
      } catch (postError) {
        console.error(`❌ Error processing post at index ${i}:`, postError);
        errorsCount++;
      }
    }

    // Update last_refresh timestamp
    const { error: updateError } = await supabase
      .from("follows")
      .update({ last_refresh: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("profile_id", profileId);

    if (updateError) {
      console.error(`❌ Error updating last_refresh:`, updateError);
    }

    const message = `Refreshed @${profile.handle}: ${newPostsCount} new posts, ${errorsCount} errors`;
    console.log(`🎉 ${message}`);

    return {
      success: true,
      newPosts: newPostsCount,
      errors: errorsCount,
      message,
    };
  } catch (error) {
    console.error("❌ Refresh error:", error);
    return {
      success: false,
      newPosts: 0,
      errors: 1,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
