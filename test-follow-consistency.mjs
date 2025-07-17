// Test follow timing consistency
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvkqgduefcvkeagfvvgr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a3FnZHVlZmN2a2VhZ2Z2dmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MzYwOSwiZXhwIjoyMDY1MDQ5NjA5fQ.AoYrJSgidxuH7lAPPCezYlS-0aJhb3Ur-lA9gR6Cies'
);

async function checkFollowConsistency() {
  console.log('🧪 Checking follow-to-refresh timing consistency...\n');
  
  // Get the last 3 Instagram follows
  const { data: recentFollows } = await supabase
    .from('follows')
    .select(`
      created_at,
      last_refresh,
      profiles(handle, platform)
    `)
    .eq('profiles.platform', 'instagram')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (!recentFollows || recentFollows.length === 0) {
    console.log('❌ No Instagram follows found');
    return;
  }
  
  console.log('📊 Recent Instagram follows and refresh timing:');
  
  recentFollows.forEach((follow, i) => {
    const profile = Array.isArray(follow.profiles) ? follow.profiles[0] : follow.profiles;
    const followTime = new Date(follow.created_at);
    const refreshTime = follow.last_refresh ? new Date(follow.last_refresh) : null;
    
    console.log(`\n${i + 1}. @${profile.handle}`);
    console.log(`   ⏰ Followed: ${followTime.toLocaleString()}`);
    console.log(`   🔄 Refreshed: ${refreshTime ? refreshTime.toLocaleString() : 'Never'}`);
    
    if (refreshTime) {
      const timeDiff = (refreshTime.getTime() - followTime.getTime()) / 1000 / 60; // minutes
      console.log(`   ⌛ Time to refresh: ${timeDiff.toFixed(1)} minutes`);
      
      if (timeDiff < 5) {
        console.log(`   ✅ Immediate refresh worked (< 5 min)`);
      } else {
        console.log(`   ⚠️ Delayed refresh (> 5 min)`);
      }
    } else {
      console.log(`   ❌ No refresh happened`);
    }
  });
  
  // Check if the follow action might be inconsistent
  const workingCount = recentFollows.filter(f => f.last_refresh).length;
  const totalCount = recentFollows.length;
  
  console.log(`\n📈 Success rate: ${workingCount}/${totalCount} (${((workingCount/totalCount)*100).toFixed(0)}%)`);
  
  if (workingCount < totalCount) {
    console.log('\n🚨 ISSUE: Follow action is not consistently triggering refresh');
    console.log('💡 This suggests the server action might be failing silently');
  } else {
    console.log('\n✅ Follow action appears to be working consistently');
  }
}

checkFollowConsistency();