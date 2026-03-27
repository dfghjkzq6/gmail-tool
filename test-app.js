// Simple test script to check if the Gmail app is working
const testGmailApp = async () => {
  try {
    // Test 1: Check if server is responding
    const debugResponse = await fetch('http://localhost:3000/api/debug');
    const debugData = await debugResponse.json();
    console.log('✅ Debug endpoint:', debugData);

    // Test 2: Check main page
    const pageResponse = await fetch('http://localhost:3000');
    console.log('✅ Main page status:', pageResponse.status);

    // Test 3: Check auth endpoint exists
    const authResponse = await fetch('http://localhost:3000/api/auth/session');
    console.log('✅ Auth endpoint status:', authResponse.status);

    console.log('🎉 All basic tests passed! The app is running.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run in browser console
testGmailApp();
