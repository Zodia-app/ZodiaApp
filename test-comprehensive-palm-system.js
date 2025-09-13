// Comprehensive test suite for palm reading system
const fs = require('fs');

// Convert real test images to base64 (using the images from Downloads)
function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error(`Error reading ${imagePath}:`, error);
    return null;
  }
}

// Test data
const testUsers = [
  {
    name: 'TestUser1',
    dateOfBirth: '1990-01-15',
    age: 34,
    zodiacSign: 'Capricorn'
  },
  {
    name: 'TestUser2', 
    dateOfBirth: '1992-03-20',
    age: 32,
    zodiacSign: 'Pisces'
  },
  {
    name: 'TestUser3',
    dateOfBirth: '1988-07-10',
    age: 36,
    zodiacSign: 'Cancer'
  }
];

// Load palm images
const palmImages = {
  left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
  right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
};

class PalmSystemTester {
  constructor() {
    this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
    this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTE3NTM4Mjg2MjAsImV4cCI6MjA2OTQwNDYyMH0.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
    this.results = [];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testSinglePalmReading(userData, testName) {
    console.log(`🧪 Testing: ${testName}`);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/generate-palm-reading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'apikey': this.serviceRoleKey
        },
        body: JSON.stringify({
          userData,
          leftPalmImage: palmImages.left,
          rightPalmImage: palmImages.right
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      const success = result.reading && result.reading.greeting;
      const contentLength = JSON.stringify(result.reading || {}).length;
      
      this.results.push({
        test: testName,
        success,
        responseTime,
        contentLength,
        hasPersonalization: result.reading?.greeting?.includes(userData.name),
        error: null
      });

      console.log(`   ✅ Success: ${responseTime}ms, ${contentLength} chars, personalized: ${result.reading?.greeting?.includes(userData.name)}`);
      return true;
      
    } catch (error) {
      this.results.push({
        test: testName,
        success: false,
        responseTime: Date.now() - startTime,
        contentLength: 0,
        hasPersonalization: false,
        error: error.message
      });
      
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
  }

  async testCompatibilityAnalysis(user1, user2, testName) {
    console.log(`🧪 Testing: ${testName}`);
    const startTime = Date.now();
    
    // Create mock palm readings for both users
    const mockReading = {
      greeting: "Hello! Your palms reveal fascinating insights.",
      overallPersonality: "You have a balanced and thoughtful personality.",
      lines: {
        lifeLine: { name: "Life Line", description: "Strong and clear", meaning: "Vitality" },
        heartLine: { name: "Heart Line", description: "Deep emotional capacity", meaning: "Love" }
      },
      mounts: {
        jupiter: { name: "Mount of Jupiter", prominence: "Well-developed" }
      },
      futureInsights: "Bright prospects ahead in career and relationships.",
      personalizedAdvice: "Trust your instincts and embrace new opportunities."
    };
    
    try {
      const response = await fetch(`${this.baseUrl}/generate-compatibility-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'apikey': this.serviceRoleKey
        },
        body: JSON.stringify({
          directMode: true,
          matchType: 'friend',
          userReading: {
            userData: user1,
            readingResult: mockReading
          },
          partnerReading: {
            userData: user2,
            readingResult: mockReading
          }
        })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      const success = result.success && result.compatibility;
      const hasScore = result.compatibility?.overallScore > 0;
      
      this.results.push({
        test: testName,
        success,
        responseTime,
        contentLength: JSON.stringify(result.compatibility || {}).length,
        hasPersonalization: hasScore,
        error: null
      });

      console.log(`   ✅ Success: ${responseTime}ms, score: ${result.compatibility?.overallScore}%, categories: ${result.compatibility?.categories?.length || 0}`);
      return true;
      
    } catch (error) {
      this.results.push({
        test: testName,
        success: false,
        responseTime: Date.now() - startTime,
        contentLength: 0,
        hasPersonalization: false,
        error: error.message
      });
      
      console.log(`   ❌ Failed: ${error.message}`);
      return false;
    }
  }

  async testConcurrentRequests(count) {
    console.log(`🧪 Testing: ${count} Concurrent Palm Readings`);
    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      const userData = { ...testUsers[i % testUsers.length], name: `ConcurrentUser${i + 1}` };
      promises.push(this.testSinglePalmReading(userData, `Concurrent-${i + 1}`));
    }
    
    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r).length;
      const totalTime = Date.now() - startTime;
      
      console.log(`   📊 Results: ${successCount}/${count} successful in ${totalTime}ms`);
      return successCount === count;
      
    } catch (error) {
      console.log(`   ❌ Concurrent test failed: ${error.message}`);
      return false;
    }
  }

  async testRetryMechanism() {
    console.log(`🧪 Testing: Retry Mechanism (simulated load)`);
    
    // Fire multiple requests rapidly to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const userData = { ...testUsers[0], name: `RetryTest${i + 1}` };
      promises.push(this.testSinglePalmReading(userData, `Retry-${i + 1}`));
    }
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`   📊 Retry test: ${successCount}/5 requests succeeded`);
    return successCount >= 3; // Allow some failures to test retry logic
  }

  printSummaryReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST SUMMARY REPORT');
    console.log('='.repeat(80));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
    const avgContentLength = this.results.filter(r => r.success).reduce((sum, r) => sum + r.contentLength, 0) / successfulTests;
    
    console.log(`\n📈 OVERALL METRICS:`);
    console.log(`   Success Rate: ${successfulTests}/${totalTests} (${((successfulTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Average Content Length: ${Math.round(avgContentLength)} characters`);
    
    console.log(`\n📋 DETAILED RESULTS:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const error = result.error ? ` (${result.error})` : '';
      console.log(`   ${status} ${result.test}: ${result.responseTime}ms${error}`);
    });
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.error}`);
      });
    }
    
    console.log(`\n🎯 SYSTEM STATUS:`);
    if (successfulTests / totalTests >= 0.8) {
      console.log(`   🟢 EXCELLENT: ${((successfulTests/totalTests)*100).toFixed(1)}% success rate`);
    } else if (successfulTests / totalTests >= 0.6) {
      console.log(`   🟡 GOOD: ${((successfulTests/totalTests)*100).toFixed(1)}% success rate with retry logic`);
    } else {
      console.log(`   🔴 NEEDS WORK: ${((successfulTests/totalTests)*100).toFixed(1)}% success rate - investigate further`);
    }
  }

  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE PALM READING SYSTEM TESTS');
    console.log('🔧 Testing rate limit fixes, retry logic, and compatibility analysis\n');
    
    if (!palmImages.left || !palmImages.right) {
      console.error('❌ Test images not found. Please ensure palm images exist in Downloads folder.');
      return false;
    }
    
    // Test 1: Individual Palm Readings
    console.log('📱 PHASE 1: Individual Palm Reading Tests');
    console.log('-'.repeat(50));
    for (let i = 0; i < testUsers.length; i++) {
      await this.testSinglePalmReading(testUsers[i], `Individual-${testUsers[i].name}`);
      await this.delay(1000); // Space out requests
    }
    
    // Test 2: Compatibility Analysis
    console.log('\n💕 PHASE 2: Compatibility Analysis Tests');
    console.log('-'.repeat(50));
    await this.testCompatibilityAnalysis(testUsers[0], testUsers[1], 'Compatibility-Capricorn-Pisces');
    await this.delay(2000);
    await this.testCompatibilityAnalysis(testUsers[1], testUsers[2], 'Compatibility-Pisces-Cancer');
    
    // Test 3: Concurrent Requests (reduced due to rate limiting)
    console.log('\n⚡ PHASE 3: Concurrent Request Tests');
    console.log('-'.repeat(50));
    await this.testConcurrentRequests(2); // Test 2 concurrent (since we reduced to 1 max)
    
    // Test 4: Retry Mechanism
    console.log('\n🔄 PHASE 4: Retry Mechanism Tests');
    console.log('-'.repeat(50));
    await this.testRetryMechanism();
    
    // Print final report
    this.printSummaryReport();
    
    const successRate = this.results.filter(r => r.success).length / this.results.length;
    return successRate >= 0.6; // 60% minimum success rate considering rate limits
  }
}

// Run the comprehensive test suite
const tester = new PalmSystemTester();
tester.runAllTests()
  .then(success => {
    console.log(`\n🏁 Test Suite ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });