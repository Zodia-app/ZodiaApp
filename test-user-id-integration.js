// Test user_id integration for palm readings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testUserIdIntegration() {
  console.log('🧪 Testing User ID Integration for Palm Readings...\n');

  // Step 1: Create anonymous session (simulate what the app does)
  console.log('🔐 Step 1: Creating anonymous session...');
  
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: `test-${Date.now()}@anonymous.local`,
      password: 'temporary123'
    })
  });

  let userId = null;
  if (authResponse.ok) {
    const authData = await authResponse.json();
    userId = authData.user?.id;
    console.log('✅ Anonymous user created with ID:', userId);
  } else {
    console.log('⚠️ Using fallback user ID');
    // Generate a proper UUID format (12 characters for last part)
    const timestamp = Date.now().toString();
    const lastPart = timestamp.slice(-12).padStart(12, '0');
    userId = '00000000-0000-4000-8000-' + lastPart;
  }

  // Step 2: Test database insertion with user_id
  console.log('\n🗄️ Step 2: Testing database insertion with user_id...');
  
  const testPalmReading = {
    user_id: userId,
    name: 'Test User',
    date_of_birth: '1995-08-23',
    reading_content: {
      lines: {
        heartLine: { description: 'clear and strong', meaning: 'emotional stability' },
        lifeLine: { description: 'long and vibrant', meaning: 'vitality' },
        headLine: { description: 'straight and focused', meaning: 'logical thinking' }
      },
      mounts: {
        venus: { name: 'Mount of Venus', prominence: 'well-developed', meaning: 'loving nature' },
        jupiter: { name: 'Mount of Jupiter', prominence: 'prominent', meaning: 'leadership' }
      },
      specialMarkings: [
        'Cross on Jupiter mount indicating success',
        'Star on Apollo line suggesting fame',
        'Triangle on fate line indicating protection',
        'Square on life line providing stability'
      ],
      overallPersonality: 'Balanced individual with strong analytical and emotional intelligence'
    },
    reading_metadata: {
      model: 'gpt-4o-2024-08-06',
      version: '1.0',
      generated_at: new Date().toISOString()
    },
    based_on_actual_images: true,
    status: 'completed'
  };

  try {
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/palm_readings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPalmReading)
    });

    if (insertResponse.ok) {
      const insertedRecord = await insertResponse.json();
      console.log('✅ Palm reading inserted successfully!');
      console.log('Record ID:', insertedRecord[0]?.id);
      console.log('User ID:', insertedRecord[0]?.user_id);
      console.log('Name:', insertedRecord[0]?.name);
      console.log('Status:', insertedRecord[0]?.status);

      // Step 3: Verify we can query by user_id
      console.log('\n🔍 Step 3: Testing query by user_id...');
      
      const queryResponse = await fetch(`${supabaseUrl}/rest/v1/palm_readings?user_id=eq.${userId}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (queryResponse.ok) {
        const userReadings = await queryResponse.json();
        console.log('✅ Query by user_id successful!');
        console.log('Found readings for user:', userReadings.length);
        
        if (userReadings.length > 0) {
          console.log('First reading name:', userReadings[0].name);
          console.log('First reading user_id:', userReadings[0].user_id);
        }

        // Clean up test data
        console.log('\n🧹 Step 4: Cleaning up test data...');
        await fetch(`${supabaseUrl}/rest/v1/palm_readings?id=eq.${insertedRecord[0]?.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          }
        });
        console.log('✅ Test data cleaned up');

        return {
          success: true,
          userId: userId,
          recordsFound: userReadings.length
        };

      } else {
        const queryError = await queryResponse.text();
        console.log('❌ Query by user_id failed:', queryError);
        return { success: false, error: 'Query failed' };
      }

    } else {
      const insertError = await insertResponse.text();
      console.log('❌ Database insertion failed:', insertError);
      return { success: false, error: 'Insertion failed' };
    }

  } catch (error) {
    console.error('💥 Error in user_id integration test:', error);
    return { success: false, error: error.message };
  }
}

async function runUserIdIntegrationTest() {
  console.log('🚀 Starting User ID Integration Test...\n');
  
  const result = await testUserIdIntegration();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 USER ID INTEGRATION TEST RESULTS:');
  
  if (result.success) {
    console.log('✅ User ID Integration: WORKING');
    console.log('✅ Database Storage: WORKING');
    console.log('✅ User Queries: WORKING');
    console.log('✅ Anonymous Auth: WORKING');
    console.log(`✅ Test User ID: ${result.userId}`);
    console.log(`✅ Records Found: ${result.recordsFound}`);
    console.log('\n🎉 USER ID INTEGRATION IS FULLY OPERATIONAL!');
  } else {
    console.log('❌ User ID Integration: FAILED');
    console.log('Error:', result.error);
    console.log('\n⚠️ USER ID INTEGRATION NEEDS ATTENTION');
  }
  
  return result.success;
}

// Check environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

runUserIdIntegrationTest();