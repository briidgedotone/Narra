// Test our actual refresh function
import { createClient } from '@supabase/supabase-js';

// Mock the refresh function locally
const supabase = createClient(
  'https://cvkqgduefcvkeagfvvgr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a3FnZHVlZmN2a2VhZ2Z2dmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MzYwOSwiZXhwIjoyMDY1MDQ5NjA5fQ.AoYrJSgidxuH7lAPPCezYlS-0aJhb3Ur-lA9gR6Cies'
);

async function testOurRefreshFunction() {
  console.log('🧪 Testing our refresh function logic...\n');
  
  // Get a recent follow to test with
  const { data: recentFollow } = await supabase
    .from('follows')
    .select(`
      user_id,
      profile_id,
      profiles(handle, platform)
    `)
    .eq('profiles.platform', 'instagram')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (!recentFollow) {
    console.log('❌ No recent Instagram follows found');
    return;
  }
  
  const profile = Array.isArray(recentFollow.profiles) ? recentFollow.profiles[0] : recentFollow.profiles;
  console.log(`📱 Testing refresh for @${profile.handle} (${profile.platform})`);
  console.log(`👤 User ID: ${recentFollow.user_id}`);
  console.log(`🆔 Profile ID: ${recentFollow.profile_id}\n`);
  
  try {
    // Step 1: Get profile details
    console.log('1️⃣ Getting profile details...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', recentFollow.profile_id)
      .single();
      
    if (profileError || !profileData) {
      console.error('❌ Profile not found:', profileError);
      return;
    }
    console.log(`✅ Found profile: ${profileData.platform}/@${profileData.handle}`);
    
    // Step 2: Fetch posts from API
    console.log('\n2️⃣ Fetching posts from API...');
    const response = await fetch(`https://api.scrapecreators.com/v2/instagram/user/posts?handle=${profileData.handle}&count=10`, {
      headers: {
        'x-api-key': 'olBiCnLPEQhNMwlCOctdQig3QDr1',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status);
      return;
    }
    
    const apiData = await response.json();
    const posts = apiData.items || apiData.data?.items || [];
    console.log(`✅ API returned ${posts.length} posts`);
    
    if (posts.length === 0) {
      console.log('⚠️ No posts found from API');
      return;
    }
    
    // Step 3: Transform and check first post
    console.log('\n3️⃣ Transforming posts...');
    const firstPost = posts[0];
    console.log('📝 First post raw data:');
    console.log('  - ID:', firstPost.id || firstPost.pk || 'missing');
    console.log('  - Code:', firstPost.code || 'missing');
    console.log('  - Caption:', (firstPost.caption?.text || '').substring(0, 50) + '...');
    
    if (!firstPost.id && !firstPost.code) {
      console.log('❌ Post missing required ID/code');
      return;
    }
    
    const postId = firstPost.id || firstPost.code;
    const transformedPost = {
      user_id: recentFollow.user_id,
      profile_id: recentFollow.profile_id,
      platform: 'instagram',
      platform_post_id: postId,
      embed_url: `https://www.instagram.com/p/${firstPost.code}/`,
      caption: firstPost.caption?.text || '',
      transcript: '',
      thumbnail_url: firstPost.image_versions2?.candidates?.[0]?.url || null,
      metrics: {
        views: firstPost.video_view_count || firstPost.view_count || 0,
        likes: firstPost.like_count || 0,
        comments: firstPost.comment_count || 0,
        shares: 0,
      },
      date_posted: firstPost.taken_at 
        ? new Date(firstPost.taken_at * 1000).toISOString() 
        : new Date().toISOString(),
    };
    
    console.log('✅ Post transformed successfully');
    
    // Step 4: Check if exists
    console.log('\n4️⃣ Checking if post exists...');
    const { data: existingPost } = await supabase
      .from('followed_posts')
      .select('id')
      .eq('user_id', recentFollow.user_id)
      .eq('profile_id', recentFollow.profile_id)
      .eq('platform_post_id', postId)
      .single();
      
    if (existingPost) {
      console.log('⚠️ Post already exists in database');
    } else {
      console.log('✅ Post is new, would be inserted');
      
      // Step 5: Test insert (but don't actually insert)
      console.log('\n5️⃣ Testing insert (dry run)...');
      console.log('📊 Transformed post data:');
      console.log(JSON.stringify(transformedPost, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error in refresh test:', error);
  }
}

testOurRefreshFunction();