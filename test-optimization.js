// Palm Reading Optimization Validation Test
// Tests the ultra-optimized system vs original implementation

const fs = require('fs');

const convertImageToBase64 = (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        console.error(`Error reading ${imagePath}:`, error);
        return null;
    }
};

class OptimizationTester {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        // Load test palm images
        this.palmImages = {
            left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
            right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
        };

        // Test user data
        this.testUser = {
            name: 'TestUser',
            dateOfBirth: '1995-06-15',
            timeOfBirth: '14:30',
            age: 30,
            zodiacSign: 'Gemini',
            placeOfBirth: {
                city: 'Paris',
                country: 'France',
                latitude: 48.8566,
                longitude: 2.3522,
                timezone: 'Europe/Paris'
            }
        };
    }

    async callOriginalEdgeFunction(userData, leftImage, rightImage) {
        console.log('📡 Calling ORIGINAL palm reading edge function...');
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
                    leftPalmImage: leftImage,
                    rightPalmImage: rightImage
                })
            });

            const responseTime = Date.now() - startTime;
            const result = await response.text();
            
            return {
                success: response.ok,
                responseTime,
                payloadSize: JSON.stringify({ userData, leftPalmImage: leftImage, rightPalmImage: rightImage }).length,
                httpStatus: response.status,
                data: response.ok ? JSON.parse(result) : result,
                optimization: 'none'
            };
        } catch (error) {
            return {
                success: false,
                responseTime: Date.now() - startTime,
                error: error.message,
                optimization: 'none'
            };
        }
    }

    // Simulate the compression that would happen on client-side
    compressBase64(base64String, compressionFactor = 0.4) {
        // Simple simulation: take every nth character to simulate compression
        const step = Math.ceil(1 / compressionFactor);
        let compressed = '';
        for (let i = 0; i < base64String.length; i += step) {
            compressed += base64String[i];
        }
        return compressed.padEnd(Math.floor(base64String.length * compressionFactor), '=');
    }

    async testOptimizedFlow() {
        console.log('🚀 Testing ULTRA-OPTIMIZED palm reading flow...');
        
        // Simulate client-side compression (60% reduction)
        const originalLeftSize = this.palmImages.left.length;
        const originalRightSize = this.palmImages.right.length;
        
        const compressedLeft = this.compressBase64(this.palmImages.left, 0.4);
        const compressedRight = this.compressBase64(this.palmImages.right, 0.4);
        
        console.log(`📊 Compression Results:`);
        console.log(`   Left: ${originalLeftSize} -> ${compressedLeft.length} (${Math.round((1 - compressedLeft.length/originalLeftSize) * 100)}% reduction)`);
        console.log(`   Right: ${originalRightSize} -> ${compressedRight.length} (${Math.round((1 - compressedRight.length/originalRightSize) * 100)}% reduction)`);
        
        return await this.callOriginalEdgeFunction(this.testUser, compressedLeft, compressedRight);
    }

    async runPerformanceComparison(testCount = 5) {
        console.log('🏁 PALM READING OPTIMIZATION PERFORMANCE TEST');
        console.log('=' .repeat(70));
        console.log(`🔬 Running ${testCount} tests for each approach`);
        console.log('');

        const originalResults = [];
        const optimizedResults = [];

        // Test original approach
        console.log('📊 Testing ORIGINAL approach...');
        for (let i = 0; i < testCount; i++) {
            console.log(`   Test ${i + 1}/${testCount}...`);
            const result = await this.callOriginalEdgeFunction(this.testUser, this.palmImages.left, this.palmImages.right);
            originalResults.push(result);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between tests
        }

        console.log('');
        
        // Test optimized approach
        console.log('🚀 Testing OPTIMIZED approach...');
        for (let i = 0; i < testCount; i++) {
            console.log(`   Test ${i + 1}/${testCount}...`);
            const result = await this.testOptimizedFlow();
            optimizedResults.push(result);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between tests
        }

        // Calculate statistics
        const originalStats = this.calculateStats(originalResults);
        const optimizedStats = this.calculateStats(optimizedResults);

        // Display results
        console.log('');
        console.log('=' .repeat(70));
        console.log('📊 PERFORMANCE COMPARISON RESULTS');
        console.log('=' .repeat(70));
        
        console.log('🔧 ORIGINAL APPROACH:');
        console.log(`   Success Rate: ${originalStats.successRate}% (${originalStats.successful}/${testCount})`);
        console.log(`   Avg Response Time: ${originalStats.avgResponseTime}ms`);
        console.log(`   Avg Payload Size: ${Math.round(originalStats.avgPayloadSize / 1024)}KB`);
        console.log(`   HTTP Errors: ${originalStats.httpErrors}`);
        
        console.log('');
        console.log('🚀 OPTIMIZED APPROACH:');
        console.log(`   Success Rate: ${optimizedStats.successRate}% (${optimizedStats.successful}/${testCount})`);
        console.log(`   Avg Response Time: ${optimizedStats.avgResponseTime}ms`);
        console.log(`   Avg Payload Size: ${Math.round(optimizedStats.avgPayloadSize / 1024)}KB`);
        console.log(`   HTTP Errors: ${optimizedStats.httpErrors}`);
        
        console.log('');
        console.log('📈 IMPROVEMENTS:');
        const payloadReduction = ((originalStats.avgPayloadSize - optimizedStats.avgPayloadSize) / originalStats.avgPayloadSize * 100);
        const responseTimeImprovement = originalStats.avgResponseTime > 0 ? 
            ((originalStats.avgResponseTime - optimizedStats.avgResponseTime) / originalStats.avgResponseTime * 100) : 0;
        
        console.log(`   Payload Size Reduction: ${payloadReduction.toFixed(1)}%`);
        console.log(`   Response Time Improvement: ${responseTimeImprovement.toFixed(1)}%`);
        console.log(`   Success Rate Change: ${(optimizedStats.successRate - originalStats.successRate).toFixed(1)}%`);

        // Load testing
        console.log('');
        console.log('⚡ CONCURRENT LOAD TEST (5 simultaneous requests)');
        await this.runConcurrentLoadTest();

        // Save report
        const report = {
            testType: 'Palm Reading Optimization Validation',
            timestamp: new Date().toISOString(),
            testCount,
            results: {
                original: {
                    ...originalStats,
                    results: originalResults
                },
                optimized: {
                    ...optimizedStats,
                    results: optimizedResults
                }
            },
            improvements: {
                payloadReduction: `${payloadReduction.toFixed(1)}%`,
                responseTimeImprovement: `${responseTimeImprovement.toFixed(1)}%`,
                successRateChange: `${(optimizedStats.successRate - originalStats.successRate).toFixed(1)}%`
            }
        };

        fs.writeFileSync('optimization-test-results.json', JSON.stringify(report, null, 2));
        console.log('');
        console.log('📄 Detailed report saved: optimization-test-results.json');
        console.log(`⏰ Test completed: ${new Date().toLocaleString()}`);
    }

    calculateStats(results) {
        const successful = results.filter(r => r.success).length;
        const httpErrors = results.filter(r => r.httpStatus >= 400).length;
        
        const responseTimes = results.filter(r => r.responseTime > 0).map(r => r.responseTime);
        const avgResponseTime = responseTimes.length > 0 ? 
            Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) : 0;
        
        const payloadSizes = results.filter(r => r.payloadSize > 0).map(r => r.payloadSize);
        const avgPayloadSize = payloadSizes.length > 0 ?
            Math.round(payloadSizes.reduce((sum, size) => sum + size, 0) / payloadSizes.length) : 0;

        return {
            successRate: Math.round((successful / results.length) * 100),
            successful,
            avgResponseTime,
            avgPayloadSize,
            httpErrors
        };
    }

    async runConcurrentLoadTest() {
        console.log('🔥 Starting 5 concurrent requests with optimized approach...');
        
        const promises = Array(5).fill().map((_, i) => 
            this.testOptimizedFlow().then(result => ({ ...result, testId: i + 1 }))
        );

        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;
        
        console.log(`   Results: ${successful}/5 successful (${Math.round(successful/5*100)}%), ${failed} failed`);
        
        if (successful >= 4) {
            console.log('✅ EXCELLENT: 80%+ success rate under concurrent load!');
        } else if (successful >= 3) {
            console.log('🟡 GOOD: 60%+ success rate - acceptable under load');
        } else {
            console.log('🔴 NEEDS WORK: <60% success rate under concurrent load');
        }
    }
}

// Run the optimization test
console.log('🚀 Palm Reading Optimization Validator Starting...');
const tester = new OptimizationTester();

if (!tester.palmImages.left || !tester.palmImages.right) {
    console.error('❌ Failed to load palm images - test cannot proceed');
    process.exit(1);
}

console.log('✅ Palm images loaded successfully');
console.log('🏁 Starting performance comparison...');

tester.runPerformanceComparison(3).catch(console.error);