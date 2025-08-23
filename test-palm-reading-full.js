// Comprehensive test for palm reading functionality
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Test palm images (base64)
const leftPalmBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // 1x1 transparent png
const rightPalmBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // 1x1 transparent png

async function testPalmReadingFunction() {
  console.log('🧪 Testing Palm Reading Edge Function...');
  
  const userData = {
    name: 'TestUser',
    age: 25,
    dateOfBirth: '1998-08-23',
    zodiacSign: 'Virgo'
  };

  try {
    console.log('📡 Calling Palm Reading Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-palm-reading`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        leftPalmImage: leftPalmBase64,
        rightPalmImage: rightPalmBase64
      }),
    });
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    
    if (response.ok && result.reading) {
      console.log('✅ SUCCESS: Palm reading generated!');
      console.log('Model used:', result.model);
      console.log('Based on actual images:', result.basedOnActualImages);
      
      // Check required structure
      const reading = result.reading;
      if (reading.lines && reading.mounts && reading.specialMarkings) {
        console.log('✅ Reading structure is complete');
        console.log('Lines count:', Object.keys(reading.lines).length);
        console.log('Mounts count:', Object.keys(reading.mounts).length);
        console.log('Special markings count:', reading.specialMarkings.length);
        
        return { success: true, reading, userData };
      } else {
        console.log('❌ FAILED: Incomplete reading structure');
        return { success: false, error: 'Incomplete structure' };
      }
      
    } else {
      console.log('❌ FAILED:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('💥 Error testing palm reading:', error);
    return { success: false, error: error.message };
  }
}

async function testDatabaseStorage() {
  console.log('🗄️ Testing Palm Reading Database Storage...');
  
  const testData = {
    name: 'TestUser',
    date_of_birth: '1998-08-23',
    reading_content: {
      lines: { heartLine: 'test' },
      mounts: { venus: 'test' },
      specialMarkings: ['test']
    },
    reading_metadata: { model: 'test', version: '1.0' },
    based_on_actual_images: true,
    status: 'completed'
  };
  
  try {
    // Store palm reading
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/palm_readings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });
    
    if (storeResponse.ok) {
      const stored = await storeResponse.json();
      console.log('✅ Palm reading stored in database');
      console.log('Record ID:', stored[0]?.id);
      
      // Clean up test data
      await fetch(`${supabaseUrl}/rest/v1/palm_readings?id=eq.${stored[0]?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      console.log('🧹 Test data cleaned up');
      
      return { success: true };
    } else {
      const error = await storeResponse.text();
      console.log('❌ FAILED to store in database:', error);
      return { success: false, error };
    }
    
  } catch (error) {
    console.error('💥 Error testing database storage:', error);
    return { success: false, error: error.message };
  }
}

async function testCompatibilityCodesStorage() {
  console.log('🔗 Testing Compatibility Codes Storage...');
  
  const testCode = {
    code: 'TEST123ABC',
    user_name: 'TestUser',
    user_palm_data: { test: 'data' },
    user_reading_result: { test: 'result' },
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  try {
    // Store compatibility code
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/compatibility_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testCode)
    });
    
    if (storeResponse.ok) {
      const stored = await storeResponse.json();
      console.log('✅ Compatibility code stored in database');
      console.log('Code ID:', stored[0]?.id);
      console.log('Code:', stored[0]?.code);
      
      // Clean up test data
      await fetch(`${supabaseUrl}/rest/v1/compatibility_codes?id=eq.${stored[0]?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      console.log('🧹 Test compatibility code cleaned up');
      
      return { success: true };
    } else {
      const error = await storeResponse.text();
      console.log('❌ FAILED to store compatibility code:', error);
      return { success: false, error };
    }
    
  } catch (error) {
    console.error('💥 Error testing compatibility codes storage:', error);
    return { success: false, error: error.message };
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Palm Reading Tests...\n');
  
  // Test 1: Palm reading function
  const palmTest = await testPalmReadingFunction();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Database storage
  const dbTest = await testDatabaseStorage();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Compatibility codes storage
  const codesTest = await testCompatibilityCodesStorage();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log('Palm Reading Function:', palmTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('Database Storage:', dbTest.success ? '✅ PASS' : '❌ FAIL');
  console.log('Compatibility Codes:', codesTest.success ? '✅ PASS' : '❌ FAIL');
  
  if (palmTest.success && dbTest.success && codesTest.success) {
    console.log('\n🎉 ALL TESTS PASSED! Full system is working correctly.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Check logs above for details.');
  }
  
  return palmTest.success && dbTest.success && codesTest.success;
}

// Check environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

runAllTests();