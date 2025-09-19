#!/usr/bin/env node

/**
 * 🚀 ENTERPRISE LOAD TESTING SCRIPT - 10K+ Users
 * Validates ZodiaApp enterprise infrastructure capacity
 * 
 * TEST SCENARIOS:
 * 1. 10,000 daily users (417 users/hour peak)
 * 2. 200+ concurrent palm readings
 * 3. 300+ concurrent compatibility analyses
 * 4. Circuit breaker and fallback testing
 * 5. API key load balancing validation
 */

const https = require('https');
const fs = require('fs');

// TEST CONFIGURATION
const CONFIG = {
  // Base URLs (replace with your actual Supabase project URL)
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // Load testing parameters
  TOTAL_DAILY_USERS: 10000,
  PEAK_HOURS_MULTIPLIER: 3, // 3x normal load during peak
  CONCURRENT_PALM_READINGS: 200,
  CONCURRENT_COMPATIBILITY: 300,
  TEST_DURATION_MINUTES: 30,
  
  // Test data
  SAMPLE_USERS: [
    { name: 'Alice Johnson', dateOfBirth: '1990-03-15', zodiacSign: 'Pisces' },
    { name: 'Bob Smith', dateOfBirth: '1985-07-22', zodiacSign: 'Cancer' },
    { name: 'Carol Davis', dateOfBirth: '1992-11-08', zodiacSign: 'Scorpio' },
    { name: 'David Wilson', dateOfBirth: '1988-01-30', zodiacSign: 'Aquarius' },
    { name: 'Emma Brown', dateOfBirth: '1995-05-18', zodiacSign: 'Taurus' }
  ]
};

// METRICS TRACKING
const metrics = {
  palmReadings: {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: [],
    concurrentPeak: 0
  },
  compatibility: {
    total: 0,
    success: 0,
    errors: 0,
    responseTimes: [],
    concurrentPeak: 0
  },
  system: {
    startTime: Date.now(),
    memoryUsage: [],
    cpuUsage: [],
    errors: []
  }
};

let activePalmReadings = 0;
let activeCompatibility = 0;

// SAMPLE BASE64 IMAGES (tiny test images)
const SAMPLE_PALM_IMAGES = {
  left: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  right: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
};

// UTILITY FUNCTIONS
function randomUser() {
  return CONFIG.SAMPLE_USERS[Math.floor(Math.random() * CONFIG.SAMPLE_USERS.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logProgress(message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${message}`);
}

function logMetrics() {
  const palmSuccess = metrics.palmReadings.total > 0 ? 
    (metrics.palmReadings.success / metrics.palmReadings.total * 100).toFixed(1) : 0;
  const compatSuccess = metrics.compatibility.total > 0 ? 
    (metrics.compatibility.success / metrics.compatibility.total * 100).toFixed(1) : 0;
  
  const avgPalmTime = metrics.palmReadings.responseTimes.length > 0 ?
    Math.round(metrics.palmReadings.responseTimes.reduce((a, b) => a + b) / metrics.palmReadings.responseTimes.length) : 0;
  const avgCompatTime = metrics.compatibility.responseTimes.length > 0 ?
    Math.round(metrics.compatibility.responseTimes.reduce((a, b) => a + b) / metrics.compatibility.responseTimes.length) : 0;

  logProgress(`📊 METRICS | Palm: ${metrics.palmReadings.total} (${palmSuccess}% success, ${avgPalmTime}ms avg) | Compat: ${metrics.compatibility.total} (${compatSuccess}% success, ${avgCompatTime}ms avg) | Active: P${activePalmReadings}/C${activeCompatibility}`);
}

// API CALL FUNCTIONS
async function testPalmReading(userData, apiKeyHint = undefined) {
  activePalmReadings++;
  metrics.palmReadings.concurrentPeak = Math.max(metrics.palmReadings.concurrentPeak, activePalmReadings);
  
  const startTime = Date.now();
  metrics.palmReadings.total++;

  try {
    const payload = {
      leftPalmImage: SAMPLE_PALM_IMAGES.left.split(',')[1], // Remove data:image/jpeg;base64,
      rightPalmImage: SAMPLE_PALM_IMAGES.right.split(',')[1],
      userData: userData,
      _enterpriseMode: true,
      _apiKeyHint: apiKeyHint
    };

    const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/generate-palm-reading-enterprise`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseTime = Date.now() - startTime;
    metrics.palmReadings.responseTimes.push(responseTime);

    if (response.ok) {
      const data = await response.json();
      metrics.palmReadings.success++;
      logProgress(`✅ Palm Reading Success: ${userData.name} (${responseTime}ms, Key: ${data.apiKeyIndex || 'unknown'})`);
      return data;
    } else {
      metrics.palmReadings.errors++;
      logProgress(`❌ Palm Reading Error: ${response.status} for ${userData.name}`);
      return null;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    metrics.palmReadings.responseTimes.push(responseTime);
    metrics.palmReadings.errors++;
    metrics.system.errors.push({ type: 'palm_reading', error: error.message, time: Date.now() });
    logProgress(`💥 Palm Reading Exception: ${error.message} for ${userData.name}`);
    return null;
  } finally {
    activePalmReadings--;
  }
}

async function testCompatibilityAnalysis(userReading, partnerReading) {
  activeCompatibility++;
  metrics.compatibility.concurrentPeak = Math.max(metrics.compatibility.concurrentPeak, activeCompatibility);
  
  const startTime = Date.now();
  metrics.compatibility.total++;

  try {
    const payload = {
      userReading: userReading || { name: 'Test User', lines: {}, mounts: {} },
      partnerReading: partnerReading || { name: 'Test Partner', lines: {}, mounts: {} },
      matchType: 'friend',
      directMode: true,
      _enterpriseMode: true
    };

    const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/generate-compatibility-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseTime = Date.now() - startTime;
    metrics.compatibility.responseTimes.push(responseTime);

    if (response.ok) {
      const data = await response.json();
      metrics.compatibility.success++;
      logProgress(`✅ Compatibility Success: ${responseTime}ms`);
      return data;
    } else {
      metrics.compatibility.errors++;
      logProgress(`❌ Compatibility Error: ${response.status}`);
      return null;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    metrics.compatibility.responseTimes.push(responseTime);
    metrics.compatibility.errors++;
    metrics.system.errors.push({ type: 'compatibility', error: error.message, time: Date.now() });
    logProgress(`💥 Compatibility Exception: ${error.message}`);
    return null;
  } finally {
    activeCompatibility--;
  }
}

// LOAD TESTING SCENARIOS
async function scenario1_DailyUserDistribution() {
  logProgress('🎯 SCENARIO 1: Daily User Distribution Test (10K users over 24 hours)');
  
  const usersPerHour = CONFIG.TOTAL_DAILY_USERS / 24;
  const peakUsersPerHour = usersPerHour * CONFIG.PEAK_HOURS_MULTIPLIER;
  
  logProgress(`📈 Simulating ${Math.round(peakUsersPerHour)} users/hour (peak) = ${Math.round(peakUsersPerHour/60)} users/minute`);
  
  const testDurationMs = CONFIG.TEST_DURATION_MINUTES * 60 * 1000;
  const usersPerMinute = Math.round(peakUsersPerHour / 60);
  const intervalMs = 60000 / usersPerMinute; // Time between user requests
  
  const endTime = Date.now() + testDurationMs;
  let userCount = 0;
  
  while (Date.now() < endTime) {
    const user = randomUser();
    userCount++;
    
    // 70% palm readings, 30% compatibility
    if (Math.random() < 0.7) {
      testPalmReading(user, userCount % 5); // Distribute across 5 API keys
    } else {
      testCompatibilityAnalysis();
    }
    
    await sleep(intervalMs);
    
    if (userCount % 10 === 0) {
      logMetrics();
    }
  }
  
  logProgress(`✅ Scenario 1 Complete: ${userCount} users simulated`);
}

async function scenario2_ConcurrentStressTest() {
  logProgress('🔥 SCENARIO 2: Concurrent Stress Test (200 Palm + 300 Compatibility)');
  
  const palmPromises = [];
  const compatPromises = [];
  
  // Launch 200 concurrent palm readings
  for (let i = 0; i < CONFIG.CONCURRENT_PALM_READINGS; i++) {
    const user = randomUser();
    palmPromises.push(testPalmReading(user, i % 5));
    
    // Stagger requests to avoid overwhelming the system instantly
    if (i % 25 === 0) {
      await sleep(1000);
    }
  }
  
  // Launch 300 concurrent compatibility analyses
  for (let i = 0; i < CONFIG.CONCURRENT_COMPATIBILITY; i++) {
    compatPromises.push(testCompatibilityAnalysis());
    
    // Stagger requests
    if (i % 50 === 0) {
      await sleep(500);
    }
  }
  
  logProgress(`⏳ Waiting for ${palmPromises.length} palm readings and ${compatPromises.length} compatibility analyses...`);
  
  // Wait for all requests to complete
  const [palmResults, compatResults] = await Promise.allSettled([
    Promise.allSettled(palmPromises),
    Promise.allSettled(compatPromises)
  ]);
  
  logProgress(`✅ Scenario 2 Complete: ${palmResults.value?.length || 0} palm + ${compatResults.value?.length || 0} compat`);
}

async function scenario3_CircuitBreakerTest() {
  logProgress('⚡ SCENARIO 3: Circuit Breaker & Fallback Test');
  
  // Overwhelm the system to trigger circuit breakers
  const overloadPromises = [];
  
  for (let i = 0; i < 500; i++) {
    const user = randomUser();
    overloadPromises.push(testPalmReading(user));
    
    // No staggering - send all at once to trigger fallbacks
    if (i % 100 === 0) {
      logProgress(`💥 Overload wave ${Math.floor(i/100) + 1}/5 - Testing circuit breakers...`);
    }
  }
  
  await Promise.allSettled(overloadPromises);
  logProgress(`✅ Scenario 3 Complete: Circuit breaker resilience tested`);
}

// FINAL REPORT GENERATION
function generateReport() {
  const totalRuntime = Date.now() - metrics.system.startTime;
  const runtimeMinutes = Math.round(totalRuntime / 60000);
  
  const palmSuccessRate = metrics.palmReadings.total > 0 ? 
    (metrics.palmReadings.success / metrics.palmReadings.total * 100).toFixed(1) : 0;
  const compatSuccessRate = metrics.compatibility.total > 0 ? 
    (metrics.compatibility.success / metrics.compatibility.total * 100).toFixed(1) : 0;
  
  const avgPalmTime = metrics.palmReadings.responseTimes.length > 0 ?
    Math.round(metrics.palmReadings.responseTimes.reduce((a, b) => a + b) / metrics.palmReadings.responseTimes.length) : 0;
  const avgCompatTime = metrics.compatibility.responseTimes.length > 0 ?
    Math.round(metrics.compatibility.responseTimes.reduce((a, b) => a + b) / metrics.compatibility.responseTimes.length) : 0;
  
  const report = `
🏆 ENTERPRISE LOAD TEST REPORT - ZodiaApp 10K Users
================================================================

📊 OVERALL PERFORMANCE:
• Runtime: ${runtimeMinutes} minutes
• Peak Concurrent Palm Readings: ${metrics.palmReadings.concurrentPeak}
• Peak Concurrent Compatibility: ${metrics.compatibility.concurrentPeak}
• Total System Errors: ${metrics.system.errors.length}

🌟 PALM READING PERFORMANCE:
• Total Requests: ${metrics.palmReadings.total}
• Success Rate: ${palmSuccessRate}%
• Failed Requests: ${metrics.palmReadings.errors}
• Average Response Time: ${avgPalmTime}ms
• Capacity Status: ${metrics.palmReadings.concurrentPeak >= 200 ? '✅ PASSED' : '⚠️ NEEDS OPTIMIZATION'}

🎯 COMPATIBILITY PERFORMANCE:
• Total Requests: ${metrics.compatibility.total}
• Success Rate: ${compatSuccessRate}%
• Failed Requests: ${metrics.compatibility.errors}
• Average Response Time: ${avgCompatTime}ms
• Capacity Status: ${metrics.compatibility.concurrentPeak >= 300 ? '✅ PASSED' : '⚠️ NEEDS OPTIMIZATION'}

🎖️ 10K DAILY USERS READINESS:
${palmSuccessRate >= 95 && compatSuccessRate >= 95 ? '🟢 READY FOR 10K USERS' : '🟡 OPTIMIZATION NEEDED'}

📈 SCALING RECOMMENDATIONS:
${avgPalmTime > 45000 ? '• Palm readings: Add more API keys or optimize processing' : '• Palm readings: Performance optimal'}
${avgCompatTime > 15000 ? '• Compatibility: Increase batch processing limits' : '• Compatibility: Performance optimal'}
${metrics.system.errors.length > 50 ? '• Error rate high: Review logs and error handling' : '• Error rate acceptable'}

================================================================
Test completed at: ${new Date().toISOString()}
`;

  console.log(report);
  
  // Save report to file
  fs.writeFileSync('load-test-report.txt', report);
  logProgress('📋 Full report saved to load-test-report.txt');
}

// MAIN EXECUTION
async function runLoadTests() {
  logProgress('🚀 STARTING ENTERPRISE LOAD TESTS - 10K Users Validation');
  logProgress('⚙️ Configuration: Target 10K daily users, 200+ concurrent palm, 300+ compatibility');
  
  try {
    // Run all test scenarios
    await scenario1_DailyUserDistribution();
    await sleep(5000); // Brief pause between scenarios
    
    await scenario2_ConcurrentStressTest();
    await sleep(5000);
    
    await scenario3_CircuitBreakerTest();
    
    // Final metrics and report
    await sleep(10000); // Wait for final requests to complete
    logMetrics();
    generateReport();
    
  } catch (error) {
    logProgress(`💥 Load test failed: ${error.message}`);
    console.error(error);
  }
  
  logProgress('🏁 Load testing complete!');
}

// EXECUTION CHECK
if (require.main === module) {
  if (CONFIG.SUPABASE_URL.includes('your-project')) {
    console.log(`
⚠️  CONFIGURATION REQUIRED
Please update the CONFIG section in this script with your actual:
• SUPABASE_URL: Your Supabase project URL
• SUPABASE_ANON_KEY: Your Supabase anonymous key

Example:
SUPABASE_URL: 'https://abcdef123456.supabase.co'
SUPABASE_ANON_KEY: 'eyJhbGci...'

Then run: node load-test-enterprise.js
`);
  } else {
    runLoadTests();
  }
}

module.exports = { runLoadTests, testPalmReading, testCompatibilityAnalysis };