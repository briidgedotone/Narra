import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com";
const API_KEY = process.env.SCRAPECREATORS_API_KEY || "olBiCnLPEQhNMwlCOctdQig3QDr1";

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Best of SaaS Apps board ID
const BEST_OF_SAAS_BOARD_ID = "6e13993c-f0cc-4fc4-8c51-c42c7a1f12e8";

interface Post {
  id: string;
  embed_url: string;
  platform: string;
  transcript: string | null;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTranscriptText(rawTranscript: string): string {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return '';
  }
  
  // Clean WebVTT format (TikTok) by removing:
  // 1. WEBVTT headers
  // 2. WebVTT timestamps (00:00:02.700 --> 00:00:05.400)
  // 3. Sequence numbers and extra whitespace
  
  const lines = rawTranscript.split('\n');
  const textLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine.length === 0) {
      continue;
    }
    
    // Skip WEBVTT header
    if (trimmedLine === 'WEBVTT') {
      continue;
    }
    
    // Skip sequence numbers (lines that are just numbers)
    if (/^\d+$/.test(trimmedLine)) {
      continue;
    }
    
    // Skip WebVTT timestamp lines (format: 00:00:02.700 --> 00:00:05.400)
    if (/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}$/.test(trimmedLine)) {
      continue;
    }
    
    // Skip SRT timestamp lines (fallback: 00:00:00,000 --> 00:00:03,281)
    if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(trimmedLine)) {
      continue;
    }
    
    // This is actual transcript text
    textLines.push(trimmedLine);
  }
  
  // Join all text lines with spaces and clean up
  return textLines.join(' ').replace(/\s+/g, ' ').trim();
}

async function getTikTokTranscript(postUrl: string): Promise<string | null> {
  try {
    const apiEndpoint = `/v1/tiktok/video/transcript?url=${encodeURIComponent(postUrl)}&language=en`;
    
    console.log(`📡 Calling: ${SCRAPECREATORS_BASE_URL}${apiEndpoint}`);
    
    const response = await fetch(`${SCRAPECREATORS_BASE_URL}${apiEndpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // TikTok response format: { transcript: "text..." }
    if (data.success !== false && data.transcript) {
      const rawTranscript = data.transcript || "";
      const cleanedTranscript = cleanTranscriptText(rawTranscript);
      return cleanedTranscript;
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Error calling transcript API:`, error);
    return null;
  }
}

async function updatePostTranscript(postId: string, transcript: string | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ transcript })
      .eq('id', postId);
    
    if (error) {
      console.log(`❌ Database update error:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Database error:`, error);
    return false;
  }
}

async function main() {
  const IS_TEST_RUN = false; // Set to false for full collection
  const TEST_LIMIT = 5;
  
  console.log(`🚀 Starting transcript backfill for Best of SaaS Apps collection...`);
  console.log(`📋 Mode: ${IS_TEST_RUN ? `TEST (first ${TEST_LIMIT} posts)` : 'FULL COLLECTION'}\n`);
  
  // Get posts from Best of SaaS Apps board
  console.log('📊 Fetching posts from Best of SaaS Apps board...');
  
  const { data: posts, error: fetchError } = await supabase
    .from('board_posts')
    .select(`
      posts (
        id,
        embed_url,
        platform,
        transcript
      )
    `)
    .eq('board_id', BEST_OF_SAAS_BOARD_ID)
    .limit(IS_TEST_RUN ? TEST_LIMIT : 1000);
  
  if (fetchError) {
    console.error('❌ Error fetching posts:', fetchError);
    return;
  }
  
  if (!posts || posts.length === 0) {
    console.log('❌ No posts found in Best of SaaS Apps board');
    return;
  }
  
  const postData: Post[] = posts.map((bp: any) => bp.posts).filter(Boolean);
  
  console.log(`✅ Found ${postData.length} posts to process`);
  console.log(`⏱️ Estimated runtime: ~${Math.ceil(postData.length * 3 / 60)} minutes\n`);
  
  let successCount = 0;
  let failureCount = 0;
  let alreadyHasTranscript = 0;
  let skippedNonTikTok = 0;
  
  // Process each post
  for (let i = 0; i < postData.length; i++) {
    const post = postData[i];
    const progress = `${i + 1}/${postData.length}`;
    const percentage = ((i + 1) / postData.length * 100).toFixed(1);
    
    console.log(`\n🔍 Processing post ${progress} (${percentage}%)`);
    console.log(`📌 Post ID: ${post.id}`);
    console.log(`🔗 URL: ${post.embed_url}`);
    console.log(`📱 Platform: ${post.platform}`);
    
    // Check if post already has transcript
    if (post.transcript && post.transcript.trim().length > 0) {
      console.log(`ℹ️ Post already has transcript (${post.transcript.length} chars), skipping...`);
      alreadyHasTranscript++;
      continue;
    }
    
    // Only process TikTok posts
    if (post.platform !== 'tiktok') {
      console.log(`⚠️ Skipping non-TikTok post`);
      skippedNonTikTok++;
      continue;
    }
    
    // Get transcript
    const transcript = await getTikTokTranscript(post.embed_url);
    
    if (transcript && transcript.trim().length > 0) {
      console.log(`✅ Transcript found (${transcript.length} chars)`);
      console.log(`📝 Sample: "${transcript.substring(0, 100)}..."`);
      
      // Update database
      const updateSuccess = await updatePostTranscript(post.id, transcript);
      
      if (updateSuccess) {
        console.log(`💾 Database updated successfully`);
        successCount++;
      } else {
        console.log(`❌ Failed to update database`);
        failureCount++;
      }
    } else {
      console.log(`❌ No transcript available for this post`);
      failureCount++;
    }
    
    // Add delay between requests to avoid rate limiting
    if (i < postData.length - 1) {
      console.log('⏳ Waiting 2 seconds before next request...');
      await sleep(2000);
    }
    
    // Print progress update every 10 posts for smaller collection
    if (!IS_TEST_RUN && (i + 1) % 10 === 0) {
      console.log(`\n📈 PROGRESS UPDATE:`);
      console.log(`   Posts processed: ${i + 1}/${postData.length} (${percentage}%)`);
      console.log(`   ✅ New transcripts added: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log(`   ℹ️ Already had transcripts: ${alreadyHasTranscript}`);
      console.log(`   ⚠️ Skipped non-TikTok: ${skippedNonTikTok}`);
    }
  }
  
  // Summary
  console.log(`\n🎉 Best of SaaS Apps ${IS_TEST_RUN ? 'TEST' : 'backfill'} completed!\n`);
  console.log('📊 FINAL SUMMARY:');
  console.log(`   Total posts processed: ${postData.length}`);
  console.log(`   ✅ Successfully added transcripts: ${successCount}`);
  console.log(`   ❌ Failed to get transcripts: ${failureCount}`);
  console.log(`   ℹ️ Already had transcripts: ${alreadyHasTranscript}`);
  console.log(`   ⚠️ Skipped non-TikTok posts: ${skippedNonTikTok}`);
  console.log(`   📈 Success rate: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);
  console.log(`   📊 Total transcript coverage: ${((successCount + alreadyHasTranscript) / postData.length * 100).toFixed(1)}%`);
}

// Run the script
main().catch(console.error);