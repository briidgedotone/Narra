#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Types for our API responses
interface IndividualPostResponse {
  success: boolean;
  data?: {
    transformed: {
      id: string;
      shortcode: string;
      url: string;
      caption: string;
      isVideo: boolean;
      displayUrl: string;
      videoUrl?: string;
      thumbnail: string;
      dimensions?: { width: number; height: number };
      metrics: {
        likes: number;
        comments: number;
        views?: number;
      };
      owner: {
        id: string;
        username: string;
        fullName: string;
        isVerified: boolean;
        profilePicUrl: string;
        followers?: number;
      };
      takenAt: string;
      productType: string;
      videoDuration?: number;
    };
    raw: any;
  };
  error?: string;
  cached?: boolean;
  shortcode?: string;
}

interface SavePostData {
  handle: string;
  platform: "instagram" | "tiktok";
  displayName?: string;
  bio?: string;
  followers?: number;
  avatarUrl?: string;
  verified?: boolean;
  platformPostId: string;
  embedUrl: string;
  caption?: string;
  originalUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  datePosted: string;
  thumbnail?: string;
  isVideo?: boolean;
  isCarousel?: boolean;
  carouselMedia?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
    thumbnail: string;
    isVideo: boolean;
  }>;
  carouselCount?: number;
  videoUrl?: string;
  displayUrl?: string;
  shortcode?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  transcript?: string;
}

class BulkScrapeProcessor {
  private baseUrl: string;
  private boardId: string;
  private delay: number;

  constructor(boardId: string, delay: number = 2000) {
    this.baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    this.boardId = boardId;
    this.delay = delay;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchIndividualPost(url: string): Promise<IndividualPostResponse> {
    try {
      // Use ScrapeCreators API directly to avoid Next.js API issues
      const { scrapeCreatorsApi } = await import('@/lib/api/scrape-creators');
      
      const response = await scrapeCreatorsApi.instagram.getIndividualPost(url);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to fetch post data',
          cached: response.cached 
        };
      }

      // Transform the response to match our expected format
      const rawData = response.data as any;
      const postData = rawData?.data?.xdt_shortcode_media;

      if (!postData) {
        return {
          success: false,
          error: 'No post data found in response'
        };
      }

      // Transform to our internal format
      const transformedPost = {
        id: postData.id,
        shortcode: postData.shortcode,
        url: `https://www.instagram.com/p/${postData.shortcode}/`,
        caption: postData.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        isVideo: postData.is_video,
        displayUrl: postData.display_url,
        videoUrl: postData.video_url,
        thumbnail: postData.thumbnail_src,
        dimensions: postData.dimensions,
        metrics: {
          likes: postData.edge_media_preview_like?.count || 0,
          comments: postData.edge_media_to_parent_comment?.count || 0,
          views: postData.video_view_count,
        },
        owner: {
          id: postData.owner?.id,
          username: postData.owner?.username,
          fullName: postData.owner?.full_name,
          isVerified: postData.owner?.is_verified,
          profilePicUrl: postData.owner?.profile_pic_url,
          followers: postData.owner?.edge_followed_by?.count,
        },
        takenAt: new Date(postData.taken_at_timestamp * 1000).toISOString(),
        productType: postData.product_type,
        videoDuration: postData.video_duration,
      };

      return {
        success: true,
        data: {
          transformed: transformedPost,
          raw: rawData,
        },
        cached: response.cached,
        shortcode: postData.shortcode,
      };

    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private transformToSavePostData(postResponse: IndividualPostResponse): SavePostData | null {
    if (!postResponse.success || !postResponse.data?.transformed) {
      return null;
    }

    const post = postResponse.data.transformed;
    
    return {
      handle: `@${post.owner.username}`,
      platform: "instagram",
      displayName: post.owner.fullName,
      bio: "", // We don't get bio from individual post endpoint
      followers: post.owner.followers,
      avatarUrl: post.owner.profilePicUrl,
      verified: post.owner.isVerified,
      platformPostId: post.shortcode,
      embedUrl: post.url,
      caption: post.caption,
      originalUrl: post.url,
      metrics: {
        ...(post.metrics.views ? { views: post.metrics.views } : {}),
        likes: post.metrics.likes || 0,
        comments: post.metrics.comments || 0,
      },
      datePosted: post.takenAt,
      thumbnail: post.thumbnail,
      isVideo: post.isVideo,
      videoUrl: post.videoUrl,
      displayUrl: post.displayUrl,
      shortcode: post.shortcode,
      dimensions: post.dimensions,
    };
  }

  private async savePostToBoard(postData: SavePostData): Promise<{ success: boolean; error?: string }> {
    try {
      // Import database service and Supabase for direct access
      const { db } = await import('@/lib/database');
      const { createAdminClient } = await import('@/lib/supabase');

      // Normalize platform post ID for Instagram to ensure consistency
      const normalizedPlatformPostId = postData.platform === "instagram" 
        ? this.normalizeInstagramId(postData.platformPostId, postData.embedUrl)
        : postData.platformPostId;

      // Upsert profile (create or update if exists)
      const profile = await db.upsertProfile({
        handle: postData.handle,
        platform: postData.platform,
        display_name: postData.displayName || postData.handle,
        bio: postData.bio || "",
        followers_count: postData.followers || 0,
        avatar_url: postData.avatarUrl || "",
        verified: postData.verified || false,
      });

      // Upsert post (create or update if exists using normalized ID)
      const postCreateData = {
        profile_id: profile.id,
        platform: postData.platform,
        platform_post_id: normalizedPlatformPostId,
        embed_url: postData.embedUrl,
        caption: postData.caption || "",
        ...(postData.transcript ? { transcript: postData.transcript } : {}),
        ...(postData.originalUrl ? { original_url: postData.originalUrl } : {}),
        metrics: postData.metrics || {},
        date_posted: postData.datePosted,
      };

      const post = await db.upsertPost(postCreateData);

      // Check if post is already in the board
      const adminClient = createAdminClient();
      try {
        const { data: existingBoardPost } = await adminClient
          .from("board_posts")
          .select("id")
          .eq("board_id", this.boardId)
          .eq("post_id", post.id)
          .single();
        
        if (existingBoardPost) {
          return {
            success: false,
            error: "Post already exists in this board",
          };
        }
      } catch (error) {
        // No existing post found, which is what we want
      }

      // Add post to board
      await db.addPostToBoard(this.boardId, post.id);

      return {
        success: true,
      };

    } catch (error) {
      console.error('Save post error details:', error);
      return {
        success: false,
        error: `Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private normalizeInstagramId(platformPostId: string, embedUrl: string): string {
    // If it's already a shortcode format (no underscores, reasonable length), use it
    if (!/\d+_\d+/.test(platformPostId) && platformPostId.length < 20) {
      return platformPostId;
    }
    
    // Try to extract shortcode from URL
    const shortcodeMatch = embedUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
    if (shortcodeMatch && shortcodeMatch[1]) {
      return shortcodeMatch[1];
    }
    
    // If all else fails, use the original ID
    return platformPostId;
  }

  async processUrls(urls: string[]): Promise<void> {
    console.log(`🚀 Starting bulk scrape of ${urls.length} URLs`);
    console.log(`📋 Board ID: ${this.boardId}`);
    console.log(`⏱️  Delay between requests: ${this.delay}ms\n`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]?.trim();
      if (!url) continue;

      console.log(`\n[${i + 1}/${urls.length}] Processing: ${url}`);

      try {
        // Step 1: Fetch post data
        console.log('  📥 Fetching post data...');
        const postResponse = await this.fetchIndividualPost(url);

        if (!postResponse.success) {
          console.log(`  ❌ Failed to fetch: ${postResponse.error}`);
          errorCount++;
          continue;
        }

        console.log(`  ✅ Fetched data for @${postResponse.data?.transformed.owner.username}`);
        if (postResponse.cached) {
          console.log('  💾 (Cached)');
        }

        // Step 2: Transform data
        const saveData = this.transformToSavePostData(postResponse);
        if (!saveData) {
          console.log('  ❌ Failed to transform post data');
          errorCount++;
          continue;
        }

        // Step 3: Save to board
        console.log('  💾 Saving to board...');
        const saveResult = await this.savePostToBoard(saveData);

        if (saveResult.success) {
          console.log('  ✅ Successfully saved to board');
          successCount++;
        } else {
          if (saveResult.error?.includes('already exists')) {
            console.log('  ⏭️  Post already exists in board');
            skipCount++;
          } else {
            console.log(`  ❌ Failed to save: ${saveResult.error}`);
            errorCount++;
          }
        }

      } catch (error) {
        console.log(`  💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }

      // Rate limiting delay
      if (i < urls.length - 1) {
        console.log(`  ⏳ Waiting ${this.delay}ms...`);
        await this.sleep(this.delay);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 BULK SCRAPE SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`⏭️  Already existed (skipped): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total URLs: ${urls.length}`);
    console.log(`📈 Success rate: ${((successCount + skipCount) / urls.length * 100).toFixed(1)}%`);
  }
}

// Main execution
async function main() {
  console.log('🎯 Bulk E-commerce Post Scraper');
  console.log('================================\n');

  // Get collection file from command line args or default
  const collectionArg = process.argv[2];
  let urlsFilePath: string;
  
  if (collectionArg === 'viral-hooks') {
    urlsFilePath = join(process.cwd(), 'collections', 'top-viral-hooks-collection.txt');
  } else {
    urlsFilePath = join(process.cwd(), 'collections', 'best-of-ecommerce-collection.txt');
  }
  
  console.log(`📂 Reading URLs from: ${urlsFilePath}`);

  let urls: string[];
  try {
    const fileContent = readFileSync(urlsFilePath, 'utf-8');
    const allUrls = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    // Process all URLs
    urls = allUrls;
    console.log(`📋 Processing all ${urls.length} URLs`);
  } catch (error) {
    console.error('❌ Failed to read URLs file:', error);
    process.exit(1);
  }

  console.log(`📋 URLs to process in this test run: ${urls.length}\n`);

  // Board IDs
  // Best of eCommerce: 877a7dde-74ce-42c8-901b-20db491662b1
  // Top Viral Hooks: d4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a
  
  // Determine which board to use based on the file
  let boardId = '877a7dde-74ce-42c8-901b-20db491662b1'; // Default to eCommerce
  
  if (urlsFilePath.includes('viral-hooks')) {
    boardId = 'd4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a';
    console.log('📌 Using Top Viral Hooks board');
  } else {
    console.log('📌 Using Best of eCommerce board');
  }

  // Initialize processor with 500ms delay between requests (faster)
  const processor = new BulkScrapeProcessor(boardId, 500);

  // Process all URLs
  await processor.processUrls(urls);

  console.log('\n🎉 Bulk scrape completed!');
}

// Export for reuse
export { BulkScrapeProcessor };

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}