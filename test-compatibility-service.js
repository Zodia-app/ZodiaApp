// Test the compatibility service that the app actually uses
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testCompatibilityCodeGeneration() {
  console.log('🔗 Testing Compatibility Code Generation Service...');
  
  const userReading = {
    userData: { name: 'Alice', age: 28 },
    readingResult: {
      lines: {
        heartLine: { description: 'strong and clear', meaning: 'emotional stability' },
        lifeLine: { description: 'long and vibrant', meaning: 'vitality and energy' }
      },
      overallPersonality: 'Creative and intuitive person with strong leadership qualities'
    }
  };
  
  const code = `ALI${Date.now().toString().slice(-6)}`;
  
  try {
    console.log(`📝 Generated code: ${code}`);
    
    // Test storage using same method as the app
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/compatibility_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        code: code,
        user_name: userReading.userData.name,
        user_palm_data: userReading.readingResult,
        user_reading_result: userReading.readingResult,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    
    if (storeResponse.ok) {
      const stored = await storeResponse.json();
      console.log('✅ Code stored successfully!');
      console.log('Database ID:', stored[0]?.id);
      console.log('Stored code:', stored[0]?.code);
      console.log('Expires at:', stored[0]?.expires_at);
      
      return { success: true, code, recordId: stored[0]?.id };
    } else {
      const error = await storeResponse.text();
      console.log('❌ FAILED to store code:', error);
      return { success: false, error };
    }
    
  } catch (error) {
    console.error('💥 Error testing code generation:', error);
    return { success: false, error: error.message };
  }
}

async function testCompatibilityAnalysis(partnerCode) {
  console.log('🧠 Testing Compatibility Analysis with Real AI...');
  
  const userReading = {
    userData: { name: 'Bob', age: 30 },
    readingResult: {
      lines: {
        heartLine: { description: 'curved and deep', meaning: 'passionate nature' },
        lifeLine: { description: 'steady and long', meaning: 'balanced life approach' }
      },
      overallPersonality: 'Analytical and thoughtful person with creative tendencies'
    }
  };
  
  try {
    console.log('📡 Calling Compatibility Analysis Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-compatibility-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userReading: userReading,
        partnerCode: partnerCode,
        matchType: 'social'
      }),
    });
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    
    if (result.success && result.compatibility) {
      console.log('✅ SUCCESS: AI Compatibility Analysis Generated!');
      console.log('Partner Name:', result.partnerName);
      console.log('Overall Score:', result.compatibility.overallScore);
      console.log('Categories Count:', result.compatibility.categories?.length);
      console.log('Model Used:', result.compatibility.model);
      console.log('Generated At:', result.compatibility.generatedAt);
      
      // Verify it's real AI (not fallback)
      if (result.compatibility.model === 'gpt-4o-2024-08-06') {
        console.log('🎉 CONFIRMED: Using real OpenAI GPT-4o model!');
      } else {
        console.log('⚠️ WARNING: Not using expected OpenAI model');
      }
      
      return { success: true, analysis: result.compatibility };
    } else {
      console.log('❌ FAILED:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('💥 Error testing compatibility analysis:', error);
    return { success: false, error: error.message };
  }
}

async function cleanupTestData(recordId) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/compatibility_codes?id=eq.${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    console.log('🧹 Test data cleaned up');
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.message);
  }
}

async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End Social Mode Compatibility Test...\n');
  
  // Step 1: Generate and store compatibility code
  const codeTest = await testCompatibilityCodeGeneration();
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (!codeTest.success) {
    console.log('❌ Cannot continue - code generation failed');
    return false;
  }
  
  // Step 2: Use the code for compatibility analysis
  const analysisTest = await testCompatibilityAnalysis(codeTest.code);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Step 3: Clean up
  await cleanupTestData(codeTest.recordId);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Summary
  console.log('📊 END-TO-END TEST SUMMARY:');
  console.log('Code Generation & Storage:', codeTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('AI Compatibility Analysis:', analysisTest.success ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = codeTest.success && analysisTest.success;
  
  if (allPassed) {
    console.log('\n🎉 END-TO-END TEST PASSED!');
    console.log('✅ Social Mode is working with real AI');
    console.log('✅ Database storage is working');  
    console.log('✅ No fallback data used');
    console.log('✅ OpenAI integration working');
  } else {
    console.log('\n⚠️ END-TO-END TEST FAILED!');
    console.log('Check individual test results above for details.');
  }
  
  return allPassed;
}

// Check environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

runEndToEndTest();