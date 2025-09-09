/**
 * Manual Friend Compatibility Tester
 * Use this to manually test specific parts of the friend compatibility flow
 * Run with: node test-friend-compatibility-manual.js [test-name]
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getZodiacSign(dateOfBirth) {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const zodiacSigns = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
  ];
  
  for (const zodiac of zodiacSigns) {
    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return zodiac.sign;
      }
    } else {
      const [startMonth, startDay] = zodiac.start;
      const [endMonth, endDay] = zodiac.end;
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return zodiac.sign;
      }
    }
  }
  
  return 'Unknown';
}

// Test 1: Basic friend data processing
async function testFriendDataProcessing() {
  log('Testing friend data processing...');
  
  const friendData = {
    name: 'Alice Johnson',
    dateOfBirth: '1995-06-15'
  };
  
  const age = calculateAge(friendData.dateOfBirth);
  const zodiacSign = getZodiacSign(friendData.dateOfBirth);
  
  log(`Friend: ${friendData.name}`);
  log(`Date of Birth: ${friendData.dateOfBirth}`);
  log(`Age: ${age}`);
  log(`Zodiac Sign: ${zodiacSign}`);
  
  if (age < 13) {
    log('⚠️  Warning: Age is below 13, should show validation error', 'warn');
  }
  
  log('✅ Friend data processing completed', 'success');
  return { ...friendData, age, zodiacSign };
}

// Test 2: Test palm reading generation
async function testPalmReadingGeneration() {
  log('Testing palm reading generation...');
  
  // Sample friend data
  const friendData = {
    name: 'Alice Johnson',
    dateOfBirth: '1995-06-15',
    age: 29,
    zodiacSign: 'Gemini'
  };
  
  // Mock palm images (in real app these would be actual photos)
  const palmData = {
    leftPalmImage: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    rightPalmImage: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    dominantHand: 'right'
  };
  
  const readingData = {
    userData: friendData,
    palmData: palmData
  };
  
  log('Calling palm reading edge function...');
  log('Request data:', JSON.stringify(readingData, null, 2));
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-palm-reading', {
      body: readingData
    });
    
    if (error) {
      log(`❌ Edge function error: ${JSON.stringify(error)}`, 'error');
      return null;
    }
    
    if (!data) {
      log('❌ No data returned from palm reading generation', 'error');
      return null;
    }
    
    log('✅ Palm reading generated successfully!', 'success');
    log('Reading data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check for required fields
    const requiredFields = ['life_line', 'heart_line', 'head_line', 'future_insights', 'personalized_advice'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim().length < 10);
    
    if (missingFields.length > 0) {
      log(`⚠️  Warning: Missing or empty fields: ${missingFields.join(', ')}`, 'warn');
    }
    
    return data;
    
  } catch (error) {
    log(`❌ Error generating palm reading: ${error.message}`, 'error');
    return null;
  }
}

// Test 3: Test database connectivity
async function testDatabaseConnection() {
  log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('palm_readings')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
    
    log('✅ Database connection successful', 'success');
    log(`Palm readings table accessible (${data?.length || 0} records)`);
    
    // Test user profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (profileError) {
      log(`⚠️  User profiles table not accessible: ${profileError.message}`, 'warn');
    } else {
      log('✅ User profiles table accessible', 'success');
    }
    
    return true;
    
  } catch (error) {
    log(`❌ Database test failed: ${error.message}`, 'error');
    return false;
  }
}

// Test 4: Test full friend compatibility flow simulation
async function testFullCompatibilityFlow() {
  log('Testing full friend compatibility flow...');
  
  // Step 1: Process friend data
  const friendData = await testFriendDataProcessing();
  
  // Step 2: Generate friend's palm reading
  const friendReading = await testPalmReadingGeneration();
  
  if (!friendReading) {
    log('❌ Cannot continue compatibility flow without palm reading', 'error');
    return;
  }
  
  // Step 3: Simulate user data (in real app this comes from existing reading)
  const userData = {
    name: 'Bob Smith',
    dateOfBirth: '1990-03-20',
    age: 34,
    zodiacSign: 'Pisces',
    palmReading: {
      life_line: 'Strong and clear',
      heart_line: 'Deep and curved',
      head_line: 'Long and straight',
      future_insights: 'Great opportunities ahead',
      personalized_advice: 'Trust your intuition',
      overall_reading: 'Positive and promising',
      confidence_score: 85
    }
  };
  
  log('User data:', JSON.stringify(userData, null, 2));
  log('Friend reading:', JSON.stringify(friendReading, null, 2));
  
  // Step 4: Simulate compatibility analysis
  const compatibilityScore = Math.floor(Math.random() * 40) + 60; // 60-100%
  
  log(`✅ Compatibility analysis complete!`, 'success');
  log(`Compatibility Score: ${compatibilityScore}%`);
  log(`User: ${userData.name} (${userData.zodiacSign})`);
  log(`Friend: ${friendData.name} (${friendData.zodiacSign})`);
  
  const compatibility = {
    overall_score: compatibilityScore,
    user: userData,
    friend: friendData,
    friend_reading: friendReading,
    analysis: {
      emotional_compatibility: Math.floor(Math.random() * 30) + 70,
      intellectual_compatibility: Math.floor(Math.random() * 35) + 65,
      life_path_alignment: Math.floor(Math.random() * 25) + 75
    }
  };
  
  return compatibility;
}

// Test 5: Environment validation
async function testEnvironmentSetup() {
  log('Testing environment setup...');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'error');
    return false;
  }
  
  log('✅ All required environment variables present', 'success');
  
  // Test Supabase connection
  const isConnected = await testDatabaseConnection();
  
  return isConnected;
}

// Test 6: Zodiac compatibility matrix
async function testZodiacCompatibility() {
  log('Testing zodiac compatibility calculations...');
  
  const zodiacPairs = [
    ['Aries', 'Leo'],
    ['Gemini', 'Pisces'],
    ['Cancer', 'Scorpio'],
    ['Virgo', 'Taurus'],
    ['Libra', 'Aquarius'],
    ['Sagittarius', 'Capricorn']
  ];
  
  zodiacPairs.forEach(([sign1, sign2]) => {
    // Simple compatibility scoring based on element compatibility
    const score = calculateZodiacCompatibility(sign1, sign2);
    log(`${sign1} + ${sign2}: ${score}% compatibility`);
  });
  
  log('✅ Zodiac compatibility test completed', 'success');
}

function calculateZodiacCompatibility(sign1, sign2) {
  const elements = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };
  
  const element1 = elements[sign1];
  const element2 = elements[sign2];
  
  // Compatible elements get higher scores
  const compatibility = {
    'Fire-Air': 85,
    'Air-Fire': 85,
    'Earth-Water': 80,
    'Water-Earth': 80,
    'Fire-Fire': 75,
    'Earth-Earth': 75,
    'Air-Air': 75,
    'Water-Water': 75,
    'Fire-Earth': 60,
    'Earth-Fire': 60,
    'Air-Water': 60,
    'Water-Air': 60,
    'Fire-Water': 50,
    'Water-Fire': 50,
    'Earth-Air': 55,
    'Air-Earth': 55
  };
  
  return compatibility[`${element1}-${element2}`] || 65;
}

// Main function to run specific tests
async function runTest(testName) {
  const tests = {
    'env': testEnvironmentSetup,
    'data': testFriendDataProcessing,
    'palm': testPalmReadingGeneration,
    'db': testDatabaseConnection,
    'full': testFullCompatibilityFlow,
    'zodiac': testZodiacCompatibility
  };
  
  if (!testName || testName === 'help') {
    console.log('Available tests:');
    console.log('  env    - Test environment setup and configuration');
    console.log('  data   - Test friend data processing and validation');
    console.log('  palm   - Test palm reading generation for friend');
    console.log('  db     - Test database connectivity');
    console.log('  full   - Run complete friend compatibility flow');
    console.log('  zodiac - Test zodiac compatibility calculations');
    console.log('  all    - Run all tests');
    console.log('\nUsage: node test-friend-compatibility-manual.js [test-name]');
    return;
  }
  
  if (testName === 'all') {
    log('Running all friend compatibility tests...');
    log('='.repeat(50));
    
    for (const [name, testFn] of Object.entries(tests)) {
      try {
        log(`\n🔍 Running test: ${name}`);
        await testFn();
      } catch (error) {
        log(`❌ Test ${name} failed: ${error.message}`, 'error');
      }
    }
    
    log('\n='.repeat(50));
    log('All tests completed!');
    return;
  }
  
  const testFunction = tests[testName];
  if (!testFunction) {
    log(`❌ Unknown test: ${testName}`, 'error');
    log('Use "help" to see available tests');
    return;
  }
  
  try {
    log(`Running test: ${testName}`);
    log('='.repeat(30));
    
    const result = await testFunction();
    
    log('='.repeat(30));
    if (result !== false) {
      log('✅ Test completed successfully!', 'success');
    }
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'error');
  }
}

// Get test name from command line arguments
const testName = process.argv[2] || 'help';
runTest(testName);