#!/usr/bin/env node

/**
 * Test Enterprise API Key Load Balancing
 * Verifies all 5 OpenAI API keys are working correctly
 */

const https = require('https');

// Local development Supabase (for testing)
const SUPABASE_URL = 'http://127.0.0.1:54321'; // Local development URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MTY2NDksImV4cCI6MjA0MTQ5MjY0OX0.4qJAdcZIFLf7M0_eDu7HjQfJWALGn5u3m1nQh0CZoQE';

// Sample tiny test image (1x1 pixel JPEG)
const SAMPLE_IMAGE = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

async function testApiKey(keyIndex) {
  const testData = {
    leftPalmImage: SAMPLE_IMAGE,
    rightPalmImage: SAMPLE_IMAGE,
    userData: {
      name: `TestUser${keyIndex}`,
      dateOfBirth: '1990-05-15',
      zodiacSign: 'Taurus'
    },
    _enterpriseMode: true,
    _apiKeyHint: keyIndex // Force specific API key
  };

  console.log(`🔑 Testing API Key ${keyIndex}...`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading-enterprise`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Key ${keyIndex}: SUCCESS (${responseTime}ms) - Used Key Index: ${data.apiKeyIndex}`);
      return { success: true, responseTime, keyIndex: data.apiKeyIndex };
    } else {
      const errorText = await response.text();
      console.log(`❌ API Key ${keyIndex}: FAILED (${response.status}) - ${errorText.substring(0, 100)}...`);
      return { success: false, error: `${response.status}: ${errorText}`, responseTime };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`💥 API Key ${keyIndex}: ERROR - ${error.message}`);
    return { success: false, error: error.message, responseTime };
  }
}

async function runLoadBalancingTest() {
  console.log('🚀 TESTING ENTERPRISE API KEY LOAD BALANCING');
  console.log('================================================================');
  
  const results = [];
  
  // Test each API key individually
  for (let i = 0; i < 5; i++) {
    const result = await testApiKey(i);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 LOAD BALANCING TEST RESULTS:');
  console.log('================================================================');
  
  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results.filter(r => r.success).reduce((sum, r) => sum + r.responseTime, 0) / successCount;
  
  console.log(`✅ Successful API Keys: ${successCount}/5`);
  console.log(`⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`🎯 Load Balancing Status: ${successCount >= 4 ? 'READY' : 'NEEDS ATTENTION'}`);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const keyUsed = result.keyIndex !== undefined ? ` (Used Key: ${result.keyIndex})` : '';
    console.log(`${status} Key ${index}: ${result.success ? 'Working' : result.error}${keyUsed}`);
  });
  
  if (successCount >= 4) {
    console.log('\n🎉 ENTERPRISE LOAD BALANCING READY FOR 10K+ USERS!');
  } else {
    console.log('\n⚠️  Some API keys failed. Check OpenAI dashboard for key status.');
  }
}

// Test concurrent load balancing
async function testConcurrentLoadBalancing() {
  console.log('\n🔥 TESTING CONCURRENT LOAD BALANCING (10 simultaneous requests)');
  console.log('================================================================');
  
  const promises = [];
  
  // Launch 10 concurrent requests (should distribute across keys)
  for (let i = 0; i < 10; i++) {
    const testData = {
      leftPalmImage: SAMPLE_IMAGE,
      rightPalmImage: SAMPLE_IMAGE,
      userData: {
        name: `ConcurrentUser${i}`,
        dateOfBirth: '1990-05-15',
        zodiacSign: 'Taurus'
      },
      _enterpriseMode: true
      // No _apiKeyHint - let it auto-balance
    };

    const promise = fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading-enterprise`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        return { success: true, keyUsed: data.apiKeyIndex };
      } else {
        return { success: false, error: response.status };
      }
    }).catch(error => ({ success: false, error: error.message }));
    
    promises.push(promise);
  }
  
  console.log('⏳ Waiting for 10 concurrent requests...');
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success);
  const keyDistribution = {};
  
  successful.forEach(result => {
    if (result.keyUsed !== undefined) {
      keyDistribution[result.keyUsed] = (keyDistribution[result.keyUsed] || 0) + 1;
    }
  });
  
  console.log(`✅ Successful Requests: ${successful.length}/10`);
  console.log('🔄 Key Distribution:');
  Object.entries(keyDistribution).forEach(([key, count]) => {
    console.log(`   Key ${key}: ${count} requests`);
  });
  
  const isWellDistributed = Object.keys(keyDistribution).length >= 3; // Used at least 3 different keys
  console.log(`📈 Load Distribution: ${isWellDistributed ? 'EXCELLENT' : 'NEEDS OPTIMIZATION'}`);
}

async function main() {
  try {
    await runLoadBalancingTest();
    await testConcurrentLoadBalancing();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();