// Test Instagram API specifically
async function testInstagramAPI() {
  console.log('🧪 Testing Instagram API for recent profiles...\n');

  const profiles = ['lambo.drive', 'karmathelekhak'];
  
  for (const handle of profiles) {
    console.log(`\n📱 Testing @${handle}:`);
    
    try {
      // Test profile fetch
      console.log('  1️⃣ Fetching profile...');
      const profileResponse = await fetch(`https://api.scrapecreators.com/v1/instagram/profile?handle=${handle}`, {
        headers: {
          'x-api-key': 'olBiCnLPEQhNMwlCOctdQig3QDr1',
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('  ✅ Profile fetch successful');
        console.log(`  📊 User found: ${profileData?.data?.user?.username || 'unknown'}`);
      } else {
        console.log(`  ❌ Profile fetch failed: ${profileResponse.status}`);
        continue;
      }
      
      // Test posts fetch
      console.log('  2️⃣ Fetching posts...');
      const postsResponse = await fetch(`https://api.scrapecreators.com/v2/instagram/user/posts?handle=${handle}&count=5`, {
        headers: {
          'x-api-key': 'olBiCnLPEQhNMwlCOctdQig3QDr1',
          'Content-Type': 'application/json',
        },
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log('  ✅ Posts fetch successful');
        console.log(`  📊 Posts found: ${postsData?.items?.length || postsData?.data?.items?.length || 0}`);
        
        // Log first post details
        const posts = postsData?.items || postsData?.data?.items || [];
        if (posts.length > 0) {
          const firstPost = posts[0];
          console.log(`  📝 First post ID: ${firstPost.id || firstPost.pk || 'unknown'}`);
          console.log(`  📝 First post code: ${firstPost.code || 'unknown'}`);
        }
      } else {
        console.log(`  ❌ Posts fetch failed: ${postsResponse.status}`);
        const errorText = await postsResponse.text();
        console.log(`  📄 Error response: ${errorText.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing @${handle}:`, error.message);
    }
  }
}

testInstagramAPI();