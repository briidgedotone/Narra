#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';
import { createAdminClient } from '@/lib/supabase';
import { nanoid } from 'nanoid';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function createViralHooksBoard() {
  const client = createAdminClient();
  
  try {
    // Get the existing featured board to find the folder
    const { data: existingBoard, error: boardError } = await client
      .from('boards')
      .select('folder_id')
      .eq('id', '877a7dde-74ce-42c8-901b-20db491662b1')
      .single();
    
    if (boardError || !existingBoard) {
      console.error('❌ Existing featured board not found:', boardError);
      console.log('Trying alternative approach...');
      
      // Try to find any board named "Best of eCommerce"
      const { data: anyBoard } = await client
        .from('boards')
        .select('folder_id, name')
        .eq('name', 'Best of eCommerce')
        .limit(1)
        .single();
        
      if (!anyBoard) {
        console.error('❌ Could not find any reference board');
        return;
      }
      
      console.log('✅ Found reference board:', anyBoard.name);
      existingBoard = { folder_id: anyBoard.folder_id };
    }
    
    const folderId = existingBoard.folder_id;
    
    console.log('✅ Found admin folder:', folderId);
    
    // Create the new board
    const publicId = nanoid(10);
    const { data: newBoard, error } = await client
      .from('boards')
      .insert({
        folder_id: folderId,
        name: 'Top Viral Hooks',
        description: 'Collection of top performing viral hooks from Instagram',
        public_id: publicId,
        is_shared: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating board:', error);
      return;
    }
    
    console.log('✅ Successfully created board:');
    console.log('   Name:', newBoard.name);
    console.log('   ID:', newBoard.id);
    console.log('   Public ID:', newBoard.public_id);
    console.log('\n📋 Use this board ID in your bulk scrape script:', newBoard.id);
    
  } catch (error) {
    console.error('❌ Failed to create board:', error);
  }
}

createViralHooksBoard().catch(console.error);