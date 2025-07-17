// Simple test to verify the refresh function works
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvkqgduefcvkeagfvvgr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2a3FnZHVlZmN2a2VhZ2Z2dmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3MzYwOSwiZXhwIjoyMDY1MDQ5NjA5fQ.AoYrJSgidxuH7lAPPCezYlS-0aJhb3Ur-lA9gR6Cies'
);

async function testComponents() {
  console.log('🧪 Testing individual components...\n');

  // 1. Test Supabase connection
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase error:', error);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }

  // 2. Test ScrapeCreators API
  console.log('\n2️⃣ Testing ScrapeCreators API...');
  try {
    const response = await fetch('https://api.scrapecreators.com/v1/instagram/profile?handle=instagram', {
      headers: {
        'x-api-key': 'olBiCnLPEQhNMwlCOctdQig3QDr1',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ ScrapeCreators API responding');
    } else {
      console.error('❌ ScrapeCreators API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ ScrapeCreators API failed:', error.message);
  }

  // 3. Check recent follows
  console.log('\n3️⃣ Checking recent follows...');
  try {
    const { data: follows, error } = await supabase
      .from('follows')
      .select(`
        created_at,
        profile_id,
        last_refresh,
        profiles(handle, platform)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching follows:', error);
    } else {
      console.log('📊 Recent follows:', follows?.length || 0);
      follows?.forEach(follow => {
        const profile = Array.isArray(follow.profiles) ? follow.profiles[0] : follow.profiles;
        console.log(`  - ${profile?.platform}/@${profile?.handle} (followed: ${follow.created_at})`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking follows:', error.message);
  }

  // 4. Check recent followed_posts
  console.log('\n4️⃣ Checking recent followed_posts...');
  try {
    const { data: posts, error } = await supabase
      .from('followed_posts')
      .select('created_at, platform, profile_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching posts:', error);
    } else {
      console.log('📊 Recent followed posts:', posts?.length || 0);
      posts?.forEach(post => {
        console.log(`  - ${post.platform} post (added: ${post.created_at})`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking posts:', error.message);
  }
}

testComponents();