// Test the updated API endpoint
async function testNewAPI() {
  console.log('🧪 Testing updated refresh-profile API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/refresh-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        profileId: 'test-profile-id',
        userId: 'test-user-id'
      }),
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API call successful!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
    } else {
      const errorResult = await response.json();
      console.log('⚠️ API returned error:', errorResult);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testNewAPI();