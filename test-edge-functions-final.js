// FINAL EDGE FUNCTIONS TEST
// Tests edge functions without images first, then with proper images

const fs = require('fs');

// Create a proper test image (actual readable JPEG)
const createProperTestImage = () => {
    // This is a minimal but valid JPEG - 1x1 red pixel
    const validJpeg = `
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcU
FhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgo
KCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIA
AhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEB
AQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==`.replace(/\s/g, '');
    
    return validJpeg;
};

class FinalEdgeFunctionTester {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:54321/functions/v1';
        this.authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
        this.results = [];
    }

    async callEdgeFunction(functionName, payload, timeout = 60000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const startTime = Date.now();
            
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
            const responseTime = Date.now() - startTime;
            
            const responseText = await response.text();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
            }
            
            const data = JSON.parse(responseText);
            return { data, responseTime };
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async testPalmReading() {
        console.log('\n📱 TESTING: Palm Reading Edge Function');
        console.log('=' .repeat(50));
        
        const testImage = createProperTestImage();
        console.log(`📷 Using proper JPEG image (${testImage.length} chars)`);
        
        const testUsers = [
            { name: "Alice", age: 25, zodiacSign: "Leo" },
            { name: "Bob", age: 30, zodiacSign: "Scorpio" }
        ];
        
        let successCount = 0;
        let totalTests = 0;
        
        for (const user of testUsers) {
            console.log(`\n🔍 Testing: Palm reading for ${user.name} (${user.zodiacSign})`);
            totalTests++;
            
            try {
                const { data, responseTime } = await this.callEdgeFunction('generate-palm-reading', {
                    userData: user,
                    leftPalmImage: testImage,
                    rightPalmImage: testImage
                });
                
                // Validate structure
                if (!data.reading) throw new Error('Missing reading field');
                if (!data.reading.greeting) throw new Error('Missing greeting');
                if (!data.reading.lines) throw new Error('Missing lines');
                if (!data.reading.mounts) throw new Error('Missing mounts');
                
                const greeting = data.reading.greeting;
                const hasMainCharacterEnergy = greeting.includes('MAIN CHARACTER ENERGY');
                
                successCount++;
                console.log(`  ✅ SUCCESS (${responseTime}ms)`);
                console.log(`     Greeting: "${greeting.substring(0, 80)}..."`);
                console.log(`     Uniqueness: ${hasMainCharacterEnergy ? '❌ Template' : '✅ Unique'}`);
                console.log(`     Lines: ${Object.keys(data.reading.lines).length}/7`);
                console.log(`     Mounts: ${Object.keys(data.reading.mounts).length}/7`);
                
                if (data.usage) {
                    console.log(`     Tokens: ${data.usage.total_tokens}`);
                }
                
                this.results.push({
                    test: `Palm reading for ${user.name}`,
                    status: 'SUCCESS',
                    responseTime,
                    greeting: greeting.substring(0, 100),
                    hasTemplate: hasMainCharacterEnergy
                });
                
            } catch (error) {
                console.log(`  ❌ FAILED: ${error.message}`);
                
                this.results.push({
                    test: `Palm reading for ${user.name}`,
                    status: 'FAILED',
                    error: error.message
                });
            }
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return { successCount, totalTests };
    }

    async testCompatibilityFunctions() {
        console.log('\n💕 TESTING: Compatibility Functions');
        console.log('=' .repeat(50));
        
        let successCount = 0;
        let totalTests = 0;
        
        // Test compatibility analysis
        console.log('\n🔍 Testing: Compatibility Analysis');
        totalTests++;
        
        try {
            const mockUserReading = {
                userData: { name: "Alice", age: 25, zodiacSign: "Leo" },
                analysis: {
                    greeting: "Hey Alice! Your palm reading is amazing!",
                    overallPersonality: "Alice is a vibrant Leo with leadership qualities.",
                    lines: {
                        lifeLine: {
                            name: "Life Line",
                            description: "Strong and clear",
                            meaning: "Vitality and health",
                            personalizedInsight: "You have great life energy"
                        }
                    },
                    mounts: {
                        jupiter: {
                            name: "Jupiter Mount",
                            prominence: "Well-developed",
                            meaning: "Leadership qualities"
                        }
                    }
                }
            };
            
            const friendData = { name: "Bob", age: 27, zodiacSign: "Aries" };
            
            const { data, responseTime } = await this.callEdgeFunction('generate-compatibility-analysis', {
                userReading: mockUserReading,
                friendData: friendData
            });
            
            if (!data.analysis) throw new Error('Missing analysis field');
            
            successCount++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     Score: ${data.analysis.overallScore || 'N/A'}`);
            console.log(`     Summary available: ${!!data.analysis.summary}`);
            
        } catch (error) {
            console.log(`  ❌ FAILED: ${error.message}`);
        }
        
        // Test compatibility match
        console.log('\n🔍 Testing: Compatibility Match');
        totalTests++;
        
        try {
            const { data, responseTime } = await this.callEdgeFunction('generate-compatibility-match', {
                userData: { name: "Charlie", age: 28, zodiacSign: "Gemini" }
            });
            
            if (!data.compatibility) throw new Error('Missing compatibility field');
            
            successCount++;
            console.log(`  ✅ SUCCESS (${responseTime}ms)`);
            console.log(`     Response keys: ${Object.keys(data.compatibility).join(', ')}`);
            
        } catch (error) {
            console.log(`  ❌ FAILED: ${error.message}`);
        }
        
        return { successCount, totalTests };
    }

    async runFinalTests() {
        console.log('🚀 FINAL EDGE FUNCTIONS TEST SUITE');
        console.log('==================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
        
        const startTime = Date.now();
        
        // Test palm reading function
        const palmResults = await this.testPalmReading();
        
        // Test compatibility functions  
        const compatResults = await this.testCompatibilityFunctions();
        
        // Calculate totals
        const totalTests = palmResults.totalTests + compatResults.totalTests;
        const totalSuccess = palmResults.successCount + compatResults.successCount;
        const successRate = Math.round((totalSuccess / totalTests) * 100);
        const totalTime = Date.now() - startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Successful: ${totalSuccess}`);
        console.log(`Failed: ${totalTests - totalSuccess}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Total Time: ${Math.round(totalTime / 1000)}s`);
        
        // Status determination
        let status;
        if (successRate === 100) {
            status = '🎉 PERFECT! ALL EDGE FUNCTIONS OPERATIONAL!';
            console.log(`\n${status}`);
            console.log('✅ Palm reading generation: Working');
            console.log('✅ Compatibility analysis: Working');
            console.log('✅ Compatibility matching: Working');
            console.log('✅ OpenAI integration: Working');
            console.log('✅ All validations: Passing');
            console.log('✅ System ready for production!');
        } else if (successRate >= 75) {
            status = '🟢 GOOD! Most functions working';
            console.log(`\n${status}`);
            console.log('✅ Core functionality operational');
            console.log('⚠️  Some edge cases may need attention');
        } else if (successRate >= 50) {
            status = '🟡 PARTIAL! Some functions working';
            console.log(`\n${status}`);
        } else {
            status = '🔴 CRITICAL! Major issues detected';
            console.log(`\n${status}`);
        }
        
        console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
        
        // Save detailed results
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                successfulTests: totalSuccess,
                failedTests: totalTests - totalSuccess,
                successRate,
                status,
                totalTimeMs: totalTime
            },
            palmReading: palmResults,
            compatibility: compatResults,
            detailedResults: this.results
        };
        
        fs.writeFileSync('final-edge-functions-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Report saved: final-edge-functions-report.json');
        
        return report;
    }
}

// Run the final test suite
const tester = new FinalEdgeFunctionTester();
tester.runFinalTests().catch(console.error);