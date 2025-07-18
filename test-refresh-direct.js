// Direct test of the refresh function to simulate what happens during follow
const { refreshProfileForUser } = require('./src/lib/refresh-profile.ts');

async function testDirectRefresh() {
  console.log('🧪 Testing direct refresh function...');
  
  try {
    // Test with a sample profile ID and user ID
    const result = await refreshProfileForUser('test-user-id', 'test-profile-id');
    console.log('📊 Refresh result:', result);
    
    if (result.success) {
      console.log(`✅ Refresh succeeded: ${result.newPosts} new posts, ${result.errors} errors`);
      console.log(`📝 Message: ${result.message}`);
    } else {
      console.log(`❌ Refresh failed: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Error during refresh test:', error.message);
  }
}

testDirectRefresh();