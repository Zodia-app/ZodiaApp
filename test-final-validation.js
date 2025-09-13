// Final validation test to confirm 100% success rate achievement
const fs = require('fs');

async function runExtensiveValidation() {
  console.log('🚀 FINAL VALIDATION: 100% Success Rate Achievement Test');
  console.log('Testing OpenAI content policy fix with multiple sequential requests');
  console.log('='.repeat(70));
  
  const baseUrl = 'http://127.0.0.1:54321/functions/v1';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  // Create a small test image
  const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  
  const testUsers = [
    { name: 'Alice', dateOfBirth: '1990-01-15', age: 34, zodiacSign: 'Capricorn' },
    { name: 'Bob', dateOfBirth: '1992-03-20', age: 32, zodiacSign: 'Pisces' },
    { name: 'Charlie', dateOfBirth: '1988-07-10', age: 36, zodiacSign: 'Cancer' },
    { name: 'Diana', dateOfBirth: '1985-11-02', age: 39, zodiacSign: 'Scorpio' },
    { name: 'Eve', dateOfBirth: '1993-05-18', age: 31, zodiacSign: 'Taurus' }
  ];

  let results = [];
  let successCount = 0;

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n🧪 TEST ${i + 1}/${testUsers.length}: ${user.name} (${user.zodiacSign})`);
    console.log('-'.repeat(50));
    
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
          userData: user,
          leftPalmImage: testImage,
          rightPalmImage: testImage
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        console.error(`❌ FAILED: ${user.name} - HTTP ${response.status}`);
        const errorText = await response.text();
        console.error(`📄 Error: ${errorText}`);
        
        results.push({
          user: user.name,
          success: false,
          responseTime,
          error: `HTTP ${response.status}: ${errorText}`
        });
      } else {
        const data = await response.json();
        
        if (data.reading && data.reading.greeting) {
          console.log(`✅ SUCCESS: ${user.name} - ${responseTime}ms`);
          console.log(`📊 Content: ${JSON.stringify(data.reading).length} chars`);
          console.log(`👋 Greeting: ${data.reading.greeting.substring(0, 60)}...`);
          
          successCount++;
          results.push({
            user: user.name,
            success: true,
            responseTime,
            contentLength: JSON.stringify(data.reading).length
          });
        } else {
          console.error(`❌ FAILED: ${user.name} - Invalid response structure`);
          results.push({
            user: user.name,
            success: false,
            responseTime,
            error: 'Invalid response structure'
          });
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ FAILED: ${user.name} - ${error.message}`);
      
      results.push({
        user: user.name,
        success: false,
        responseTime,
        error: error.message
      });
    }
    
    // Small delay between requests
    if (i < testUsers.length - 1) {
      console.log('⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final results
  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL VALIDATION RESULTS');
  console.log('='.repeat(70));
  
  const successRate = (successCount / testUsers.length) * 100;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`\n🎯 SUCCESS RATE: ${successCount}/${testUsers.length} (${successRate.toFixed(1)}%)`);
  console.log(`⏱️  AVERAGE RESPONSE TIME: ${Math.round(avgResponseTime)}ms`);
  
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach((result, i) => {
    const status = result.success ? '✅' : '❌';
    const details = result.success 
      ? `${result.responseTime}ms, ${result.contentLength} chars`
      : `${result.responseTime}ms, Error: ${result.error}`;
    console.log(`   ${status} ${result.user}: ${details}`);
  });
  
  // Assessment
  console.log(`\n🔍 ASSESSMENT:`);
  if (successRate === 100) {
    console.log('🟢 PERFECT: 100% SUCCESS RATE ACHIEVED!');
    console.log('   ✅ OpenAI content policy issue completely resolved');
    console.log('   ✅ Edge function reliability confirmed');
    console.log('   ✅ System ready for production deployment');
  } else if (successRate >= 80) {
    console.log('🟡 GOOD: High success rate achieved');
    console.log('   ✅ Significant improvement from OpenAI content policy fix');
    console.log('   ⚠️  Some edge cases may still need monitoring');
  } else {
    console.log('🔴 NEEDS WORK: Success rate below expectations');
    console.log('   ❌ Additional fixes required');
  }
  
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(`\n❌ FAILURE ANALYSIS (${failures.length} failures):`);
    failures.forEach(failure => {
      console.log(`   • ${failure.user}: ${failure.error}`);
    });
  }
  
  return successRate === 100;
}

// Run the validation
runExtensiveValidation()
  .then(success => {
    console.log(`\n🏁 Final Validation ${success ? 'PASSED' : 'FAILED'}`);
    console.log(success ? 
      '🎉 ACHIEVEMENT UNLOCKED: 100% Success Rate on Palm Reading Edge Function!' :
      '⚠️  Additional work needed to reach 100% success rate target'
    );
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Validation test crashed:', error);
    process.exit(1);
  });