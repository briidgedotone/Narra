#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';
import { db } from '@/lib/database';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function setupFeaturedBoards() {
  try {
    console.log('🎯 Setting up featured boards...\n');
    
    // Board configurations based on the scripts and names mentioned
    const boardsToFeature = [
      {
        id: '877a7dde-74ce-42c8-901b-20db491662b1', // Best of eCommerce
        name: 'Best of eCommerce',
        displayOrder: 1,
        coverImageUrl: 'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Best+of+eCommerce'
      },
      {
        id: 'f5e6d7c8-9a0b-1c2d-3e4f-5a6b7c8d9e0f', // Best of Creators (from bulk-scrape-creators.ts)
        name: 'Best of Creators', 
        displayOrder: 2,
        coverImageUrl: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Best+of+Creators'
      },
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef', // Best of SaaS Apps (from bulk-scrape-saas.ts)
        name: 'Best of SaaS Apps',
        displayOrder: 3, 
        coverImageUrl: 'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Best+of+SaaS+Apps'
      }
    ];
    
    // We need to check if there's a "Top Viral Hooks" board created by the viral hooks script
    // Since that script creates a random UUID, we'll have to skip it for now or create one
    
    console.log('📋 Attempting to set featured boards...\n');
    
    for (const board of boardsToFeature) {
      try {
        console.log(`🔄 Processing: ${board.name} (${board.id})`);
        
        // First check if the board exists by trying to get it
        const existingBoard = await db.getBoardById(board.id);
        console.log(`   ✅ Board exists: "${existingBoard.name}"`);
        
        // Create featured board entry
        const featuredBoardData = {
          board_id: board.id,
          display_order: board.displayOrder,
          cover_image_url: board.coverImageUrl,
          // Note: custom_title and custom_description are commented out in the database.ts
          // due to schema cache issues mentioned in the code
        };
        
        // Delete any existing featured board at this position first
        await db.deleteFeaturedBoard(board.displayOrder);
        console.log(`   🗑️  Cleared position ${board.displayOrder}`);
        
        // Create the new featured board entry
        const result = await db.createFeaturedBoard(featuredBoardData);
        console.log(`   ✅ Set as featured at position ${board.displayOrder}`);
        console.log('');
        
      } catch (error: any) {
        console.log(`   ❌ Failed to set "${board.name}" as featured:`);
        console.log(`      Error: ${error.message || error}`);
        console.log('');
      }
    }
    
    // Check the final status
    console.log('🔍 Final featured boards status:');
    const featuredBoards = await db.getFeaturedBoards();
    
    if (featuredBoards.length > 0) {
      featuredBoards.forEach((board, index) => {
        console.log(`${index + 1}. ${board.boards?.name || 'Unknown'} (Order: ${board.display_order})`);
      });
    } else {
      console.log('❌ No featured boards found!');
    }
    
  } catch (error) {
    console.error('❌ Error setting up featured boards:', error);
  }
}

setupFeaturedBoards().catch(console.error);