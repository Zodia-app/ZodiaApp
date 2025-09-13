// Quick validation test - 3 requests with shorter timeout
const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

async function quickValidation() {
  console.log('🚀 QUICK VALIDATION: 3 Sequential Palm Reading Tests\n');
  
  const baseUrl = 'http://127.0.0.1:54321/functions/v1';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  const testUsers = [
    { name: 'Test1', dateOfBirth: '1990-01-15', zodiacSign: 'Capricorn' },
    { name: 'Test2', dateOfBirth: '1992-03-20', zodiacSign: 'Pisces' },
    { name: 'Test3', dateOfBirth: '1988-07-10', zodiacSign: 'Cancer' }
  ];

  let successCount = 0;
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`🧪 TEST ${i + 1}/3: ${user.name}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/generate-palm-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          userData: user,
          leftPalmImage: testImage,
          rightPalmImage: testImage
        })
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        if (data.reading && data.reading.greeting) {
          console.log(`   ✅ SUCCESS: ${responseTime}ms`);
          successCount++;
        } else {
          console.log(`   ❌ FAILED: Invalid structure, ${responseTime}ms`);
        }
      } else {
        console.log(`   ❌ FAILED: HTTP ${response.status}, ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
    
    if (i < testUsers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const successRate = (successCount / testUsers.length) * 100;
  console.log(`\n📊 SUCCESS RATE: ${successCount}/3 (${successRate.toFixed(1)}%)`);
  
  if (successRate === 100) {
    console.log('🟢 PERFECT: 100% success rate achieved!');
  } else if (successRate >= 67) {
    console.log('🟡 GOOD: Majority successful');
  } else {
    console.log('🔴 NEEDS WORK: Low success rate');
  }
  
  return successRate;
}

quickValidation()
  .then(rate => process.exit(rate >= 67 ? 0 : 1))
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });