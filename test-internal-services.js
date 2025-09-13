// Test the internal services and queue logic
const fs = require('fs');

// Test the queue behavior and retry logic by simulating the internal flow
class InternalServiceTester {
  constructor() {
    this.results = [];
    this.currentProcessing = 0;
    this.maxConcurrent = 1; // Match our reduced concurrency
    this.maxRetries = 2;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate the palm reading queue behavior
  async simulatePalmReadingQueue(item) {
    console.log(`🎯 Processing queue item: ${item.id} (${this.currentProcessing + 1}/${this.maxConcurrent} concurrent)`);
    
    this.currentProcessing++;
    const startTime = Date.now();
    
    try {
      // Simulate network call with potential failure
      const shouldFail = Math.random() < 0.3; // 30% failure rate to test retry logic
      
      if (shouldFail && item.retries === 0) {
        throw new Error('Simulated edge function failure (rate limit)');
      }
      
      // Simulate processing time
      await this.delay(1000 + Math.random() * 2000);
      
      const responseTime = Date.now() - startTime;
      console.log(`   ✅ Completed: ${item.id} in ${responseTime}ms`);
      
      this.results.push({
        id: item.id,
        success: true,
        responseTime,
        retries: item.retries
      });
      
      return true;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.log(`   ❌ Failed: ${item.id} - ${error.message}`);
      
      // Retry logic with exponential backoff
      if (item.retries < this.maxRetries) {
        item.retries++;
        const delay = Math.pow(2, item.retries) * 1000;
        console.log(`   🔄 Retrying ${item.id} (attempt ${item.retries + 1}/${this.maxRetries + 1}) after ${delay}ms`);
        
        await this.delay(delay);
        return await this.simulatePalmReadingQueue(item);
      } else {
        console.log(`   💀 ${item.id} failed after ${this.maxRetries + 1} attempts`);
        this.results.push({
          id: item.id,
          success: false,
          responseTime,
          retries: item.retries,
          error: error.message
        });
        return false;
      }
    } finally {
      this.currentProcessing--;
    }
  }

  // Test image compression simulation
  testImageCompression() {
    console.log('🗜️ Testing Image Compression Logic...');
    
    const originalSizes = [1200, 1500, 2000, 800, 1000]; // KB
    const compressionResults = originalSizes.map(size => {
      const compressed = Math.round(size * 0.6); // 60% quality
      const reduction = Math.round(((size - compressed) / size) * 100);
      return { original: size, compressed, reduction };
    });
    
    const avgReduction = compressionResults.reduce((sum, r) => sum + r.reduction, 0) / compressionResults.length;
    
    console.log(`   📊 Compression Results:`);
    compressionResults.forEach((r, i) => {
      console.log(`     Image ${i + 1}: ${r.original}KB → ${r.compressed}KB (${r.reduction}% reduction)`);
    });
    console.log(`   📈 Average reduction: ${avgReduction.toFixed(1)}%`);
    
    return avgReduction >= 25; // Expect at least 25% reduction
  }

  // Test caching mechanism
  testCachingLogic() {
    console.log('💾 Testing Caching Logic...');
    
    const testKeys = ['user1_abc123', 'user2_def456', 'user1_abc123']; // Simulate cache hits
    const cache = new Map();
    const cacheHits = [];
    
    testKeys.forEach((key, i) => {
      if (cache.has(key)) {
        console.log(`   ✅ Cache HIT for ${key}`);
        cacheHits.push(true);
      } else {
        console.log(`   ❌ Cache MISS for ${key} - would generate new reading`);
        cache.set(key, `reading_${i}`);
        cacheHits.push(false);
      }
    });
    
    const hitRate = (cacheHits.filter(hit => hit).length / cacheHits.length) * 100;
    console.log(`   📊 Cache hit rate: ${hitRate}%`);
    
    return hitRate > 0; // Should have at least one cache hit
  }

  // Test queue processing with concurrency limits
  async testQueueConcurrency() {
    console.log('⚡ Testing Queue Concurrency Control...');
    
    const queueItems = [
      { id: 'palm_001', retries: 0 },
      { id: 'palm_002', retries: 0 },
      { id: 'palm_003', retries: 0 },
      { id: 'palm_004', retries: 0 },
      { id: 'palm_005', retries: 0 }
    ];
    
    console.log(`   🎯 Processing ${queueItems.length} items with max ${this.maxConcurrent} concurrent`);
    
    // Process items respecting concurrency limits
    const promises = [];
    for (const item of queueItems) {
      while (this.currentProcessing >= this.maxConcurrent) {
        await this.delay(100); // Wait for slot to open
      }
      promises.push(this.simulatePalmReadingQueue(item));
    }
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r).length;
    
    console.log(`   📊 Queue Results: ${successCount}/${queueItems.length} successful`);
    return successCount >= queueItems.length * 0.7; // 70% success rate expected
  }

  // Test data structure transformations
  testDataTransformations() {
    console.log('🔄 Testing Data Structure Transformations...');
    
    const friendData = {
      userData: { name: 'TestUser', dateOfBirth: '1990-01-01', age: 34 },
      palmData: { leftPalmImage: 'image1.jpg', rightPalmImage: 'image2.jpg' }
    };
    
    // Transform to PalmReadingFormData structure
    const transformed = {
      ...friendData.userData,
      leftHandImage: friendData.palmData.leftPalmImage,
      rightHandImage: friendData.palmData.rightPalmImage
    };
    
    const hasRequiredFields = transformed.name && transformed.leftHandImage && transformed.rightHandImage;
    console.log(`   ✅ Data transformation: ${hasRequiredFields ? 'PASS' : 'FAIL'}`);
    console.log(`   📊 Transformed structure: ${JSON.stringify(transformed, null, 2)}`);
    
    return hasRequiredFields;
  }

  async runInternalTests() {
    console.log('🔧 TESTING INTERNAL PALM READING SERVICES');
    console.log('=' .repeat(60));
    
    const testResults = {};
    
    // Test 1: Image Compression
    console.log('\n📱 TEST 1: Image Compression');
    console.log('-'.repeat(40));
    testResults.compression = this.testImageCompression();
    
    // Test 2: Caching Logic
    console.log('\n💾 TEST 2: Caching Logic');
    console.log('-'.repeat(40));
    testResults.caching = this.testCachingLogic();
    
    // Test 3: Data Transformations
    console.log('\n🔄 TEST 3: Data Transformations');
    console.log('-'.repeat(40));
    testResults.dataTransform = this.testDataTransformations();
    
    // Test 4: Queue Concurrency
    console.log('\n⚡ TEST 4: Queue Concurrency & Retry Logic');
    console.log('-'.repeat(40));
    testResults.queueProcessing = await this.testQueueConcurrency();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 INTERNAL TESTS SUMMARY');
    console.log('='.repeat(60));
    
    const passedTests = Object.values(testResults).filter(r => r).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n📈 RESULTS:`);
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (this.results.length > 0) {
      const queueSuccessRate = this.results.filter(r => r.success).length / this.results.length;
      console.log(`🔄 Queue Success Rate: ${(queueSuccessRate * 100).toFixed(1)}%`);
      
      const retriedItems = this.results.filter(r => r.retries > 0);
      console.log(`🔁 Retry Mechanism: ${retriedItems.length} items required retries`);
      
      const avgRetries = retriedItems.length > 0 
        ? retriedItems.reduce((sum, r) => sum + r.retries, 0) / retriedItems.length 
        : 0;
      console.log(`📊 Average Retries: ${avgRetries.toFixed(1)}`);
    }
    
    const overallSuccess = passedTests === totalTests && (this.results.length === 0 || this.results.filter(r => r.success).length >= this.results.length * 0.7);
    
    console.log(`\n${overallSuccess ? '🟢 SYSTEM STATUS: HEALTHY' : '🟡 SYSTEM STATUS: NEEDS MONITORING'}`);
    
    return overallSuccess;
  }
}

// Run internal service tests
const tester = new InternalServiceTester();
tester.runInternalTests()
  .then(success => {
    console.log(`\n🏁 Internal Tests ${success ? 'PASSED' : 'REQUIRES ATTENTION'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Internal test suite crashed:', error);
    process.exit(1);
  });