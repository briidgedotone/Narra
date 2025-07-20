#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Simple test to see if our individual post API works
async function testIndividualPostAPI() {
  console.log('🧪 Testing Individual Post API');
  
  const testUrl = 'https://www.instagram.com/reel/DFLw3SmSNti/';
  const baseUrl = 'http://localhost:3000';
  
  try {
    const response = await fetch(
      `${baseUrl}/api/individual-post?url=${encodeURIComponent(testUrl)}`
    );
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ API test successful!');
      console.log(`📊 Post by @${result.data.transformed.owner.username}`);
      console.log(`💡 Caption: ${result.data.transformed.caption.substring(0, 100)}...`);
      console.log(`❤️  Likes: ${result.data.transformed.metrics.likes}`);
      return result.data.transformed;
    } else {
      console.log('❌ API test failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('💥 API test error:', error);
    return null;
  }
}

// Test saving a post to the board (without full implementation)
async function testSaveToBoard() {
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
  console.log('🎯 Testing Bulk Scrape Components\n');
  
  // Test 1: Individual Post API
  const postData = await testIndividualPostAPI();
  if (!postData) {
    console.log('❌ Cannot proceed without working API');
    return;
  }
  
  // Test 2: Database and Board Access
  const boardId = await testSaveToBoard();
  if (!boardId) {
    console.log('❌ Cannot proceed without board access');
    return;
  }
  
  console.log('\n✅ All tests passed! Ready for bulk scraping.');
  console.log(`🎯 Target Board ID: ${boardId}`);
  console.log('🚀 You can now run: npm run bulk-scrape-ecommerce');
}

main().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});