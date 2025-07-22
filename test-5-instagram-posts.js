const SCRAPECREATORS_BASE_URL = "https://api.scrapecreators.com";
const API_KEY = "olBiCnLPEQhNMwlCOctdQig3QDr1";

// Test URLs from best-of-creators-collection
const instagramUrls = [
  "https://www.instagram.com/reel/DIfR8HKN1S-/",
  "https://www.instagram.com/reel/DDM3Ca6pLGX/",
  "https://www.instagram.com/reel/DDKX5y3Jqts/",
  "https://www.instagram.com/reel/DGtz7JJS7YK/",
  "https://www.instagram.com/reel/DE3nH-wzAhH/"
];

async function testInstagramTranscript(url, index) {
  console.log(`\n🔍 Testing Instagram Post ${index + 1}: ${url}`);
  
  const apiEndpoint = `/v2/instagram/media/transcript?url=${encodeURIComponent(url)}`;
  
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
      console.log(`Error details: ${errorText.substring(0, 200)}...`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Raw API Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    // Extract transcript using fixed logic
    let transcriptText = "";
    const transcripts = data?.transcripts;
    if (transcripts && transcripts.length > 0) {
      transcriptText = transcripts[0].transcript || "";
    }
    
    console.log(`\n📝 Extracted Transcript:`);
    console.log(`"${transcriptText}"`);
    console.log(`📏 Length: ${transcriptText.length} characters`);
    
    // Show clean text (remove timestamps)
    if (transcriptText.length > 0) {
      const cleanText = transcriptText
        .replace(/\d+\n/g, '')
        .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g, '')
        .replace(/\n\n/g, ' ')
        .replace(/\n/g, ' ')
        .trim();
      console.log(`🔤 Clean Text: "${cleanText}"`);
    } else {
      console.log(`ℹ️ No transcript available for this post`);
    }
    
  } catch (error) {
    console.log(`❌ Error calling API:`, error.message);
  }
}

async function main() {
  console.log('🚀 Testing Instagram Transcripts for 5 Posts...\n');
  
  for (let i = 0; i < instagramUrls.length; i++) {
    await testInstagramTranscript(instagramUrls[i], i);
    
    // Add delay between requests to avoid rate limiting
    if (i < instagramUrls.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 All tests complete!');
}

main().catch(console.error);