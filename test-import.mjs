// Test if we can import the refresh function
console.log('🧪 Testing refresh function import...\n');

try {
  console.log('1️⃣ Attempting to import refresh function...');
  
  // Test ES module import
  const { refreshProfileForUser } = await import('./src/lib/refresh-profile.ts');
  console.log('✅ ES module import successful');
  console.log('📊 Function type:', typeof refreshProfileForUser);
  
  // Test if function is callable
  if (typeof refreshProfileForUser === 'function') {
    console.log('✅ Function is callable');
  } else {
    console.log('❌ Import did not return a function');
  }
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('📄 Error details:', error);
}

// Also test the path resolution
console.log('\n2️⃣ Testing file existence...');
import fs from 'fs';
import path from 'path';

const refreshPath = path.join(process.cwd(), 'src/lib/refresh-profile.ts');
if (fs.existsSync(refreshPath)) {
  console.log('✅ Refresh file exists at:', refreshPath);
} else {
  console.log('❌ Refresh file not found at:', refreshPath);
}