// Test the actual follow action flow
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvkqgduefcvkeagfvvgr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a3FnZHVlZmN2a2VhZ2Z2dmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MzYwOSwiZXhwIjoyMDY1MDQ5NjA5fQ.AoYrJSgidxuH7lAPPCezYlS-0aJhb3Ur-lA9gR6Cies'
);

async function testRecentFollow() {
  console.log('🧪 Testing recent follow activity...\n');
  
  // Get the most recent follow
  const { data: recentFollow } = await supabase
    .from('follows')
    .select(`
      created_at,
      user_id,
      profile_id,
      last_refresh,
      profiles(handle, platform)
    `)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (!recentFollow) {
    console.log('❌ No follows found');
    return;
  }
  
  const profile = Array.isArray(recentFollow.profiles) ? recentFollow.profiles[0] : recentFollow.profiles;
  const followTime = new Date(recentFollow.created_at);
  const timeSinceFollow = (Date.now() - followTime.getTime()) / 1000 / 60; // minutes
  
  console.log(`📊 Most recent follow:`);
  console.log(`  👤 Profile: ${profile.platform}/@${profile.handle}`);
  console.log(`  ⏰ Followed: ${followTime.toLocaleString()}`);
  console.log(`  🕐 Time since follow: ${timeSinceFollow.toFixed(1)} minutes ago`);
  console.log(`  🔄 Last refresh: ${recentFollow.last_refresh || 'Never'}`);
  
  // Check if there are any followed_posts for this profile after the follow time
  const { data: postsAfterFollow, count } = await supabase
    .from('followed_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', recentFollow.user_id)
    .eq('profile_id', recentFollow.profile_id)
    .gte('created_at', recentFollow.created_at);
    
  console.log(`\n📈 Posts added after follow:`);
  console.log(`  📊 Count: ${count || 0}`);
  
  if (count && count > 0) {
    console.log('  ✅ Immediate refresh appears to have worked!');
    postsAfterFollow?.forEach((post, i) => {
      const postTime = new Date(post.created_at);
      const minutesAfterFollow = (postTime.getTime() - followTime.getTime()) / 1000 / 60;
      console.log(`    ${i + 1}. Post ${post.platform_post_id} (added ${minutesAfterFollow.toFixed(1)}min after follow)`);
    });
  } else {
    console.log('  ❌ No posts were added after the follow');
    console.log('  💡 This suggests the immediate refresh did not work');
  }
  
  // Check if there are any posts for this profile at all
  const { count: totalPosts } = await supabase
    .from('followed_posts')
    .select('*', { count: 'exact' })
    .eq('user_id', recentFollow.user_id)
    .eq('profile_id', recentFollow.profile_id);
    
  console.log(`\n📚 Total posts for this profile: ${totalPosts || 0}`);
  
  if (totalPosts === 0 && profile.platform === 'instagram') {
    console.log('🚨 No posts found for Instagram profile - immediate refresh definitely not working');
  }
}

testRecentFollow();