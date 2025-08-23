// Test the updated palm reading function with stronger validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testPalmReadingValidation() {
  console.log('🧪 Testing Updated Palm Reading Function with Validation...\n');

  const testData = {
    userData: {
      name: 'ValidationTest',
      age: 30,
      dateOfBirth: '1993-08-23',
      zodiacSign: 'Virgo'
    },
    leftPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    rightPalmImage: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  };

  try {
    console.log('📡 Calling Palm Reading Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-palm-reading`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Palm reading failed:', error);
      return { success: false, error };
    }
    
    const result = await response.json();
    const reading = result.reading;
    
    console.log('✅ Palm reading generated successfully!');
    console.log('Model used:', result.model);
    
    // Check specific fields that were problematic
    console.log('\n🔍 Checking critical fields:');
    console.log('futureInsights present:', !!reading.futureInsights);
    console.log('futureInsights length:', reading.futureInsights?.length || 0);
    console.log('futureInsights content:', reading.futureInsights ? 'HAS CONTENT' : 'EMPTY');
    
    console.log('personalizedAdvice present:', !!reading.personalizedAdvice);
    console.log('personalizedAdvice length:', reading.personalizedAdvice?.length || 0);
    console.log('personalizedAdvice content:', reading.personalizedAdvice ? 'HAS CONTENT' : 'EMPTY');
    
    console.log('handComparison present:', !!reading.handComparison);
    console.log('handComparison length:', reading.handComparison?.length || 0);
    console.log('handComparison content:', reading.handComparison ? 'HAS CONTENT' : 'EMPTY');
    
    // Check if validation is working
    const validationResults = {
      futureInsights: reading.futureInsights && reading.futureInsights.trim().length > 10,
      personalizedAdvice: reading.personalizedAdvice && reading.personalizedAdvice.trim().length > 10,
      handComparison: reading.handComparison && reading.handComparison.trim().length > 10
    };
    
    console.log('\n📊 Validation Results:');
    console.log('futureInsights valid:', validationResults.futureInsights ? '✅' : '❌');
    console.log('personalizedAdvice valid:', validationResults.personalizedAdvice ? '✅' : '❌');
    console.log('handComparison valid:', validationResults.handComparison ? '✅' : '❌');
    
    const allValid = Object.values(validationResults).every(v => v);
    
    if (allValid) {
      console.log('\n🎉 ALL CRITICAL FIELDS ARE NOW WORKING!');
      console.log('✅ futureInsights: Meaningful predictions generated');
      console.log('✅ personalizedAdvice: Actionable advice provided'); 
      console.log('✅ handComparison: Hand analysis comparison included');
    } else {
      console.log('\n⚠️ Some fields still have issues - check validation');
    }
    
    return { 
      success: true, 
      allValid,
      fieldLengths: {
        futureInsights: reading.futureInsights?.length || 0,
        personalizedAdvice: reading.personalizedAdvice?.length || 0,
        handComparison: reading.handComparison?.length || 0
      }
    };
    
  } catch (error) {
    console.error('💥 Error testing palm reading:', error);
    return { success: false, error: error.message };
  }
}

// Check environment variables
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables! Make sure .env is set up.');
  process.exit(1);
}

testPalmReadingValidation().then(result => {
  if (result.success && result.allValid) {
    console.log('\n🎯 PALM READING VALIDATION FIX: SUCCESSFUL');
    console.log('The empty fields issue should now be resolved!');
  } else {
    console.log('\n⚠️ PALM READING VALIDATION: NEEDS MORE WORK');
  }
});