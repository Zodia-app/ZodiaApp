// Final comprehensive test suite
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== ZODIA APP FINAL COMPREHENSIVE TEST ===');
console.log('Timestamp:', new Date().toISOString());
console.log('Supabase URL:', SUPABASE_URL);
console.log('Has Anon Key:', !!SUPABASE_ANON_KEY);
console.log('===========================================\n');

const testResults = {
  palmReading: null,
  uniqueness: null,
  fieldValidation: null,
  total: 0,
  passed: 0,
  failed: 0
};

const testData = {
  leftPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  rightPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  userData: {
    name: "TestUser",
    age: 25,
    dateOfBirth: "1999-01-01",
    zodiacSign: "Capricorn"
  }
};

// Test 1: Basic Palm Reading Functionality
async function testPalmReadingBasic() {
  console.log('🧪 TEST 1: Basic Palm Reading Functionality');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-palm-reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-client-info': 'final-test'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const error = await response.text();
      testResults.palmReading = { success: false, error };
      testResults.failed++;
      console.log('❌ FAILED: Edge function returned error');
      console.log('Response status:', response.status);
      console.log('Error:', error.substring(0, 200));
      return false;
    }

    const result = await response.json();
    const reading = result.reading;
    
    if (!reading) {
      testResults.palmReading = { success: false, error: 'No reading in response' };
      testResults.failed++;
      console.log('❌ FAILED: No reading content received');
      return false;
    }

    testResults.palmReading = { success: true, result };
    testResults.passed++;
    console.log('✅ PASSED: Edge function responded successfully');
    console.log('Response has reading:', !!reading);
    console.log('Model used:', result.model || 'Not specified');
    return reading;
    
  } catch (error) {
    testResults.palmReading = { success: false, error: error.message };
    testResults.failed++;
    console.log('❌ FAILED: Network/parsing error');
    console.log('Error:', error.message);
    return false;
  }
}

// Test 2: Field Validation
async function testFieldValidation(reading) {
  console.log('\n🧪 TEST 2: Critical Field Validation');
  console.log('─'.repeat(50));
  
  if (!reading) {
    console.log('❌ SKIPPED: No reading data from previous test');
    testResults.fieldValidation = { success: false, error: 'No reading data' };
    testResults.failed++;
    return false;
  }

  const requiredFields = {
    greeting: reading.greeting,
    overallPersonality: reading.overallPersonality,
    futureInsights: reading.futureInsights,
    personalizedAdvice: reading.personalizedAdvice,
    lines: reading.lines,
    mounts: reading.mounts,
    specialMarkings: reading.specialMarkings
  };

  const fieldStatus = {};
  let allValid = true;

  // Check each field
  Object.entries(requiredFields).forEach(([field, value]) => {
    let isValid = false;
    let details = '';
    
    if (field === 'lines' || field === 'mounts') {
      isValid = value && typeof value === 'object' && Object.keys(value).length > 0;
      details = isValid ? `${Object.keys(value).length} items` : 'missing/empty';
    } else if (field === 'specialMarkings') {
      isValid = Array.isArray(value) && value.length > 0;
      details = isValid ? `${value.length} markings` : 'missing/empty array';
    } else {
      isValid = value && typeof value === 'string' && value.trim().length > 10;
      details = value ? `${value.length} chars` : 'missing/empty';
    }
    
    fieldStatus[field] = { valid: isValid, details };
    if (!isValid) allValid = false;
    
    console.log(`${isValid ? '✅' : '❌'} ${field}: ${details}`);
  });

  testResults.fieldValidation = { success: allValid, fieldStatus };
  if (allValid) {
    testResults.passed++;
    console.log('\n✅ PASSED: All required fields present and valid');
  } else {
    testResults.failed++;
    console.log('\n❌ FAILED: Some required fields missing/invalid');
  }
  
  return allValid;
}

// Test 3: Uniqueness Test
async function testUniqueness() {
  console.log('\n🧪 TEST 3: Content Uniqueness');
  console.log('─'.repeat(50));
  
  try {
    const calls = [];
    
    // Make 2 calls to test uniqueness
    for (let i = 0; i < 2; i++) {
      console.log(`Making call ${i + 1}...`);
      
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
        calls.push({
          success: true,
          greeting: result.reading?.greeting || '',
          overallPersonality: result.reading?.overallPersonality || ''
        });
      } else {
        calls.push({ success: false, error: await response.text() });
      }
      
      // Wait between calls
      if (i < 1) await new Promise(r => setTimeout(r, 2000));
    }

    const successful = calls.filter(c => c.success);
    
    if (successful.length < 2) {
      testResults.uniqueness = { success: false, error: 'Not enough successful calls' };
      testResults.failed++;
      console.log('❌ FAILED: Could not make 2 successful calls for comparison');
      return false;
    }

    const greeting1 = successful[0].greeting;
    const greeting2 = successful[1].greeting;
    const personality1 = successful[0].overallPersonality;
    const personality2 = successful[1].overallPersonality;

    // Check uniqueness
    const greetingsIdentical = greeting1 === greeting2;
    const personalitiesIdentical = personality1 === personality2;
    const hasOldPattern = greeting1.includes('MAIN CHARACTER ENERGY') || greeting2.includes('MAIN CHARACTER ENERGY');
    
    console.log('Call 1 greeting preview:', greeting1.substring(0, 100) + '...');
    console.log('Call 2 greeting preview:', greeting2.substring(0, 100) + '...');
    console.log('');
    console.log(`Greetings identical: ${greetingsIdentical ? '❌ YES' : '✅ NO'}`);
    console.log(`Personalities identical: ${personalitiesIdentical ? '❌ YES' : '✅ NO'}`);
    console.log(`Has old "MAIN CHARACTER ENERGY" pattern: ${hasOldPattern ? '❌ YES' : '✅ NO'}`);

    const isUnique = !greetingsIdentical && !personalitiesIdentical && !hasOldPattern;
    
    testResults.uniqueness = {
      success: isUnique,
      greetingsIdentical,
      personalitiesIdentical,
      hasOldPattern
    };

    if (isUnique) {
      testResults.passed++;
      console.log('\n✅ PASSED: Content is unique and no old patterns detected');
    } else {
      testResults.failed++;
      console.log('\n❌ FAILED: Content not unique or old patterns still present');
      if (hasOldPattern) {
        console.log('⚠️  ISSUE: Edge function deployment may not have taken effect');
      }
    }
    
    return isUnique;
    
  } catch (error) {
    testResults.uniqueness = { success: false, error: error.message };
    testResults.failed++;
    console.log('❌ FAILED: Error during uniqueness test');
    console.log('Error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive test suite...\n');
  
  testResults.total = 3;
  
  const reading = await testPalmReadingBasic();
  await testFieldValidation(reading);
  await testUniqueness();
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  console.log('');
  
  // Specific results
  console.log('DETAILED RESULTS:');
  console.log('─'.repeat(40));
  console.log(`1. Palm Reading Basic: ${testResults.palmReading?.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`2. Field Validation: ${testResults.fieldValidation?.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`3. Content Uniqueness: ${testResults.uniqueness?.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\nISSUES FOUND:');
  console.log('─'.repeat(40));
  
  let issuesFound = false;
  
  if (!testResults.palmReading?.success) {
    issuesFound = true;
    console.log('❌ Edge function not responding properly');
  }
  
  if (!testResults.fieldValidation?.success) {
    issuesFound = true;
    console.log('❌ Some required fields are missing or empty');
  }
  
  if (!testResults.uniqueness?.success) {
    issuesFound = true;
    if (testResults.uniqueness?.hasOldPattern) {
      console.log('❌ OLD HARDCODED TEMPLATE STILL ACTIVE - Deployment issue');
    }
    if (testResults.uniqueness?.greetingsIdentical) {
      console.log('❌ Greetings are identical - No uniqueness');
    }
  }
  
  if (!issuesFound) {
    console.log('✅ No critical issues found!');
  }

  console.log('\nNEXT STEPS:');
  console.log('─'.repeat(40));
  
  if (!testResults.uniqueness?.success && testResults.uniqueness?.hasOldPattern) {
    console.log('🚨 CRITICAL: Edge function deployment did not take effect');
    console.log('   → User needs to manually deploy via Supabase dashboard');
    console.log('   → Or clear edge function cache');
  }
  
  if (testResults.passed === testResults.total) {
    console.log('🎉 ALL TESTS PASSED! System is ready for production use.');
  } else {
    console.log('⚠️  Some tests failed. Address issues above before production use.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Check environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

runAllTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});