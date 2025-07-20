#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { createAdminClient } from '@/lib/supabase';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function getProcessedCount(): Promise<number> {
  const client = createAdminClient();
  const { count } = await client
    .from('board_posts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', 'd4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a');
  
  return count || 0;
}

async function main() {
  const urlsFilePath = join(process.cwd(), 'collections', 'top-viral-hooks-collection.txt');
  
  // Get total URLs
  const fileContent = readFileSync(urlsFilePath, 'utf-8');
  const totalUrls = fileContent.split('\n').filter(line => line.trim().length > 0).length;
  
  // Get current progress
  const processedCount = await getProcessedCount();
  
  console.log('📊 Viral Hooks Collection Status');
  console.log('================================');
  console.log(`📋 Total URLs in collection: ${totalUrls}`);
  console.log(`✅ Posts successfully saved: ${processedCount}`);
  console.log(`📈 Progress: ${(processedCount / totalUrls * 100).toFixed(1)}%`);
  console.log(`⏳ Remaining: ${totalUrls - processedCount}`);
  
  if (processedCount >= totalUrls) {
    console.log('\n🎉 All posts have been processed!');
    return;
  }
  
  console.log('\n💡 To continue processing, run:');
  console.log(`   npx tsx scripts/continue-viral-hooks.ts`);
  console.log('\n   The script will automatically resume from where it left off.');
  console.log('   Note: Some URLs may be skipped due to 404 errors or duplicates.');
}

main().catch(console.error);