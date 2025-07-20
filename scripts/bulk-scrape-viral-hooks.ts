#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Import the BulkScrapeProcessor class
import { BulkScrapeProcessor } from './bulk-scrape-ecommerce';

// Main execution
async function main() {
  console.log('🎯 Bulk Viral Hooks Scraper');
  console.log('================================\n');

  // Read URLs from file
  const urlsFilePath = join(process.cwd(), 'collections', 'top-viral-hooks-collection.txt');
  console.log(`📂 Reading URLs from: ${urlsFilePath}`);

  let urls: string[];
  try {
    const fileContent = readFileSync(urlsFilePath, 'utf-8');
    urls = fileContent.split('\n').filter(line => line.trim().length > 0);
    console.log(`📋 Processing all ${urls.length} URLs`);
  } catch (error) {
    console.error('❌ Failed to read URLs file:', error);
    process.exit(1);
  }

  console.log(`📋 URLs to process: ${urls.length}\n`);

  // Generate a new board ID for Top Viral Hooks
  const boardId = crypto.randomUUID();
  
  console.log('📝 IMPORTANT: Create a new board in the admin dashboard with:');
  console.log('   Name: Top Viral Hooks');
  console.log('   Description: Collection of top performing viral hooks from Instagram');
  console.log(`   Then use this board ID: ${boardId}`);
  console.log('\n❓ Or provide an existing board ID below:\n');

  // For now, use a placeholder - replace with actual board ID after creating in admin
  const VIRAL_HOOKS_BOARD_ID = 'REPLACE_WITH_ACTUAL_BOARD_ID';
  
  if (VIRAL_HOOKS_BOARD_ID === 'REPLACE_WITH_ACTUAL_BOARD_ID') {
    console.error('❌ Please create the board first and update VIRAL_HOOKS_BOARD_ID');
    process.exit(1);
  }

  // Initialize processor with 500ms delay between requests
  const processor = new BulkScrapeProcessor(VIRAL_HOOKS_BOARD_ID, 500);

  // Process all URLs
  await processor.processUrls(urls);

  console.log('\n🎉 Bulk scrape completed!');
}

// Export the processor so we can reuse it
export { BulkScrapeProcessor };

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}