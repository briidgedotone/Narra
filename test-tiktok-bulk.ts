#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Import the BulkScrapeProcessor from our script
import('./scripts/bulk-scrape-tiktok-saas').then(async (module) => {
  console.log('🧪 Testing TikTok Bulk Scrape with 3 URLs\n');

  const testUrls = [
    'https://www.tiktok.com/@getpandaextract/video/7497181889485098247',
    'https://www.tiktok.com/@oasis.app/video/7344458023001230622',
    'https://www.tiktok.com/@samsulekdailyrank/video/7457938066519493893'
  ];

  console.log('📋 Test URLs:');
  testUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
  console.log();

  // Note: This test will use a test board ID, not the real SaaS Apps board
  const testBoardId = 'a1b2c3d4-e5f6-7890-abcd-1234567890ef'; // Same as SaaS Apps for testing
  
  console.log(`📌 Target board: ${testBoardId}`);
  console.log('⚠️  This is a test run with limited URLs\n');

  try {
    // Create processor instance
    const { BulkScrapeProcessor } = module as any;
    
    if (!BulkScrapeProcessor) {
      throw new Error('BulkScrapeProcessor class not found in module');
    }

    const processor = new BulkScrapeProcessor(testBoardId, 500); // 500ms delay for testing
    await processor.processUrls(testUrls);

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}).catch(error => {
  console.error('💥 Failed to load bulk scrape module:', error);
});