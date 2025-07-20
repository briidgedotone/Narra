#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Copy the BulkScrapeProcessor class
class BulkScrapeProcessor {
  private boardId: string;
  private delay: number;

  constructor(boardId: string, delay: number = 2000) {
    this.boardId = boardId;
    this.delay = delay;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchIndividualPost(url: string): Promise<any> {
    try {
      const { scrapeCreatorsApi } = await import('@/lib/api/scrape-creators');
      
      const response = await scrapeCreatorsApi.instagram.getIndividualPost(url);
      
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to fetch post data',
          cached: response.cached 
        };
      }

      const rawData = response.data as any;
      const postData = rawData?.data?.xdt_shortcode_media;

      if (!postData) {
        return {
          success: false,
          error: 'No post data found in response'
        };
      }

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

  private transformToSavePostData(postResponse: any): any {
    if (!postResponse.success || !postResponse.data?.transformed) {
      return null;
    }

    const post = postResponse.data.transformed;
    
    return {
      handle: `@${post.owner.username}`,
      platform: "instagram",
      displayName: post.owner.fullName,
      bio: "",
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

  private normalizeInstagramId(platformPostId: string, embedUrl: string): string {
    if (!/\d+_\d+/.test(platformPostId) && platformPostId.length < 20) {
      return platformPostId;
    }
    
    const shortcodeMatch = embedUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
    if (shortcodeMatch && shortcodeMatch[1]) {
      return shortcodeMatch[1];
    }
    
    return platformPostId;
  }

  private async savePostToBoard(postData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { db } = await import('@/lib/database');
      const { createAdminClient } = await import('@/lib/supabase');

      const normalizedPlatformPostId = postData.platform === "instagram" 
        ? this.normalizeInstagramId(postData.platformPostId, postData.embedUrl)
        : postData.platformPostId;

      const profile = await db.upsertProfile({
        handle: postData.handle,
        platform: postData.platform,
        display_name: postData.displayName || postData.handle,
        bio: postData.bio || "",
        followers_count: postData.followers || 0,
        avatar_url: postData.avatarUrl || "",
        verified: postData.verified || false,
      });

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

  async processUrls(urls: string[], startIndex: number = 0): Promise<void> {
    console.log(`🚀 Starting bulk scrape of ${urls.length} URLs`)
    console.log(`📋 Board ID: ${this.boardId}`)
    console.log(`⏱️  Delay between requests: ${this.delay}ms\n`)

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]?.trim();
      if (!url) continue;

      const actualIndex = startIndex + i + 1;
      console.log(`\n[${actualIndex}/1013] Processing: ${url}`);

      try {
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

        const saveData = this.transformToSavePostData(postResponse);
        if (!saveData) {
          console.log('  ❌ Failed to transform post data');
          errorCount++;
          continue;
        }

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

      if (i < urls.length - 1) {
        console.log(`  ⏳ Waiting ${this.delay}ms...`);
        await this.sleep(this.delay);
      }
    }

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

// Main
async function main() {
  const START_INDEX = 336; // Start from URL #337 (0-indexed)
  
  console.log('🎯 Continuing Viral Hooks Scraper');
  console.log('================================\n');

  const urlsFilePath = join(process.cwd(), 'collections', 'top-viral-hooks-collection.txt');
  console.log(`📂 Reading URLs from: ${urlsFilePath}`);

  let urls: string[];
  try {
    const fileContent = readFileSync(urlsFilePath, 'utf-8');
    const allUrls = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    urls = allUrls.slice(START_INDEX);
    
    console.log(`📋 Total URLs: 1013`);
    console.log(`✅ Already processed: ${START_INDEX}`);
    console.log(`📋 Remaining to process: ${urls.length}\n`);
  } catch (error) {
    console.error('❌ Failed to read URLs file:', error);
    process.exit(1);
  }

  const boardId = 'd4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a';
  const processor = new BulkScrapeProcessor(boardId, 300); // 300ms delay

  await processor.processUrls(urls, START_INDEX);

  console.log('\n🎉 Bulk scrape completed!');
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});