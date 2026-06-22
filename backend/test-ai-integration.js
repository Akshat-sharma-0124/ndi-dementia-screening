/**
 * AI Integration Test Utility
 * 
 * Test the connection between Backend and Python NDI API
 * Usage: node test-ai-integration.js
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const NDI_API_URL = process.env.NDI_API_URL || 'http://localhost:8000';

console.log('🔍 AI Integration Test Utility');
console.log('================================\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`NDI API URL: ${NDI_API_URL}\n`);

// =====================
// Test 1: Backend Health
// =====================
async function testBackendHealth() {
  console.log('Test 1: Backend Health Check');
  console.log('-----------------------------');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend is healthy');
    console.log(`   Status: ${data.status}`);
    console.log(`   Uptime: ${data.uptime}s\n`);
    return true;
  } catch (error) {
    console.log('❌ Backend is not reachable');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// =====================
// Test 2: NDI API Health
// =====================
async function testNDIHealth() {
  console.log('Test 2: NDI API Health Check');
  console.log('----------------------------');
  try {
    const response = await fetch(`${NDI_API_URL}/health`);
    const data = await response.json();
    console.log('✅ NDI API is healthy');
    console.log(`   Status: ${data.status}`);
    console.log(`   Message: ${data.message || 'Ready for analysis'}\n`);
    return true;
  } catch (error) {
    console.log('❌ NDI API is not reachable');
    console.log(`   Error: ${error.message}`);
    console.log(`   Hint: Run: cd ndi_project && uvicorn api_server:app --port 8000\n`);
    return false;
  }
}

// =====================
// Test 3: Test Audio Analysis (Direct to NDI API)
// =====================
async function testNDIAnalysis() {
  console.log('Test 3: Direct NDI API Analysis (no auth)');
  console.log('----------------------------------------');
  
  // Create a simple test audio file (silence, 1 second, 16kHz, mono)
  const testAudioPath = './test-audio.wav';
  
  // Check if test audio exists, if not, inform user
  if (!fs.existsSync(testAudioPath)) {
    console.log('⚠️  Test audio file not found at ./test-audio.wav');
    console.log('   To create one, use: ffmpeg -f lavfi -i anullsrc=r=16000:cl=mono -t 1 -q:a 9 -acodec libmp3lame test-audio.wav');
    console.log('   Or record your own audio and convert to 16kHz mono WAV\n');
    return false;
  }

  try {
    const audioBuffer = fs.readFileSync(testAudioPath);
    const formData = new FormData();
    formData.append('audio', audioBuffer, 'test-audio.wav');
    formData.append('task_type', 'picture-description');
    formData.append('task_prompt', 'Describe what you see in the image');
    formData.append('task_title', 'Test Task');

    console.log('Sending audio to NDI API...');
    const response = await fetch(`${NDI_API_URL}/analyze`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
      timeout: 120000
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.log(`❌ Analysis failed with status ${response.status}`);
      console.log(`   Error: ${error.detail}\n`);
      return false;
    }

    const result = await response.json();
    console.log('✅ NDI Analysis successful');
    console.log(`   NDI Score: ${result.ndiScore}`);
    console.log(`   Risk Level: ${result.riskLevel}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Speech Rate: ${result.speechRate} WPM`);
    console.log(`   Transcript: ${result.transcript.substring(0, 50)}...\n`);
    return true;
  } catch (error) {
    console.log('❌ Analysis test failed');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// =====================
// Test 4: Config Check
// =====================
async function testConfig() {
  console.log('Test 4: Configuration Check');
  console.log('---------------------------');
  
  const checks = {
    'GEMINI_API_KEY set': !!process.env.GEMINI_API_KEY,
    'MONGO_URI accessible': !!process.env.MONGO_URI,
    'JWT_SECRET set': !!process.env.JWT_SECRET,
    'NDI_API_URL configured': !!process.env.NDI_API_URL,
  };

  let allPass = true;
  for (const [check, pass] of Object.entries(checks)) {
    console.log(`${pass ? '✅' : '❌'} ${check}`);
    if (!pass) allPass = false;
  }
  console.log();
  return allPass;
}

// =====================
// Run All Tests
// =====================
async function runAllTests() {
  const results = {
    backendHealth: false,
    ndiHealth: false,
    ndiAnalysis: false,
    config: false
  };

  results.config = await testConfig();
  results.backendHealth = await testBackendHealth();
  results.ndiHealth = await testNDIHealth();
  
  if (results.ndiHealth) {
    results.ndiAnalysis = await testNDIAnalysis();
  }

  // Summary
  console.log('📋 Test Summary');
  console.log('================');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Passed: ${passed}/${total}`);
  console.log();

  if (results.backendHealth && results.ndiHealth) {
    console.log('✅ Integration is READY!');
    console.log('   Both servers are running and can communicate.');
  } else {
    console.log('⚠️  Some components are not running.');
    console.log('   Start both servers:');
    console.log('   Backend:   npm run dev        (in backend/ folder)');
    console.log('   Python AI: uvicorn api_server:app --port 8000  (in ndi_project/ folder)');
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
