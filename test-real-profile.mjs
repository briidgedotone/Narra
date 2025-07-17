// Test with the actual profile that was just followed
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvkqgduefcvkeagfvvgr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a3FnZHVlZmN2a2VhZ2Z2dmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MzYwOSwiZXhwIjoyMDY1MDQ5NjA5fQ.AoYrJSgidxuH7lAPPCezYlS-0aJhb3Ur-lA9gR6Cies'
);

async function testWithRealProfile() {
  console.log('🧪 Testing with the profile that was just followed...\n');
  
  // Get the most recent follow
  const { data: recentFollow } = await supabase
    .from('follows')
    .select(`
      user_id,
      profile_id,
      profiles(handle, platform)
    `)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (!recentFollow) {
    console.log('❌ No recent follow found');
    return;
  }
  
  const profile = Array.isArray(recentFollow.profiles) ? recentFollow.profiles[0] : recentFollow.profiles;
  console.log(`📱 Testing API with: @${profile.handle}`);
  console.log(`👤 User ID: ${recentFollow.user_id}`);
  console.log(`🆔 Profile ID: ${recentFollow.profile_id}\n`);
  
  // Test the API with the real profile data
  try {
    console.log('🔄 Calling refresh API...');
    const response = await fetch('http://localhost:3000/api/refresh-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        profileId: recentFollow.profile_id,
        userId: recentFollow.user_id
      }),
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API call successful!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.newPosts > 0) {
        console.log(`🎉 SUCCESS! ${result.data.newPosts} new posts were added!`);
      } else {
        console.log(`⚠️ API ran but no posts added: ${result.message}`);
      }
    } else {
      const errorResult = await response.json();
      console.log('❌ API returned error:', errorResult);
    }

  } catch (error) {
    console.error('❌ Error calling API:', error.message);
  }
}

testWithRealProfile();