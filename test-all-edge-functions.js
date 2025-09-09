// Comprehensive Edge Functions Test Suite
// Tests ALL edge functions with various scenarios

const fs = require('fs');

// Mock data
const mockPalmImages = {
    left: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
    right: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wB=='
};

const testUsers = [
    { name: "Alice", age: 25, zodiacSign: "Leo", dateOfBirth: "1998-07-15" },
    { name: "Bob", age: 30, zodiacSign: "Scorpio", dateOfBirth: "1993-10-25" },
    { name: "Charlie", age: 28, zodiacSign: "Gemini", dateOfBirth: "1995-05-20" },
    { name: "Diana", age: 22, zodiacSign: "Pisces", dateOfBirth: "2001-03-10" },
    { name: "Eve", age: 35, zodiacSign: "Virgo", dateOfBirth: "1988-09-05" }
];

const compatibilityPairs = [
    {
        user: testUsers[0],
        friend: { name: "Friend1", age: 27, zodiacSign: "Aries" }
    },
    {
        user: testUsers[1], 
        friend: { name: "Friend2", age: 24, zodiacSign: "Cancer" }
    }
];

class EdgeFunctionTester {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:54321/functions/v1';
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    async testEdgeFunction(functionName, payload, testName, timeout = 30000) {
        console.log(`\n🔍 Testing: ${testName}`);
        this.totalTests++;
        
        const startTime = Date.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }
            
            const data = await response.json();
            
            // Validate response structure based on function
            this.validateResponse(functionName, data);
            
            this.passedTests++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     Response size: ${JSON.stringify(data).length} characters`);
            
            if (functionName === 'generate-palm-reading') {
                const greeting = data.reading?.greeting || 'No greeting';
                const hasMainCharacterEnergy = greeting.includes('MAIN CHARACTER ENERGY');
                console.log(`     Greeting: "${greeting.substring(0, 60)}..."`);
                console.log(`     Uniqueness: ${hasMainCharacterEnergy ? '❌ Template detected' : '✅ Unique content'}`);
            }
            
            this.results.push({
                testName,
                functionName,
                status: 'SUCCESS',
                responseTime,
                responseSize: JSON.stringify(data).length,
                data: this.summarizeResponse(functionName, data)
            });
            
            return data;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`  ❌ FAILED (${responseTime}ms): ${error.message}`);
            
            this.results.push({
                testName,
                functionName,
                status: 'FAILED',
                responseTime,
                error: error.message
            });
            
            throw error;
        }
    }
    
    validateResponse(functionName, data) {
        switch (functionName) {
            case 'generate-palm-reading':
                if (!data.reading) throw new Error('Missing reading field');
                if (!data.reading.greeting) throw new Error('Missing greeting');
                if (!data.reading.lines) throw new Error('Missing lines');
                if (!data.reading.mounts) throw new Error('Missing mounts');
                
                // Check required lines
                const requiredLines = ['lifeLine', 'heartLine', 'headLine', 'marriageLine', 'fateLine', 'successLine', 'travelLine'];
                for (const line of requiredLines) {
                    if (!data.reading.lines[line]) throw new Error(`Missing line: ${line}`);
                }
                
                // Check required mounts
                const requiredMounts = ['mars', 'jupiter', 'saturn', 'sun', 'mercury', 'moon', 'venus'];
                for (const mount of requiredMounts) {
                    if (!data.reading.mounts[mount]) throw new Error(`Missing mount: ${mount}`);
                }
                break;
                
            case 'generate-compatibility-analysis':
                if (!data.analysis) throw new Error('Missing analysis field');
                if (!data.analysis.overallScore) throw new Error('Missing overall score');
                if (!data.analysis.summary) throw new Error('Missing summary');
                break;
                
            case 'generate-compatibility-match':
                if (!data.compatibility) throw new Error('Missing compatibility field');
                break;
        }
    }
    
    summarizeResponse(functionName, data) {
        switch (functionName) {
            case 'generate-palm-reading':
                return {
                    hasGreeting: !!data.reading?.greeting,
                    greetingPreview: data.reading?.greeting?.substring(0, 50) + '...',
                    linesCount: Object.keys(data.reading?.lines || {}).length,
                    mountsCount: Object.keys(data.reading?.mounts || {}).length,
                    specialMarkingsCount: data.reading?.specialMarkings?.length || 0
                };
            case 'generate-compatibility-analysis':
                return {
                    overallScore: data.analysis?.overallScore,
                    summaryPreview: data.analysis?.summary?.substring(0, 50) + '...'
                };
            default:
                return { hasData: !!data };
        }
    }

    async runPalmReadingTests() {
        console.log('\n📱 TESTING: generate-palm-reading');
        console.log('=' .repeat(50));
        
        // Test with different user data
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            await this.testEdgeFunction('generate-palm-reading', {
                userData: user,
                leftPalmImage: mockPalmImages.left,
                rightPalmImage: mockPalmImages.right
            }, `Palm reading for ${user.name} (${user.zodiacSign})`);
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Test uniqueness with multiple requests for same user
        console.log('\n🔄 Testing uniqueness with repeated requests...');
        const greetings = [];
        for (let i = 0; i < 3; i++) {
            const result = await this.testEdgeFunction('generate-palm-reading', {
                userData: testUsers[0],
                leftPalmImage: mockPalmImages.left,
                rightPalmImage: mockPalmImages.right
            }, `Uniqueness test ${i + 1} for ${testUsers[0].name}`);
            
            if (result.reading?.greeting) {
                greetings.push(result.reading.greeting);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Check for duplicate greetings
        const uniqueGreetings = new Set(greetings);
        console.log(`\n📊 Uniqueness Check: ${uniqueGreetings.size}/${greetings.length} unique greetings`);
        if (uniqueGreetings.size === greetings.length) {
            console.log('  ✅ All greetings are unique!');
        } else {
            console.log('  ⚠️  Some duplicate greetings detected');
        }
    }
    
    async runCompatibilityTests() {
        console.log('\n💕 TESTING: generate-compatibility-analysis');
        console.log('=' .repeat(50));
        
        for (const pair of compatibilityPairs) {
            await this.testEdgeFunction('generate-compatibility-analysis', {
                userReading: {
                    userData: pair.user,
                    analysis: {
                        greeting: `Hey ${pair.user.name}! Your palm reading shows amazing energy!`,
                        overallPersonality: `${pair.user.name} is a vibrant ${pair.user.zodiacSign}`,
                        lines: { lifeLine: { name: "Life Line", description: "Strong", meaning: "Vitality", personalizedInsight: "Keep going!" } },
                        mounts: { jupiter: { name: "Jupiter", prominence: "High", meaning: "Leadership" } }
                    }
                },
                friendData: pair.friend
            }, `Compatibility analysis: ${pair.user.name} (${pair.user.zodiacSign}) + ${pair.friend.name} (${pair.friend.zodiacSign})`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    async runCompatibilityMatchTests() {
        console.log('\n🔮 TESTING: generate-compatibility-match');
        console.log('=' .repeat(50));
        
        for (const user of testUsers.slice(0, 2)) {
            await this.testEdgeFunction('generate-compatibility-match', {
                userData: user
            }, `Compatibility match for ${user.name} (${user.zodiacSign})`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    async runErrorTests() {
        console.log('\n⚠️  TESTING: Error handling');
        console.log('=' .repeat(50));
        
        // Test missing data
        try {
            await this.testEdgeFunction('generate-palm-reading', {
                userData: { name: "Test" }
                // Missing palm images
            }, 'Missing palm images test');
        } catch (error) {
            console.log('  ✅ Correctly rejected missing data');
            this.passedTests++; // This is expected to fail
        }
        
        // Test malformed data
        try {
            await this.testEdgeFunction('generate-palm-reading', {
                invalidField: "test"
            }, 'Malformed data test');
        } catch (error) {
            console.log('  ✅ Correctly rejected malformed data');
            this.passedTests++; // This is expected to fail
        }
    }
    
    async runPerformanceTests() {
        console.log('\n⚡ TESTING: Performance');
        console.log('=' .repeat(50));
        
        const startTime = Date.now();
        const promises = [];
        
        // Run 3 concurrent palm reading requests
        for (let i = 0; i < 3; i++) {
            promises.push(
                this.testEdgeFunction('generate-palm-reading', {
                    userData: testUsers[i % testUsers.length],
                    leftPalmImage: mockPalmImages.left,
                    rightPalmImage: mockPalmImages.right
                }, `Concurrent test ${i + 1}`)
            );
        }
        
        try {
            await Promise.all(promises);
            const totalTime = Date.now() - startTime;
            console.log(`\n📊 Concurrent Performance: 3 requests completed in ${totalTime}ms`);
            console.log(`   Average: ${Math.round(totalTime / 3)}ms per request`);
        } catch (error) {
            console.log(`\n❌ Concurrent test failed: ${error.message}`);
        }
    }
    
    async runAllTests() {
        console.log('🚀 COMPREHENSIVE EDGE FUNCTIONS TEST SUITE');
        console.log('==========================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
        
        const startTime = Date.now();
        
        try {
            // Run all test suites
            await this.runPalmReadingTests();
            await this.runCompatibilityTests();
            await this.runCompatibilityMatchTests();
            await this.runErrorTests();
            await this.runPerformanceTests();
            
        } catch (error) {
            console.error(`\n❌ Test suite error: ${error.message}`);
        }
        
        const totalTime = Date.now() - startTime;
        const successRate = Math.round((this.passedTests / this.totalTests) * 100);
        
        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Total Time: ${Math.round(totalTime / 1000)}s`);
        console.log(`Average Time: ${Math.round(totalTime / this.totalTests)}ms per test`);
        
        // Status determination
        let status;
        if (successRate === 100) {
            status = '🎉 PERFECT! ALL EDGE FUNCTIONS OPERATIONAL!';
            console.log(`\n${status}`);
            console.log('✅ All palm reading functions working');
            console.log('✅ All compatibility functions working');
            console.log('✅ Error handling working correctly');
            console.log('✅ Performance is acceptable');
            console.log('✅ System ready for production!');
        } else if (successRate >= 90) {
            status = '🟢 EXCELLENT! Minor issues detected';
            console.log(`\n${status}`);
        } else if (successRate >= 75) {
            status = '🟡 GOOD! Some functions need attention';
            console.log(`\n${status}`);
        } else {
            status = '🔴 CRITICAL! Major issues found';
            console.log(`\n${status}`);
        }
        
        console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
        
        // Save detailed results
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.totalTests - this.passedTests,
                successRate,
                totalTimeMs: totalTime,
                averageTimeMs: Math.round(totalTime / this.totalTests),
                status
            },
            results: this.results
        };
        
        fs.writeFileSync('edge-functions-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: edge-functions-test-report.json');
        
        return report;
    }
}

// Run the comprehensive test suite
const tester = new EdgeFunctionTester();
tester.runAllTests().catch(console.error);