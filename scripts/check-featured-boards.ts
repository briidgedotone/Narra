#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';
import { db } from '@/lib/database';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function checkFeaturedBoards() {
  try {
    console.log('🔍 Checking featured boards status...\n');
    
    // Get all featured boards
    const featuredBoards = await db.getFeaturedBoards();
    console.log('📋 Featured boards found:', featuredBoards.length);
    
    if (featuredBoards.length > 0) {
      console.log('\n✅ Current featured boards:');
      featuredBoards.forEach((board, index) => {
        console.log(`${index + 1}. Display Order: ${board.display_order}`);
        console.log(`   Board ID: ${board.board_id}`);
        console.log(`   Board Name: ${board.boards?.name || 'Unknown'}`);
        console.log(`   Folder: ${board.boards?.folders?.name || 'Unknown'}`);
        console.log(`   Cover Image: ${board.cover_image_url ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No featured boards found!');
    }
    
    // Let's also try to get some boards to see what exists
    console.log('\n🔍 Checking for boards that might need to be featured...');
    
    // Since we can't query all boards directly, let's try to check if specific board IDs exist
    const knownBoardIds = [
      'f5e6d7c8-9a0b-1c2d-3e4f-5a6b7c8d9e0f', // Best of Creators
      'a1b2c3d4-e5f6-7890-abcd-1234567890ef', // Best of SaaS Apps
      '877a7dde-74ce-42c8-901b-20db491662b1'  // Best of eCommerce (from viral hooks script)
    ];
    
    const boardNames = [
      'Best of Creators',
      'Best of SaaS Apps', 
      'Best of eCommerce'
    ];
    
    for (let i = 0; i < knownBoardIds.length; i++) {
      try {
        const board = await db.getBoardById(knownBoardIds[i]!);
        console.log(`✅ Found board: "${board.name}" (ID: ${board.id})`);
        
        // Check if this board is already featured
        const isAlreadyFeatured = featuredBoards.some(fb => fb.board_id === board.id);
        console.log(`   Featured status: ${isAlreadyFeatured ? 'YES' : 'NO'}`);
        
        if (!isAlreadyFeatured) {
          console.log(`   ⚠️  This board should probably be featured!`);
        }
        console.log('');
      } catch (error) {
        console.log(`❌ Board "${boardNames[i]}" (${knownBoardIds[i]}) not found or not accessible`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking featured boards:', error);
  }
}

checkFeaturedBoards().catch(console.error);