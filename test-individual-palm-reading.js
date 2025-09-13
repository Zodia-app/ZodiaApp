// Test individual palm reading to diagnose the exact failure
const fs = require('fs');

async function testIndividualPalmReading() {
  console.log('🧪 Testing Individual Palm Reading for Error Analysis...\n');
  
  const baseUrl = 'http://127.0.0.1:54321/functions/v1';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  // Create a small test image (1x1 pixel PNG)
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  const userData = {
    name: 'TestUser',
    dateOfBirth: '1990-01-15',
    age: 34,
    zodiacSign: 'Capricorn'
  };

  console.log('📡 Making single palm reading request...');
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/generate-palm-reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        userData,
        leftPalmImage: testImage,
        rightPalmImage: testImage
      })
    });

    const responseTime = Date.now() - startTime;
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`🔗 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    let responseText;
    try {
      responseText = await response.text();
      console.log(`📝 Raw Response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
    } catch (textError) {
      console.error('❌ Failed to read response text:', textError);
      return false;
    }

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} - ${response.statusText}`);
      console.error(`📄 Error Body: ${responseText}`);
      return false;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error(`📄 Response Text: ${responseText}`);
      return false;
    }

    if (data.reading && data.reading.greeting) {
      console.log('✅ SUCCESS: Palm reading completed successfully');
      console.log(`📊 Content Length: ${JSON.stringify(data.reading).length} characters`);
      console.log(`👋 Greeting: ${data.reading.greeting.substring(0, 100)}...`);
      return true;
    } else {
      console.error('❌ Invalid Response Structure:', data);
      return false;
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ Request Failed after ${responseTime}ms:`, error.message);
    console.error('🔍 Error Details:', error);
    return false;
  }
}

// Run 3 individual tests with delays between them
async function runSequentialTests() {
  console.log('🚀 Running 3 Sequential Individual Palm Reading Tests\n');
  
  let successCount = 0;
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🧪 TEST ${i}/3:`);
    console.log('='.repeat(40));
    
    const success = await testIndividualPalmReading();
    if (success) {
      successCount++;
    }
    
    if (i < 3) {
      console.log('\n⏳ Waiting 5 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEQUENTIAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Success Rate: ${successCount}/3 (${(successCount/3*100).toFixed(1)}%)`);
  
  if (successCount === 3) {
    console.log('🟢 EXCELLENT: All individual requests succeeded');
  } else if (successCount >= 2) {
    console.log('🟡 GOOD: Most requests succeeded');
  } else if (successCount >= 1) {
    console.log('🟠 CONCERNING: Only some requests succeeded');
  } else {
    console.log('🔴 CRITICAL: No requests succeeded');
  }
  
  return successCount >= 2;
}

runSequentialTests()
  .then(success => {
    console.log(`\n🏁 Sequential Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });