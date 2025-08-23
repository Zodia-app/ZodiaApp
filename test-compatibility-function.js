// Test script to verify compatibility analysis edge function works
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testCompatibilityFunction() {
  console.log('🧪 Testing Compatibility Analysis Edge Function...');
  
  // First, create a compatibility code by storing it in the database
  console.log('📋 Step 1: Creating test compatibility code...');
  
  const testUserData = {
    code: 'TEST789XYZ',
    user_name: 'Maya',
    user_reading_result: {
      lines: {
        heartLine: { description: 'curves beautifully', meaning: 'loving nature' },
        lifeLine: { description: 'vibrant and long', meaning: 'strong energy' }
      },
      overallPersonality: 'Artistic and compassionate soul'
    }
  };
  
  // Store the test code first
  const storeResponse = await fetch(`${supabaseUrl}/rest/v1/compatibility_codes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      code: testUserData.code,
      user_name: testUserData.user_name,
      user_palm_data: testUserData.user_reading_result,
      user_reading_result: testUserData.user_reading_result,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    })
  });
  
  if (storeResponse.ok) {
    console.log('✅ Test compatibility code created successfully!');
  } else {
    console.log('⚠️ Could not create test code, but continuing test...');
  }
  
  console.log('📋 Step 2: Testing compatibility analysis...');
  
  // Mock user reading data (the person using the code)
  const userReading = {
    userData: { name: 'Alex', age: 25 },
    readingResult: {
      lines: {
        heartLine: { description: 'curves gracefully', meaning: 'emotional nature' },
        lifeLine: { description: 'strong and deep', meaning: 'vitality' }
      },
      overallPersonality: 'Creative and intuitive person'
    }
  };
  
  try {
    console.log('📡 Calling Supabase Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-compatibility-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userReading: userReading,
        partnerCode: testUserData.code,
        matchType: 'social'
      }),
    });
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('📊 Function Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ SUCCESS: Function returned compatibility analysis!');
      console.log('Partner Name:', result.partnerName);
      console.log('Overall Score:', result.compatibility?.overallScore);
      console.log('Categories:', result.compatibility?.categories?.length);
      console.log('🎉 OpenAI is accepting our entertainment-framed prompts!');
    } else {
      console.log('❌ FAILED:', result.error);
      if (result.error?.includes('palm') || result.error?.includes('reading')) {
        console.log('🚨 OpenAI may be rejecting palm reading content!');
      }
    }
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await fetch(`${supabaseUrl}/rest/v1/compatibility_codes?code=eq.${testUserData.code}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('💥 Error testing function:', error);
  }
}

// Check environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

testCompatibilityFunction();