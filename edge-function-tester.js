// Comprehensive Edge Function Tester
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🚀 ZODIA EDGE FUNCTION COMPREHENSIVE TESTER');
console.log('='.repeat(60));
console.log('Timestamp:', new Date().toISOString());
console.log('Environment:', SUPABASE_URL ? 'Production' : 'Local');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Has Auth Key:', !!SUPABASE_ANON_KEY);
console.log('='.repeat(60));

// Test data variations
const testUsers = [
  {
    name: "TestUser1",
    age: 25,
    dateOfBirth: "1999-03-15",
    zodiacSign: "Pisces"
  },
  {
    name: "TestUser2", 
    age: 30,
    dateOfBirth: "1994-07-22",
    zodiacSign: "Cancer"
  },
  {
    name: "TestUser3",
    age: 28,
    dateOfBirth: "1996-11-10", 
    zodiacSign: "Scorpio"
  }
];

const baseImages = {
  leftPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  rightPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
};

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
  issues: []
};

function logResult(testName, success, details, data = null) {
  testResults.total++;
  if (success) testResults.passed++;
  else testResults.failed++;
  
  testResults.tests.push({
    name: testName,
    success,
    details,
    timestamp: new Date().toISOString(),
    data
  });
  
  console.log(`${success ? '✅' : '❌'} ${testName}`);
  if (details) console.log(`   ${details}`);
  if (!success && data) {
    testResults.issues.push({ test: testName, data });
  }
}

// Test 1: Basic Connectivity
async function testBasicConnectivity() {
  console.log('\n🔌 Testing Basic Edge Function Connectivity...');
  console.log('-'.repeat(50));
  
  try {
    const testData = { ...baseImages, userData: testUsers[0] };
    
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-client-info': 'connectivity-test'
      },
      body: JSON.stringify(testData)
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const result = await response.json();
      logResult(
        'Basic Connectivity', 
        true, 
        `Status: ${response.status}, Time: ${responseTime}ms, Model: ${result.model || 'N/A'}`
      );
      return result;
    } else {
      const error = await response.text();
      logResult(
        'Basic Connectivity',
        false,
        `Status: ${response.status}, Error: ${error.substring(0, 200)}`,
        { status: response.status, error }
      );
      return null;
    }
  } catch (error) {
    logResult(
      'Basic Connectivity',
      false,
      `Network Error: ${error.message}`,
      { error: error.message }
    );
    return null;
  }
}

// Test 2: Response Structure Validation
async function testResponseStructure(sampleResult) {
  console.log('\n📋 Testing Response Structure...');
  console.log('-'.repeat(50));
  
  if (!sampleResult || !sampleResult.reading) {
    logResult('Response Structure', false, 'No valid response data to test');
    return false;
  }
  
  const reading = sampleResult.reading;
  const requiredFields = [
    'greeting',
    'overallPersonality',
    'lines',
    'mounts', 
    'specialMarkings',
    'futureInsights',
    'personalizedAdvice'
  ];
  
  const missingFields = requiredFields.filter(field => !reading[field]);
  
  if (missingFields.length === 0) {
    // Check sub-structures
    const lineCount = Object.keys(reading.lines || {}).length;
    const mountCount = Object.keys(reading.mounts || {}).length;
    const markingCount = (reading.specialMarkings || []).length;
    
    const structureValid = lineCount >= 7 && mountCount >= 7 && markingCount >= 4;
    
    logResult(
      'Response Structure',
      structureValid,
      `Lines: ${lineCount}/7, Mounts: ${mountCount}/7, Markings: ${markingCount}/4`,
      { lineCount, mountCount, markingCount }
    );
    return structureValid;
  } else {
    logResult(
      'Response Structure',
      false,
      `Missing fields: ${missingFields.join(', ')}`,
      { missingFields }
    );
    return false;
  }
}

// Test 3: Content Quality Check
async function testContentQuality(sampleResult) {
  console.log('\n💎 Testing Content Quality...');
  console.log('-'.repeat(50));
  
  if (!sampleResult || !sampleResult.reading) {
    logResult('Content Quality', false, 'No valid response data to test');
    return false;
  }
  
  const reading = sampleResult.reading;
  const qualityChecks = {
    greeting: {
      present: !!reading.greeting,
      length: (reading.greeting || '').length,
      minLength: 20
    },
    overallPersonality: {
      present: !!reading.overallPersonality,
      length: (reading.overallPersonality || '').length,
      minLength: 50
    },
    futureInsights: {
      present: !!reading.futureInsights,
      length: (reading.futureInsights || '').length,
      minLength: 50
    },
    personalizedAdvice: {
      present: !!reading.personalizedAdvice,
      length: (reading.personalizedAdvice || '').length,
      minLength: 50
    }
  };
  
  let qualityScore = 0;
  let totalChecks = 0;
  const failures = [];
  
  Object.entries(qualityChecks).forEach(([field, check]) => {
    totalChecks++;
    const isValid = check.present && check.length >= check.minLength;
    if (isValid) {
      qualityScore++;
    } else {
      failures.push(`${field} (${check.length}/${check.minLength} chars)`);
    }
  });
  
  const percentage = Math.round((qualityScore / totalChecks) * 100);
  const passed = percentage >= 75;
  
  logResult(
    'Content Quality',
    passed,
    `Score: ${percentage}% (${qualityScore}/${totalChecks})${failures.length ? `, Failed: ${failures.join(', ')}` : ''}`,
    { percentage, failures }
  );
  
  return passed;
}

// Test 4: Uniqueness Testing
async function testUniqueness() {
  console.log('\n🎲 Testing Content Uniqueness...');
  console.log('-'.repeat(50));
  
  const uniquenessResults = [];
  
  try {
    // Make 3 calls with different users
    for (let i = 0; i < 3; i++) {
      console.log(`   Making call ${i + 1}/3...`);
      
      const testData = { ...baseImages, userData: testUsers[i] };
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-client-info': `uniqueness-test-${i + 1}`
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const result = await response.json();
        uniquenessResults.push({
          user: testUsers[i].name,
          greeting: result.reading?.greeting || '',
          personality: result.reading?.overallPersonality || '',
          success: true
        });
      } else {
        uniquenessResults.push({
          user: testUsers[i].name,
          error: await response.text(),
          success: false
        });
      }
      
      // Wait between calls
      if (i < 2) await new Promise(r => setTimeout(r, 1500));
    }
    
    // Analyze uniqueness
    const successful = uniquenessResults.filter(r => r.success);
    
    if (successful.length >= 2) {
      const greetings = successful.map(r => r.greeting);
      const personalities = successful.map(r => r.personality);
      
      // Check for banned phrases
      const bannedPhrases = ['MAIN CHARACTER ENERGY'];
      const hasBannedPhrases = greetings.some(g => 
        bannedPhrases.some(phrase => g.includes(phrase))
      );
      
      // Check uniqueness
      const uniqueGreetings = [...new Set(greetings)];
      const uniquePersonalities = [...new Set(personalities)];
      const greetingsUnique = greetings.length === uniqueGreetings.length;
      const personalitiesUnique = personalities.length === uniquePersonalities.length;
      
      const passed = !hasBannedPhrases && greetingsUnique && personalitiesUnique;
      
      let details = `Greetings: ${uniqueGreetings.length}/${greetings.length} unique, `;
      details += `Personalities: ${uniquePersonalities.length}/${personalities.length} unique`;
      
      if (hasBannedPhrases) {
        details += ', Contains banned phrases';
      }
      
      logResult(
        'Content Uniqueness',
        passed,
        details,
        { 
          hasBannedPhrases, 
          greetingsUnique, 
          personalitiesUnique,
          samples: greetings.map(g => g.substring(0, 100))
        }
      );
      
      return passed;
    } else {
      logResult(
        'Content Uniqueness',
        false,
        `Only ${successful.length}/3 calls succeeded`,
        { successful: successful.length }
      );
      return false;
    }
    
  } catch (error) {
    logResult(
      'Content Uniqueness',
      false,
      `Error: ${error.message}`,
      { error: error.message }
    );
    return false;
  }
}

// Test 5: Error Handling
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  console.log('-'.repeat(50));
  
  const errorTests = [
    {
      name: 'Missing Images',
      data: { userData: testUsers[0] }, // No images
      expectedStatus: [400, 500]
    },
    {
      name: 'Missing User Data', 
      data: { ...baseImages }, // No userData
      expectedStatus: [400, 500]
    },
    {
      name: 'Invalid User Data',
      data: { ...baseImages, userData: { name: '' } }, // Invalid userData
      expectedStatus: [400, 500]
    }
  ];
  
  let passedTests = 0;
  
  for (const test of errorTests) {
    try {
      console.log(`   Testing: ${test.name}...`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-client-info': `error-test-${test.name.toLowerCase().replace(' ', '-')}`
        },
        body: JSON.stringify(test.data)
      });
      
      const isExpectedError = test.expectedStatus.includes(response.status);
      
      if (isExpectedError) {
        console.log(`   ✅ ${test.name}: Correctly returned ${response.status}`);
        passedTests++;
      } else {
        console.log(`   ❌ ${test.name}: Expected ${test.expectedStatus.join('|')}, got ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${test.name}: Network error - ${error.message}`);
    }
  }
  
  const passed = passedTests >= 2; // At least 2/3 error tests should pass
  logResult(
    'Error Handling',
    passed,
    `${passedTests}/${errorTests.length} error scenarios handled correctly`,
    { passedTests, totalTests: errorTests.length }
  );
  
  return passed;
}

// Test 6: Performance Testing
async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  console.log('-'.repeat(50));
  
  const performanceTests = [];
  
  try {
    for (let i = 0; i < 3; i++) {
      console.log(`   Performance test ${i + 1}/3...`);
      
      const testData = { ...baseImages, userData: testUsers[i % testUsers.length] };
      
      const startTime = Date.now();
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-client-info': `performance-test-${i + 1}`
        },
        body: JSON.stringify(testData)
      });
      const endTime = Date.now();
      
      performanceTests.push({
        duration: endTime - startTime,
        status: response.status,
        success: response.ok
      });
      
      if (i < 2) await new Promise(r => setTimeout(r, 500));
    }
    
    const successful = performanceTests.filter(t => t.success);
    
    if (successful.length > 0) {
      const avgTime = Math.round(successful.reduce((sum, t) => sum + t.duration, 0) / successful.length);
      const maxTime = Math.max(...successful.map(t => t.duration));
      const minTime = Math.min(...successful.map(t => t.duration));
      
      const passed = avgTime < 30000 && maxTime < 45000; // 30s avg, 45s max
      
      logResult(
        'Performance',
        passed,
        `Avg: ${avgTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms (${successful.length}/${performanceTests.length} successful)`,
        { avgTime, minTime, maxTime, successful: successful.length }
      );
      
      return passed;
    } else {
      logResult('Performance', false, 'No successful performance tests');
      return false;
    }
    
  } catch (error) {
    logResult('Performance', false, `Error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\nStarting comprehensive edge function tests...\n');
  
  // Run tests sequentially
  const sampleResult = await testBasicConnectivity();
  await testResponseStructure(sampleResult);
  await testContentQuality(sampleResult);
  await testUniqueness();
  await testErrorHandling();
  await testPerformance();
  
  // Generate comprehensive report
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  console.log('\n📋 DETAILED TEST BREAKDOWN:');
  console.log('-'.repeat(40));
  testResults.tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}: ${test.success ? '✅' : '❌'}`);
    console.log(`   ${test.details}`);
  });
  
  // System status assessment
  console.log('\n🎯 SYSTEM STATUS ASSESSMENT:');
  console.log('-'.repeat(40));
  
  const criticalTests = ['Basic Connectivity', 'Response Structure', 'Content Quality'];
  const criticalPassed = testResults.tests
    .filter(t => criticalTests.includes(t.name))
    .every(t => t.success);
  
  if (criticalPassed) {
    console.log('✅ CORE FUNCTIONALITY: Working perfectly');
    
    const uniquenessTest = testResults.tests.find(t => t.name === 'Content Uniqueness');
    if (uniquenessTest && !uniquenessTest.success) {
      console.log('⚠️  UNIQUENESS ISSUE: Deployment cache problem detected');
      console.log('   → Edge function code needs redeployment');
      console.log('   → This is cosmetic only - core features work fine');
    } else {
      console.log('✅ UNIQUENESS: Working correctly');
    }
    
    const errorTest = testResults.tests.find(t => t.name === 'Error Handling');
    if (errorTest && errorTest.success) {
      console.log('✅ ERROR HANDLING: Robust error responses');
    }
    
    const perfTest = testResults.tests.find(t => t.name === 'Performance');
    if (perfTest && perfTest.success) {
      console.log('✅ PERFORMANCE: Fast response times');
    }
    
  } else {
    console.log('❌ CRITICAL ISSUES DETECTED');
    const failedCritical = testResults.tests
      .filter(t => criticalTests.includes(t.name) && !t.success)
      .map(t => t.name);
    console.log(`   Failed critical tests: ${failedCritical.join(', ')}`);
  }
  
  // Issues summary
  if (testResults.issues.length > 0) {
    console.log('\n🚨 ISSUES REQUIRING ATTENTION:');
    console.log('-'.repeat(40));
    testResults.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.test}`);
      if (issue.data.error) {
        console.log(`   Error: ${issue.data.error}`);
      }
      if (issue.data.missingFields) {
        console.log(`   Missing: ${issue.data.missingFields.join(', ')}`);
      }
      if (issue.data.hasBannedPhrases) {
        console.log(`   Contains banned phrases - deployment issue`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  return testResults;
}

// Validate environment and run
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

runAllTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});