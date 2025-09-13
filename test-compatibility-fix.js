// Test script to verify compatibility analysis fixes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTE3NTM4Mjg2MjAsImV4cCI6MjA2OTQwNDYyMH0.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';

const supabase = createClient(supabaseUrl, supabaseKey);

const testUserData = {
  name: 'TestUser1',
  dateOfBirth: '1990-01-15',
  age: 34,
  zodiacSign: 'Capricorn'
};

const testFriendData = {
  name: 'TestUser2', 
  dateOfBirth: '1992-03-20',
  age: 32,
  zodiacSign: 'Pisces'
};

// Mock palm reading data
const mockPalmReading = {
  greeting: "Hello! Your palms reveal fascinating insights.",
  overallPersonality: "You have a balanced and thoughtful personality.",
  lines: {
    lifeLine: { name: "Life Line", description: "Strong and clear", meaning: "Vitality" },
    heartLine: { name: "Heart Line", description: "Deep emotional capacity", meaning: "Love" }
  },
  mounts: {
    jupiter: { name: "Mount of Jupiter", prominence: "Well-developed" }
  },
  futureInsights: "Bright prospects ahead in career and relationships.",
  personalizedAdvice: "Trust your instincts and embrace new opportunities."
};

async function testCompatibilityAnalysis() {
  console.log('🧪 Testing Compatibility Analysis with Rate Limit Fixes...\n');
  
  try {
    console.log('📡 Calling compatibility analysis edge function...');
    
    const response = await supabase.functions.invoke('generate-compatibility-analysis', {
      body: {
        directMode: true,
        matchType: 'friend',
        userReading: {
          userData: testUserData,
          readingResult: mockPalmReading
        },
        partnerReading: {
          userData: testFriendData,
          readingResult: mockPalmReading
        }
      }
    });

    if (response.error) {
      console.error('❌ Compatibility analysis failed:', response.error);
      return false;
    }

    if (response.data?.success) {
      console.log('✅ Compatibility analysis succeeded!');
      console.log('📊 Results:');
      console.log(`   Partner Name: ${response.data.partnerName}`);
      console.log(`   Overall Score: ${response.data.compatibility?.overallScore}%`);
      console.log(`   Overall Label: ${response.data.compatibility?.overallLabel}`);
      console.log(`   Categories: ${response.data.compatibility?.categories?.length || 0} analyzed`);
      console.log(`   Insights: ${response.data.compatibility?.insights?.length || 0} provided`);
      return true;
    } else {
      console.error('❌ Unexpected response format:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('   Details:', error);
    return false;
  }
}

async function testPalmReadingEdgeFunction() {
  console.log('🧪 Testing Palm Reading Edge Function...\n');
  
  try {
    console.log('📡 Calling palm reading edge function...');
    
    // Use small test images (base64 encoded 1x1 pixel)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await supabase.functions.invoke('generate-palm-reading', {
      body: {
        userData: testUserData,
        leftPalmImage: testImageBase64,
        rightPalmImage: testImageBase64
      }
    });

    if (response.error) {
      console.error('❌ Palm reading failed:', response.error);
      return false;
    }

    if (response.data?.reading) {
      console.log('✅ Palm reading succeeded!');
      console.log('📊 Reading structure:');
      console.log(`   Greeting: ${response.data.reading.greeting ? 'Present' : 'Missing'}`);
      console.log(`   Personality: ${response.data.reading.overallPersonality ? 'Present' : 'Missing'}`);
      console.log(`   Lines: ${Object.keys(response.data.reading.lines || {}).length} analyzed`);
      console.log(`   Mounts: ${Object.keys(response.data.reading.mounts || {}).length} analyzed`);
      return true;
    } else {
      console.error('❌ Unexpected palm reading response:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ Palm reading test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Compatibility Fix Validation Tests\n');
  console.log('=' .repeat(60));
  
  const palmReadingOk = await testPalmReadingEdgeFunction();
  console.log('\n' + '-'.repeat(60) + '\n');
  
  const compatibilityOk = await testCompatibilityAnalysis();
  console.log('\n' + '='.repeat(60));
  
  console.log('\n📋 TEST SUMMARY:');
  console.log(`   Palm Reading: ${palmReadingOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Compatibility: ${compatibilityOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (palmReadingOk && compatibilityOk) {
    console.log('\n🎉 ALL TESTS PASSED - Compatibility fix is working!');
    return true;
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Further investigation needed');
    return false;
  }
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });