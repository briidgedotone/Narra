const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com";
const API_KEY = "olBiCnLPEQhNMwlCOctdQig3QDr1";

// Test URLs
const tiktokUrl = "https://www.tiktok.com/@oasis.app/video/7398674160718794030";
const instagramUrl = "https://www.instagram.com/reel/C_lO7KyuDj1/";

async function testTranscriptAPI(url, platform) {
  console.log(`\n🔍 Testing ${platform} transcript API for: ${url}`);
  
  let apiEndpoint;
  if (platform === 'tiktok') {
    apiEndpoint = `/v1/tiktok/video/transcript?url=${encodeURIComponent(url)}&language=en`;
  } else {
    apiEndpoint = `/v2/instagram/media/transcript?url=${encodeURIComponent(url)}`;
  }
  
  try {
    console.log(`📡 Calling: ${SCRAPECREATORS_BASE_URL}${apiEndpoint}`);
    
    const response = await fetch(`${SCRAPECREATORS_BASE_URL}${apiEndpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText.substring(0, 500)}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Success! Raw API Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    // Extract transcript using FIXED logic
    let transcriptText = "";
    if (platform === 'tiktok') {
      transcriptText = data?.transcript || "";
    } else {
      // FIXED: Use 'transcript' field instead of 'text'
      const transcripts = data?.transcripts;
      if (transcripts && transcripts.length > 0) {
        transcriptText = transcripts[0].transcript || "";
      }
    }
    
    console.log(`\n📝 Extracted Transcript Text (FIXED LOGIC):`);
    console.log(`"${transcriptText}"`);
    console.log(`\n📏 Transcript Length: ${transcriptText.length} characters`);
    
    // Show clean transcript (removing timestamps for readability)
    if (transcriptText.length > 0) {
      console.log(`\n🔤 Clean Text (timestamps removed):`);
      let cleanText;
      if (platform === 'tiktok') {
        // Remove WEBVTT and timestamp lines
        cleanText = transcriptText
          .replace(/WEBVTT\n\n/g, '')
          .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\n/g, '')
          .replace(/\n\n/g, ' ')
          .trim();
      } else {
        // Remove SRT-style timestamps
        cleanText = transcriptText
          .replace(/\d+\n/g, '')
          .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g, '')
          .replace(/\n\n/g, ' ')
          .trim();
      }
      console.log(`"${cleanText}"`);
    }
    
  } catch (error) {
    console.log(`❌ Error calling API:`, error.message);
  }
}

async function main() {
  console.log('🚀 Testing FIXED Transcript APIs...\n');
  
  // Test TikTok
  await testTranscriptAPI(tiktokUrl, 'tiktok');
  
  // Add delay between requests
  console.log('\n⏳ Waiting 2 seconds between requests...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Instagram
  await testTranscriptAPI(instagramUrl, 'instagram');
  
  console.log('\n🎉 Testing complete!');
}

main().catch(console.error);