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
  console.log('🎯 Bulk Scraper - Resume Mode');
  console.log('================================\n');

  // Get arguments
  const startIndex = parseInt(process.argv[2] || "0") || 0;
  const collectionType = process.argv[3] || 'viral-hooks';
  
  // Determine file path
  let urlsFilePath: string;
  let boardId: string;
  
  if (collectionType === 'viral-hooks') {
    urlsFilePath = join(process.cwd(), 'collections', 'top-viral-hooks-collection.txt');
    boardId = 'd4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a';
    console.log('📌 Using Top Viral Hooks board');
  } else {
    urlsFilePath = join(process.cwd(), 'collections', 'best-of-ecommerce-collection.txt');
    boardId = '877a7dde-74ce-42c8-901b-20db491662b1';
    console.log('📌 Using Best of eCommerce board');
  }

  console.log(`📂 Reading URLs from: ${urlsFilePath}`);
  console.log(`▶️  Starting from index: ${startIndex}`);

  let urls: string[];
  try {
    const fileContent = readFileSync(urlsFilePath, 'utf-8');
    const allUrls = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    // Skip already processed URLs
    urls = allUrls.slice(startIndex);
    
    console.log(`📋 Total URLs in file: ${allUrls.length}`);
    console.log(`📋 URLs to process: ${urls.length}`);
    console.log(`📋 Already processed: ${startIndex}`);
  } catch (error) {
    console.error('❌ Failed to read URLs file:', error);
    process.exit(1);
  }

  console.log(`\n🚀 Resuming from URL #${startIndex + 1}\n`);

  // Initialize processor with 300ms delay (even faster but still safe)
  const processor = new BulkScrapeProcessor(boardId, 300);

  // Process remaining URLs
  await processor.processUrls(urls);

  console.log('\n🎉 Bulk scrape completed!');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}