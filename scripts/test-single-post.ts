#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testSinglePost() {
  console.log('🧪 Testing Single Post Save');
  
  const testUrl = 'https://www.instagram.com/reel/DFLw3SmSNti/';
  const boardId = '877a7dde-74ce-42c8-901b-20db491662b1';
  
  try {
    // Fetch post data
    console.log('📥 Fetching post data...');
    const { scrapeCreatorsApi } = await import('@/lib/api/scrape-creators');
    const response = await scrapeCreatorsApi.instagram.getIndividualPost(testUrl);
    
    if (!response.success) {
      console.error('❌ Failed to fetch post:', response.error);
      return;
    }
    
    const rawData = response.data as any;
    const postData = rawData?.data?.xdt_shortcode_media;
    console.log(`✅ Fetched data for @${postData.owner?.username}`);
    
    // Transform data
    const saveData = {
      handle: `@${postData.owner.username}`,
      platform: "instagram" as const,
      displayName: postData.owner.full_name,
      bio: "",
      followers: postData.owner.edge_followed_by?.count,
      avatarUrl: postData.owner.profile_pic_url,
      verified: postData.owner.is_verified,
      platformPostId: postData.shortcode,
      embedUrl: `https://www.instagram.com/p/${postData.shortcode}/`,
      caption: postData.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      originalUrl: `https://www.instagram.com/p/${postData.shortcode}/`,
      metrics: {
        ...(postData.video_view_count ? { views: postData.video_view_count } : {}),
        likes: postData.edge_media_preview_like?.count || 0,
        comments: postData.edge_media_to_parent_comment?.count || 0,
      },
      datePosted: new Date(postData.taken_at_timestamp * 1000).toISOString(),
      thumbnail: postData.thumbnail_src,
      isVideo: postData.is_video,
      videoUrl: postData.video_url,
      displayUrl: postData.display_url,
      shortcode: postData.shortcode,
      dimensions: postData.dimensions,
    };
    
    console.log('🔄 Transformed data:', {
      handle: saveData.handle,
      platform: saveData.platform,
      postId: saveData.platformPostId,
      caption: saveData.caption?.substring(0, 50) + '...'
    });
    
    // Save to database
    console.log('💾 Saving to database...');
    const { db } = await import('@/lib/database');
    const { createAdminClient } = await import('@/lib/supabase');
    
    // Normalize platform post ID for Instagram
    const normalizedPlatformPostId = saveData.platformPostId;
    
    console.log('👤 Upserting profile...');
    const profile = await db.upsertProfile({
      handle: saveData.handle,
      platform: saveData.platform,
      display_name: saveData.displayName || saveData.handle,
      bio: saveData.bio || "",
      followers_count: saveData.followers || 0,
      avatar_url: saveData.avatarUrl || "",
      verified: saveData.verified || false,
    });
    console.log(`✅ Profile created/updated: ${profile.id}`);
    
    console.log('📝 Upserting post...');
    const postCreateData = {
      profile_id: profile.id,
      platform: saveData.platform,
      platform_post_id: normalizedPlatformPostId,
      embed_url: saveData.embedUrl,
      caption: saveData.caption || "",
      ...(saveData.originalUrl ? { original_url: saveData.originalUrl } : {}),
      metrics: saveData.metrics || {},
      date_posted: saveData.datePosted,
    };
    
    const post = await db.upsertPost(postCreateData);
    console.log(`✅ Post created/updated: ${post.id}`);
    
    console.log('🔍 Checking if post already in board...');
    const adminClient = createAdminClient();
    try {
      const { data: existingBoardPost } = await adminClient
        .from("board_posts")
        .select("id")
        .eq("board_id", boardId)
        .eq("post_id", post.id)
        .single();
      
      if (existingBoardPost) {
        console.log('⏭️ Post already exists in board');
        return;
      }
    } catch (error) {
      console.log('✅ Post not in board yet, proceeding to add');
    }
    
    console.log('➕ Adding post to board...');
    await db.addPostToBoard(boardId, post.id);
    console.log('✅ Post added to board successfully!');
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testSinglePost().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});