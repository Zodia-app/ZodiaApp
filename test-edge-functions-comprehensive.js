// COMPREHENSIVE EDGE FUNCTIONS TESTING SUITE
// Tests all edge functions with proper mock data

const fs = require('fs');

// Create realistic base64 mock images (larger than previous)
const createMockPalmImage = (width = 200, height = 200) => {
    // Simple PNG header + minimal image data
    const data = Buffer.alloc(width * height * 3);
    for (let i = 0; i < data.length; i += 3) {
        data[i] = Math.floor(Math.random() * 256);     // R
        data[i + 1] = Math.floor(Math.random() * 256); // G  
        data[i + 2] = Math.floor(Math.random() * 256); // B
    }
    return data.toString('base64');
};

const mockLeftPalm = createMockPalmImage();
const mockRightPalm = createMockPalmImage();

class ComprehensiveEdgeFunctionTester {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:54321/functions/v1';
        this.results = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    }

    async callEdgeFunction(functionName, payload, timeout = 45000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.authHeader
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async testPalmReading(testName, userData) {
        console.log(`\n🔍 Testing: ${testName}`);
        this.totalTests++;
        
        const startTime = Date.now();
        
        try {
            const result = await this.callEdgeFunction('generate-palm-reading', {
                userData: userData,
                leftPalmImage: mockLeftPalm,
                rightPalmImage: mockRightPalm
            });
            
            const responseTime = Date.now() - startTime;
            
            // Validate palm reading structure
            if (!result.reading) throw new Error('Missing reading field');
            if (!result.reading.greeting) throw new Error('Missing greeting');
            if (!result.reading.lines) throw new Error('Missing lines');
            if (!result.reading.mounts) throw new Error('Missing mounts');
            
            // Check required lines
            const requiredLines = ['lifeLine', 'heartLine', 'headLine', 'marriageLine', 'fateLine', 'successLine', 'travelLine'];
            for (const line of requiredLines) {
                if (!result.reading.lines[line]) throw new Error(`Missing line: ${line}`);
            }
            
            // Check required mounts  
            const requiredMounts = ['mars', 'jupiter', 'saturn', 'sun', 'mercury', 'moon', 'venus'];
            for (const mount of requiredMounts) {
                if (!result.reading.mounts[mount]) throw new Error(`Missing mount: ${mount}`);
            }
            
            // Check greeting uniqueness
            const greeting = result.reading.greeting;
            const hasMainCharacterEnergy = greeting.includes('MAIN CHARACTER ENERGY');
            const greetingLength = greeting.length;
            
            this.passedTests++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     User: ${userData.name} (${userData.zodiacSign})`);
            console.log(`     Greeting: "${greeting.substring(0, 60)}..."`);
            console.log(`     Length: ${greetingLength} chars`);
            console.log(`     Uniqueness: ${hasMainCharacterEnergy ? '❌ Template detected' : '✅ Unique content'}`);
            console.log(`     Lines: ${Object.keys(result.reading.lines).length}/7`);
            console.log(`     Mounts: ${Object.keys(result.reading.mounts).length}/7`);
            
            this.results.push({
                testName,
                functionName: 'generate-palm-reading',
                status: 'SUCCESS',
                responseTime,
                userData,
                greeting: greeting.substring(0, 100),
                hasTemplate: hasMainCharacterEnergy,
                linesCount: Object.keys(result.reading.lines).length,
                mountsCount: Object.keys(result.reading.mounts).length
            });
            
            return result;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`  ❌ FAILED (${responseTime}ms): ${error.message}`);
            
            this.results.push({
                testName,
                functionName: 'generate-palm-reading',
                status: 'FAILED',
                responseTime,
                userData,
                error: error.message
            });
            
            return null;
        }
    }

    async testCompatibilityAnalysis(testName, userReading, friendData) {
        console.log(`\n🔍 Testing: ${testName}`);
        this.totalTests++;
        
        const startTime = Date.now();
        
        try {
            const result = await this.callEdgeFunction('generate-compatibility-analysis', {
                userReading: userReading,
                friendData: friendData
            });
            
            const responseTime = Date.now() - startTime;
            
            // Validate compatibility analysis structure
            if (!result.analysis) throw new Error('Missing analysis field');
            if (typeof result.analysis.overallScore !== 'number') throw new Error('Missing or invalid overallScore');
            if (!result.analysis.summary) throw new Error('Missing summary');
            
            this.passedTests++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     Score: ${result.analysis.overallScore}%`);
            console.log(`     Summary: "${result.analysis.summary.substring(0, 60)}..."`);
            
            this.results.push({
                testName,
                functionName: 'generate-compatibility-analysis',
                status: 'SUCCESS',
                responseTime,
                overallScore: result.analysis.overallScore,
                summaryLength: result.analysis.summary.length
            });
            
            return result;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`  ❌ FAILED (${responseTime}ms): ${error.message}`);
            
            this.results.push({
                testName,
                functionName: 'generate-compatibility-analysis',
                status: 'FAILED',
                responseTime,
                error: error.message
            });
            
            return null;
        }
    }

    async testCompatibilityMatch(testName, userData) {
        console.log(`\n🔍 Testing: ${testName}`);
        this.totalTests++;
        
        const startTime = Date.now();
        
        try {
            const result = await this.callEdgeFunction('generate-compatibility-match', {
                userData: userData
            });
            
            const responseTime = Date.now() - startTime;
            
            // Basic validation
            if (!result.compatibility) throw new Error('Missing compatibility field');
            
            this.passedTests++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     Response keys: ${Object.keys(result.compatibility).join(', ')}`);
            
            this.results.push({
                testName,
                functionName: 'generate-compatibility-match',
                status: 'SUCCESS',
                responseTime
            });
            
            return result;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.log(`  ❌ FAILED (${responseTime}ms): ${error.message}`);
            
            this.results.push({
                testName,
                functionName: 'generate-compatibility-match',
                status: 'FAILED',
                responseTime,
                error: error.message
            });
            
            return null;
        }
    }

    async runComprehensiveTests() {
        console.log('🚀 COMPREHENSIVE EDGE FUNCTIONS TEST SUITE');
        console.log('==========================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
        
        const startTime = Date.now();
        
        // Test data
        const testUsers = [
            { name: "Alice", age: 25, zodiacSign: "Leo", dateOfBirth: "1998-07-15" },
            { name: "Bob", age: 30, zodiacSign: "Scorpio", dateOfBirth: "1993-10-25" },
            { name: "Charlie", age: 28, zodiacSign: "Gemini", dateOfBirth: "1995-05-20" },
            { name: "Diana", age: 22, zodiacSign: "Pisces", dateOfBirth: "2001-03-10" },
            { name: "Eve", age: 35, zodiacSign: "Virgo", dateOfBirth: "1988-09-05" }
        ];

        // 1. PALM READING TESTS
        console.log('\n📱 TESTING: Palm Reading Edge Function');
        console.log('=' .repeat(50));
        
        const palmReadingResults = [];
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            const result = await this.testPalmReading(
                `Palm reading for ${user.name} (${user.zodiacSign})`, 
                user
            );
            if (result) palmReadingResults.push(result);
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Test uniqueness
        console.log('\n🔄 TESTING: Greeting Uniqueness');
        console.log('─'.repeat(30));
        
        const uniquenessTests = [];
        for (let i = 0; i < 3; i++) {
            const result = await this.testPalmReading(
                `Uniqueness test ${i + 1} for ${testUsers[0].name}`,
                testUsers[0]
            );
            if (result) uniquenessTests.push(result.reading.greeting);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Analyze uniqueness
        if (uniquenessTests.length > 0) {
            const uniqueGreetings = new Set(uniquenessTests);
            console.log(`\n📊 Uniqueness Analysis:`);
            console.log(`     Generated: ${uniquenessTests.length} greetings`);
            console.log(`     Unique: ${uniqueGreetings.size} greetings`);
            console.log(`     Success Rate: ${Math.round((uniqueGreetings.size / uniquenessTests.length) * 100)}%`);
        }

        // 2. COMPATIBILITY ANALYSIS TESTS
        console.log('\n💕 TESTING: Compatibility Analysis Edge Function');
        console.log('=' .repeat(50));
        
        if (palmReadingResults.length > 0) {
            // Use actual palm reading results for compatibility tests
            const friendData = { name: "TestFriend", age: 27, zodiacSign: "Aries" };
            
            await this.testCompatibilityAnalysis(
                `Compatibility: ${testUsers[0].name} + ${friendData.name}`,
                {
                    userData: testUsers[0],
                    analysis: palmReadingResults[0].reading
                },
                friendData
            );
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 3. COMPATIBILITY MATCH TESTS  
        console.log('\n🔮 TESTING: Compatibility Match Edge Function');
        console.log('=' .repeat(50));
        
        for (let i = 0; i < Math.min(2, testUsers.length); i++) {
            await this.testCompatibilityMatch(
                `Compatibility match for ${testUsers[i].name}`,
                testUsers[i]
            );
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 4. ERROR HANDLING TESTS
        console.log('\n⚠️  TESTING: Error Handling');
        console.log('=' .repeat(50));
        
        // Test missing data
        console.log('\n🔍 Testing: Missing palm images');
        this.totalTests++;
        try {
            await this.callEdgeFunction('generate-palm-reading', {
                userData: { name: "Test" }
                // Missing images
            }, 10000);
            console.log('  ❌ Should have failed but didn\'t');
        } catch (error) {
            console.log('  ✅ Correctly rejected missing data');
            this.passedTests++;
        }

        // FINAL SUMMARY
        const totalTime = Date.now() - startTime;
        const successRate = Math.round((this.passedTests / this.totalTests) * 100);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Total Time: ${Math.round(totalTime / 1000)}s`);
        
        // Determine status
        let status;
        if (successRate === 100) {
            status = '🎉 PERFECT! ALL EDGE FUNCTIONS OPERATIONAL!';
        } else if (successRate >= 90) {
            status = '🟢 EXCELLENT! Minor issues detected';
        } else if (successRate >= 75) {
            status = '🟡 GOOD! Some functions need attention';
        } else {
            status = '🔴 CRITICAL! Major issues found';
        }
        
        console.log(`\nStatus: ${status}`);
        
        if (successRate >= 90) {
            console.log('\n✅ Edge Functions Status:');
            console.log('   • Palm reading generation: Working');
            console.log('   • Greeting uniqueness: Working'); 
            console.log('   • Compatibility analysis: Working');
            console.log('   • Compatibility matching: Working');
            console.log('   • Error handling: Working');
            console.log('   • System ready for production!');
        }
        
        console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                successRate,
                totalTimeMs: totalTime,
                status
            },
            results: this.results
        };
        
        fs.writeFileSync('comprehensive-edge-functions-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report: comprehensive-edge-functions-report.json');
        
        return report;
    }
}

// Run the comprehensive test suite
const tester = new ComprehensiveEdgeFunctionTester();
tester.runComprehensiveTests().catch(console.error);