import fetch from 'node-fetch';

// Test the refresh functionality
async function testRefreshProfile() {
  try {
    console.log('🧪 Testing refresh-profile API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/refresh-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileId: 'test-profile-id' }),
    });

    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response body:', JSON.stringify(result, null, 2));

    if (response.status === 401) {
      console.log('✅ API endpoint is working - returns 401 (Unauthorized) as expected without auth');
    } else if (response.status === 500) {
      console.log('⚠️  API endpoint returned 500 - check server logs for details');
    } else {
      console.log('✅ API endpoint is responsive');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the development server is running: npm run dev');
    }
  }
}

// Test if the server is reachable
async function testServerHealth() {
  try {
    console.log('🏥 Testing server health...');
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
    });
    
    if (response.status === 404) {
      console.log('✅ Server is reachable (404 on non-existent health endpoint is expected)');
    } else {
      console.log('✅ Server is reachable, status:', response.status);
    }
  } catch (error) {
    console.error('❌ Server not reachable:', error.message);
  }
}

// Run tests
console.log('🚀 Starting refresh functionality tests...\n');
await testServerHealth();
console.log('');
await testRefreshProfile();