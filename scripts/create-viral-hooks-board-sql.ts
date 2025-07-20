#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';
import { createAdminClient } from '@/lib/supabase';
import { nanoid } from 'nanoid';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function createViralHooksBoardSQL() {
  const client = createAdminClient();
  
  try {
    // Generate a unique board ID and public ID
    const boardId = crypto.randomUUID();
    const publicId = nanoid(10);
    
    // Execute raw SQL to create the board
    const { data, error } = await client.rpc('exec_sql', {
      sql: `
        INSERT INTO boards (id, folder_id, name, description, public_id, is_shared, created_at, updated_at)
        SELECT 
          '${boardId}'::uuid,
          folder_id,
          'Top Viral Hooks',
          'Collection of top performing viral hooks from Instagram',
          '${publicId}',
          false,
          now(),
          now()
        FROM boards
        WHERE name = 'Best of eCommerce'
        LIMIT 1
        RETURNING *;
      `
    });
    
    if (error) {
      // Try direct insert with known folder_id from Best of eCommerce board
      console.log('Trying direct SQL insert...');
      
      const { data: result, error: insertError } = await client
        .from('boards')
        .insert({
          id: boardId,
          folder_id: '9b0e5a7f-8c3d-4e2f-a1b6-3c8d9e7f5a1b', // We'll need to get this from existing board
          name: 'Top Viral Hooks',
          description: 'Collection of top performing viral hooks from Instagram',
          public_id: publicId,
          is_shared: false
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('❌ Failed to create board:', insertError);
        
        // Last resort - just output the board ID to use
        console.log('\n📋 Manual approach:');
        console.log('1. Create a board named "Top Viral Hooks" in the admin dashboard');
        console.log('2. Use this generated board ID in your script:', boardId);
        return;
      }
      
      console.log('✅ Successfully created board via direct insert');
      console.log('   Board ID:', boardId);
      return;
    }
    
    console.log('✅ Successfully created board:');
    console.log('   Name: Top Viral Hooks');
    console.log('   ID:', boardId);
    console.log('   Public ID:', publicId);
    console.log('\n📋 Use this board ID in your bulk scrape script:', boardId);
    
  } catch (error) {
    console.error('❌ Failed to create board:', error);
  }
}

createViralHooksBoardSQL().catch(console.error);