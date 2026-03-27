#!/usr/bin/env node

// Simple test script to verify environment setup
console.log('=== Gmail Tool Debug Test ===');

// Check environment variables
const envVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('\n📋 Environment Variables:');
envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✓ Set' : '✗ Missing'} ${value ? `(${value.substring(0, 10)}...)` : ''}`);
});

// Check if we can load the modules
console.log('\n📦 Module Loading Test:');
try {
  const { debugLog } = require('./lib/debug.js');
  console.log('debug.js: ✓ Loaded');
  debugLog('Test debug message');
} catch (error) {
  console.log('debug.js: ✗ Failed -', error.message);
}

try {
  const { getGmailClient } = require('./lib/gmail.js');
  console.log('gmail.js: ✓ Loaded');
} catch (error) {
  console.log('gmail.js: ✗ Failed -', error.message);
}

console.log('\n🔧 Quick Start Guide:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000/debug-test.html');
console.log('3. Login with Google');
console.log('4. Test the API calls');
console.log('5. Check browser console and terminal for debug logs');
