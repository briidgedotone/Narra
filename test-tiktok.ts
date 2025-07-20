#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testTikTokAPI() {
  console.log('🧪 Testing TikTok API Integration\n');

  const testUrls = [
    'https://www.tiktok.com/@getpandaextract/video/7497181889485098247',
    'https://www.tiktok.com/@oasis.app/video/7344458023001230622',
    'https://www.tiktok.com/@samsulekdailyrank/video/7457938066519493893'
  ];

  try {
    const { scrapeCreatorsApi, transformers } = await import('./src/lib/api/scrape-creators');

    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      console.log(`\n[${i + 1}/3] Testing: ${url}`);
      console.log('  📥 Fetching video data...');

      try {
        const response = await scrapeCreatorsApi.tiktok.getIndividualVideo(url);
        
        if (!response.success) {
          console.log(`  ❌ API Error: ${response.error}`);
          continue;
        }

        console.log(`  ✅ API Response successful`);
        if (response.cached) {
          console.log('  💾 (Cached)');
        }

        console.log('  🔄 Transforming data...');
        const transformedData = transformers.tiktok.videoToAppFormat(response.data);
        
        if (!transformedData) {
          console.log('  ❌ Transformation failed');
          continue;
        }

        console.log('  ✅ Transformation successful');
        console.log(`  👤 Author: ${transformedData.handle} (${transformedData.displayName})`);
        console.log(`  📝 Caption: ${transformedData.caption.substring(0, 80)}...`);
        console.log(`  📊 Metrics: ${transformedData.metrics.likes} likes, ${transformedData.metrics.views} views`);
        console.log(`  🎬 Duration: ${transformedData.duration}ms`);
        console.log(`  ✅ Platform: ${transformedData.platform}`);

      } catch (error) {
        console.log(`  💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (i < testUrls.length - 1) {
        console.log('  ⏳ Waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }

  console.log('\n🎉 TikTok API test completed!');
}

testTikTokAPI();