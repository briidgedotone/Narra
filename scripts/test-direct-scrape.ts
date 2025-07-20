#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testDirectScrape() {
  console.log('🧪 Testing Direct ScrapeCreators API');
  
  const testUrl = 'https://www.instagram.com/reel/DFLw3SmSNti/';
  
  try {
    // Import our API client directly
    const { scrapeCreatorsApi } = await import('@/lib/api/scrape-creators');
    
    console.log('📥 Calling ScrapeCreators API directly...');
    const response = await scrapeCreatorsApi.instagram.getIndividualPost(testUrl);
    
    if (response.success) {
      console.log('✅ Direct API call successful!');
      const rawData = response.data as any;
      const postData = rawData?.data?.xdt_shortcode_media;
      
      if (postData) {
        console.log(`📊 Post by @${postData.owner?.username}`);
        console.log(`💡 Caption: ${postData.edge_media_to_caption?.edges?.[0]?.node?.text?.substring(0, 100) || 'No caption'}...`);
        console.log(`❤️  Likes: ${postData.edge_media_preview_like?.count || 0}`);
        console.log(`💬 Comments: ${postData.edge_media_to_parent_comment?.count || 0}`);
        console.log(`🎬 Is Video: ${postData.is_video || false}`);
        return true;
      } else {
        console.log('❌ No post data found in response');
        console.log('Raw response:', JSON.stringify(rawData, null, 2).substring(0, 500));
        return false;
      }
    } else {
      console.log('❌ Direct API call failed:', response.error);
      return false;
    }
  } catch (error) {
    console.log('💥 Direct API error:', error);
    return false;
  }
}

async function testDatabase() {
  console.log('\n🧪 Testing Database Connection');
  
  try {
    const { db } = await import('@/lib/database');
    console.log('✅ Database connection successful!');
    
    // Try to get the featured board to confirm it exists
    const featuredBoards = await db.getFeaturedBoards();
    console.log(`📋 Found ${featuredBoards.length} featured boards`);
    
    const ecommerceBoard = featuredBoards.find(fb => 
      fb.boards?.name?.toLowerCase().includes('ecommerce') ||
      fb.title?.toLowerCase().includes('ecommerce')
    );
    
    if (ecommerceBoard) {
      console.log(`✅ Found eCommerce board: ${ecommerceBoard.boards?.name || ecommerceBoard.title}`);
      console.log(`📋 Board ID: ${ecommerceBoard.board_id}`);
      return ecommerceBoard.board_id;
    } else {
      console.log('❌ Could not find eCommerce featured board');
      console.log('Available boards:', featuredBoards.map(fb => ({
        name: fb.boards?.name || fb.title,
        id: fb.board_id
      })));
      return null;
    }
  } catch (error) {
    console.log('💥 Database test error:', error);
    return null;
  }
}

async function main() {
  console.log('🎯 Testing Direct Components\n');
  
  // Test 1: Direct API Access
  const apiWorking = await testDirectScrape();
  if (!apiWorking) {
    console.log('❌ Cannot proceed without working ScrapeCreators API');
    return;
  }
  
  // Test 2: Database and Board Access
  const boardId = await testDatabase();
  if (!boardId) {
    console.log('❌ Cannot proceed without board access');
    return;
  }
  
  console.log('\n✅ All direct tests passed!');
  console.log(`🎯 Target Board ID: ${boardId}`);
  console.log('🚀 Ready to proceed with direct approach');
}

main().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});