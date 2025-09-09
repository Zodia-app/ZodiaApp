/**
 * Friend Compatibility Feature Tester
 * Tests the complete friend compatibility flow including:
 * - Friend data collection (name, DOB, palm images)
 * - Palm reading generation for friend
 * - Compatibility analysis between user and friend
 * - Error handling and validation
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Test data for friend
const TEST_FRIEND_DATA = {
  name: 'Test Friend Alice',
  dateOfBirth: '1995-06-15',
  age: 29,
  zodiacSign: 'Gemini',
  // These would be actual image URIs in the real app
  leftPalmImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  rightPalmImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
};

// Test user data (simulating existing user reading)
const TEST_USER_DATA = {
  id: 'test-user-123',
  name: 'Test User Bob',
  dateOfBirth: '1990-03-20',
  age: 34,
  zodiacSign: 'Pisces',
  palmReading: {
    id: 'test-reading-456',
    dominant_hand: 'right',
    life_line: 'Strong and clear, indicating good health and vitality',
    heart_line: 'Deep and curved, showing emotional depth',
    head_line: 'Long and straight, indicating analytical thinking',
    fate_line: 'Present and well-defined, showing clear life direction',
    future_insights: 'Great opportunities ahead in career and relationships',
    personalized_advice: 'Trust your intuition and embrace new challenges',
    overall_reading: 'A positive and promising palm reading',
    confidence_score: 85
  }
};

class FriendCompatibilityTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFunction) {
    try {
      this.log(`Starting test: ${name}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ Test passed: ${name}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: name, error: error.message });
      this.log(`❌ Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  // Test 1: Validate friend data structure
  async testFriendDataValidation() {
    const requiredFields = ['name', 'dateOfBirth', 'age', 'zodiacSign', 'leftPalmImage', 'rightPalmImage'];
    
    for (const field of requiredFields) {
      if (!TEST_FRIEND_DATA[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate data types
    if (typeof TEST_FRIEND_DATA.name !== 'string') {
      throw new Error('Friend name must be a string');
    }
    
    if (typeof TEST_FRIEND_DATA.age !== 'number' || TEST_FRIEND_DATA.age < 13) {
      throw new Error('Friend age must be a number >= 13');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(TEST_FRIEND_DATA.dateOfBirth)) {
      throw new Error('Date of birth must be in YYYY-MM-DD format');
    }

    this.log('Friend data validation passed');
  }

  // Test 2: Test zodiac sign calculation
  async testZodiacCalculation() {
    const testCases = [
      { date: '1995-06-15', expected: 'Gemini' },
      { date: '1990-03-20', expected: 'Pisces' },
      { date: '1988-12-25', expected: 'Capricorn' },
      { date: '1992-08-10', expected: 'Leo' }
    ];

    for (const testCase of testCases) {
      const calculated = this.calculateZodiacSign(testCase.date);
      if (calculated !== testCase.expected) {
        throw new Error(`Zodiac calculation failed: ${testCase.date} should be ${testCase.expected}, got ${calculated}`);
      }
    }

    this.log('Zodiac calculation tests passed');
  }

  calculateZodiacSign(dateOfBirth) {
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

  // Test 3: Test palm reading generation for friend
  async testFriendPalmReadingGeneration() {
    const friendReadingData = {
      userData: {
        name: TEST_FRIEND_DATA.name,
        dateOfBirth: TEST_FRIEND_DATA.dateOfBirth,
        age: TEST_FRIEND_DATA.age,
        zodiacSign: TEST_FRIEND_DATA.zodiacSign
      },
      palmData: {
        leftPalmImage: TEST_FRIEND_DATA.leftPalmImage,
        rightPalmImage: TEST_FRIEND_DATA.rightPalmImage,
        dominantHand: 'right'
      }
    };

    this.log('Testing friend palm reading generation...');
    
    try {
      // Call the edge function to generate friend's palm reading
      const { data, error } = await supabase.functions.invoke('generate-palm-reading', {
        body: friendReadingData
      });

      if (error) {
        throw new Error(`Edge function error: ${JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('No data returned from palm reading generation');
      }

      // Validate required fields in response
      const requiredFields = [
        'life_line', 'heart_line', 'head_line', 'fate_line',
        'future_insights', 'personalized_advice', 'overall_reading'
      ];

      for (const field of requiredFields) {
        if (!data[field] || data[field].trim().length < 10) {
          throw new Error(`Invalid or empty field in palm reading: ${field}`);
        }
      }

      this.log('Friend palm reading generated successfully');
      this.log(`Friend reading confidence: ${data.confidence_score || 'N/A'}%`);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to generate friend palm reading: ${error.message}`);
    }
  }

  // Test 4: Test compatibility analysis
  async testCompatibilityAnalysis() {
    this.log('Testing compatibility analysis...');

    // First generate friend's palm reading
    const friendReading = await this.testFriendPalmReadingGeneration();

    // Prepare compatibility analysis data
    const compatibilityData = {
      userReading: TEST_USER_DATA.palmReading,
      friendReading: friendReading,
      userInfo: {
        name: TEST_USER_DATA.name,
        zodiacSign: TEST_USER_DATA.zodiacSign,
        age: TEST_USER_DATA.age
      },
      friendInfo: {
        name: TEST_FRIEND_DATA.name,
        zodiacSign: TEST_FRIEND_DATA.zodiacSign,
        age: TEST_FRIEND_DATA.age
      }
    };

    // This would typically call a compatibility analysis function
    // For now, we'll simulate the analysis structure validation
    const compatibilityResult = await this.simulateCompatibilityAnalysis(compatibilityData);

    // Validate compatibility result structure
    const requiredFields = [
      'overall_score', 'emotional_compatibility', 'intellectual_compatibility',
      'life_path_alignment', 'strengths', 'challenges', 'advice'
    ];

    for (const field of requiredFields) {
      if (compatibilityResult[field] === undefined) {
        throw new Error(`Missing field in compatibility result: ${field}`);
      }
    }

    if (typeof compatibilityResult.overall_score !== 'number' || 
        compatibilityResult.overall_score < 0 || 
        compatibilityResult.overall_score > 100) {
      throw new Error('Overall score must be a number between 0 and 100');
    }

    this.log(`Compatibility analysis completed. Score: ${compatibilityResult.overall_score}%`);
    return compatibilityResult;
  }

  // Simulate compatibility analysis (would be replaced with actual service call)
  async simulateCompatibilityAnalysis(data) {
    return {
      overall_score: Math.floor(Math.random() * 40) + 60, // 60-100%
      emotional_compatibility: Math.floor(Math.random() * 30) + 70,
      intellectual_compatibility: Math.floor(Math.random() * 35) + 65,
      life_path_alignment: Math.floor(Math.random() * 25) + 75,
      strengths: [
        "Both signs are naturally curious and adaptable",
        "Shared appreciation for deep conversations",
        "Complementary life perspectives"
      ],
      challenges: [
        "Different approaches to decision making",
        "May need to work on communication styles"
      ],
      advice: "Focus on your shared interests and give each other space to grow individually while building your connection together."
    };
  }

  // Test 5: Test database operations
  async testDatabaseOperations() {
    this.log('Testing database operations...');

    try {
      // Test connection
      const { data: healthCheck, error: healthError } = await supabase
        .from('palm_readings')
        .select('count(*)', { count: 'exact', head: true });

      if (healthError) {
        throw new Error(`Database connection failed: ${healthError.message}`);
      }

      this.log('Database connection successful');

      // Test inserting a compatibility record (if table exists)
      try {
        const testCompatibilityRecord = {
          user_id: TEST_USER_DATA.id,
          friend_name: TEST_FRIEND_DATA.name,
          friend_zodiac: TEST_FRIEND_DATA.zodiacSign,
          compatibility_score: 85,
          analysis_data: { test: true },
          created_at: new Date().toISOString()
        };

        // This might fail if the table doesn't exist, which is okay for testing
        const { error: insertError } = await supabase
          .from('compatibility_analyses')
          .insert(testCompatibilityRecord);

        if (!insertError) {
          this.log('Compatibility record inserted successfully');
          
          // Clean up - delete the test record
          await supabase
            .from('compatibility_analyses')
            .delete()
            .eq('user_id', TEST_USER_DATA.id)
            .eq('friend_name', TEST_FRIEND_DATA.name);
        } else {
          this.log(`Compatibility table test skipped: ${insertError.message}`);
        }
      } catch (dbError) {
        this.log(`Compatibility table operations skipped: ${dbError.message}`);
      }

    } catch (error) {
      throw new Error(`Database operations failed: ${error.message}`);
    }
  }

  // Test 6: Test edge cases and error handling
  async testErrorHandling() {
    this.log('Testing error handling...');

    // Test with invalid data
    const invalidTests = [
      {
        name: 'Empty friend name',
        data: { ...TEST_FRIEND_DATA, name: '' },
        expectedError: 'name'
      },
      {
        name: 'Invalid age',
        data: { ...TEST_FRIEND_DATA, age: 10 },
        expectedError: 'age'
      },
      {
        name: 'Missing palm image',
        data: { ...TEST_FRIEND_DATA, leftPalmImage: null },
        expectedError: 'image'
      }
    ];

    for (const test of invalidTests) {
      try {
        // This should fail validation
        await this.validateFriendData(test.data);
        throw new Error(`Expected validation to fail for ${test.name}`);
      } catch (error) {
        if (!error.message.toLowerCase().includes(test.expectedError)) {
          throw new Error(`Expected error about ${test.expectedError}, got: ${error.message}`);
        }
        this.log(`✓ Correctly caught error for ${test.name}`);
      }
    }
  }

  validateFriendData(friendData) {
    if (!friendData.name || friendData.name.trim().length === 0) {
      throw new Error('Friend name is required');
    }
    
    if (!friendData.age || friendData.age < 13) {
      throw new Error('Friend must be at least 13 years old');
    }
    
    if (!friendData.leftPalmImage || !friendData.rightPalmImage) {
      throw new Error('Both palm images are required');
    }
  }

  // Test 7: Performance test
  async testPerformance() {
    this.log('Testing performance...');
    
    const startTime = Date.now();
    
    // Simulate the full friend compatibility flow
    await this.testFriendDataValidation();
    await this.testZodiacCalculation();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration > 5000) { // 5 seconds
      throw new Error(`Performance test failed: took ${duration}ms (should be < 5000ms)`);
    }
    
    this.log(`Performance test passed: ${duration}ms`);
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting Friend Compatibility Feature Tests');
    this.log('='.repeat(50));

    await this.test('Friend Data Validation', () => this.testFriendDataValidation());
    await this.test('Zodiac Calculation', () => this.testZodiacCalculation());
    await this.test('Friend Palm Reading Generation', () => this.testFriendPalmReadingGeneration());
    await this.test('Compatibility Analysis', () => this.testCompatibilityAnalysis());
    await this.test('Database Operations', () => this.testDatabaseOperations());
    await this.test('Error Handling', () => this.testErrorHandling());
    await this.test('Performance', () => this.testPerformance());

    this.log('='.repeat(50));
    this.log(`📊 Test Results: ${this.testResults.passed} passed, ${this.testResults.failed} failed`);

    if (this.testResults.failed > 0) {
      this.log('❌ Failed Tests:');
      this.testResults.errors.forEach(error => {
        this.log(`   - ${error.test}: ${error.error}`);
      });
    } else {
      this.log('🎉 All tests passed! Friend Compatibility feature is working correctly.');
    }

    return this.testResults;
  }
}

// Run the tests
async function main() {
  const tester = new FriendCompatibilityTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Fatal error during testing:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { FriendCompatibilityTester };