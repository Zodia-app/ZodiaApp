// Enhanced Compatibility 15-Test Validation
// Tests fixed edge function for 100% success rate on 15 consecutive tests
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

class EnhancedCompatibility15Test {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        this.results = [];
        
        // Load palm images
        this.palmImageSets = {
            set1: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
            },
            set2: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (2).jpeg')
            }
        };

        // Generate 15 test pairs
        this.testPairs = this.generate15TestPairs();
        
        if (this.palmImageSets.set1.left && this.palmImageSets.set2.left) {
            console.log('✅ Palm images loaded successfully');
            console.log(`🔥 Generated ${this.testPairs.length} focused test pairs`);
        } else {
            console.log('❌ Failed to load palm images');
        }
    }

    generate15TestPairs() {
        const pairs = [];
        const maleNames = ['Alexandre', 'Marcus', 'David', 'Carlos', 'James'];
        const femaleNames = ['Elena', 'Sofia', 'Luna', 'Aria', 'Maya'];
        const locations = [
            { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
            { city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, tz: 'Europe/Bucharest' },
            { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome' }
        ];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'];
        const birthTimes = ['08:15', '14:30', '22:10', null];

        for (let i = 0; i < 15; i++) {
            // Generate male profile
            const maleYear = 1985 + (i % 20);
            const maleLocation = locations[i % locations.length];
            const maleBirthTime = birthTimes[i % birthTimes.length];
            
            const male = {
                name: `${maleNames[i % maleNames.length]}${Math.floor(i/5) + 1}`,
                dateOfBirth: `${maleYear}-07-15`,
                timeOfBirth: maleBirthTime,
                age: 2025 - maleYear,
                zodiacSign: zodiacSigns[i % zodiacSigns.length],
                palmSet: 'set1',
                placeOfBirth: {
                    city: maleLocation.city,
                    country: maleLocation.country,
                    latitude: maleLocation.lat,
                    longitude: maleLocation.lng,
                    timezone: maleLocation.tz
                }
            };

            // Generate female profile
            const femaleYear = 1988 + (i % 15);
            const femaleLocation = locations[(i + 1) % locations.length];
            const femaleBirthTime = birthTimes[(i + 1) % birthTimes.length];
            
            const female = {
                name: `${femaleNames[i % femaleNames.length]}${Math.floor(i/5) + 1}`,
                dateOfBirth: `${femaleYear}-11-20`,
                timeOfBirth: femaleBirthTime,
                age: 2025 - femaleYear,
                zodiacSign: zodiacSigns[(i + 3) % zodiacSigns.length],
                palmSet: 'set2',
                placeOfBirth: {
                    city: femaleLocation.city,
                    country: femaleLocation.country,
                    latitude: femaleLocation.lat,
                    longitude: femaleLocation.lng,
                    timezone: femaleLocation.tz
                }
            };

            pairs.push({ male, female, pairId: i + 1 });
        }

        return pairs;
    }

    async callFunction(functionName, payload) {
        try {
            const startTime = Date.now();
            
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.serviceRoleKey}`,
                    'apikey': this.serviceRoleKey
                },
                body: JSON.stringify(payload)
            });
            
            const responseTime = Date.now() - startTime;
            const responseText = await response.text();
            
            return { 
                ok: response.ok,
                status: response.status,
                data: responseText,
                responseTime
            };
            
        } catch (error) {
            return {
                ok: false,
                status: 0,
                data: error.message,
                responseTime: 0
            };
        }
    }

    // Create mock palm reading for user (lightweight)
    createMockPalmReading(user) {
        return {
            greeting: `Hey ${user.name}! Ready for your reading?`,
            overallPersonality: `As a ${user.zodiacSign} from ${user.placeOfBirth.country}, ${user.name} has natural charisma.`,
            lines: {
                lifeLine: { name: "Life Line", description: `${user.name}'s vitality`, meaning: "Strong life energy", personalizedInsight: "Your journey shows potential" },
                heartLine: { name: "Heart Line", description: "Deep emotions", meaning: `${user.zodiacSign} love nature`, personalizedInsight: "You love authentically" },
                headLine: { name: "Head Line", description: "Clear thinking", meaning: "Analytical mind", personalizedInsight: "Your thoughts are organized" }
            },
            mounts: {
                mars: { name: "Mount of Mars", prominence: "Well-developed", meaning: "Courage and determination" },
                venus: { name: "Mount of Venus", prominence: "Full", meaning: "Love and artistic nature" }
            }
        };
    }

    validateCompatibilityResponse(analysis) {
        const issues = [];
        
        if (!analysis.overallScore || typeof analysis.overallScore !== 'number') {
            issues.push('Overall score missing/invalid');
        }
        if (!analysis.overallLabel || analysis.overallLabel.length < 5) {
            issues.push('Overall label missing/short');
        }
        if (!analysis.enhancedCategories || analysis.enhancedCategories.length < 4) {
            issues.push(`Enhanced categories incomplete (${analysis.enhancedCategories?.length || 0}/4)`);
        }
        if (!analysis.cosmicPalmMessage || analysis.cosmicPalmMessage.length < 20) {
            issues.push('Cosmic message missing/short');
        }
        
        return {
            isComplete: issues.length === 0,
            issues: issues
        };
    }

    async testCompatibilityPair(pair, testIndex) {
        console.log(`💕 Test ${testIndex + 1}/15: ${pair.male.name} & ${pair.female.name}`);
        console.log(`   👨 ${pair.male.zodiacSign}, ${pair.male.age}y, ${pair.male.placeOfBirth.country}${pair.male.timeOfBirth ? ' +time' : ''}`);
        console.log(`   👩 ${pair.female.zodiacSign}, ${pair.female.age}y, ${pair.female.placeOfBirth.country}${pair.female.timeOfBirth ? ' +time' : ''}`);
        
        try {
            // Create mock palm readings
            const malePalmReading = this.createMockPalmReading(pair.male);
            const femalePalmReading = this.createMockPalmReading(pair.female);
            
            const result = await this.callFunction('generate-enhanced-compatibility', {
                userReading: {
                    userData: pair.male,
                    analysis: malePalmReading
                },
                partnerReading: {
                    userData: pair.female,
                    analysis: femalePalmReading
                },
                directMode: true,
                matchType: 'romantic'
            });
            
            if (result.ok) {
                try {
                    const data = JSON.parse(result.data);
                    const validation = this.validateCompatibilityResponse(data.analysis);
                    
                    const testResult = {
                        testIndex: testIndex + 1,
                        pairId: pair.pairId,
                        users: `${pair.male.name} & ${pair.female.name}`,
                        status: validation.isComplete ? 'SUCCESS' : 'INCOMPLETE',
                        responseTime: result.responseTime,
                        overallScore: data.analysis?.overallScore || 0,
                        enhancementLevel: data.enhancementLevel?.level || 'unknown',
                        issues: validation.issues
                    };
                    
                    this.results.push(testResult);
                    
                    if (validation.isComplete) {
                        console.log(`   ✅ SUCCESS - ${data.analysis.overallScore}%, ${data.enhancementLevel?.level} (${Math.round(result.responseTime/1000)}s)`);
                    } else {
                        console.log(`   ⚠️  INCOMPLETE - ${validation.issues.length} issues (${Math.round(result.responseTime/1000)}s)`);
                        validation.issues.forEach(issue => console.log(`      - ${issue}`));
                    }
                    
                    return { success: true, complete: validation.isComplete };
                    
                } catch (parseError) {
                    console.log(`   ❌ JSON PARSE ERROR (${Math.round(result.responseTime/1000)}s)`);
                    this.results.push({
                        testIndex: testIndex + 1,
                        pairId: pair.pairId,
                        users: `${pair.male.name} & ${pair.female.name}`,
                        status: 'JSON_ERROR',
                        responseTime: result.responseTime,
                        error: parseError.message
                    });
                    return { success: false, complete: false };
                }
            } else {
                console.log(`   ❌ FAILED - HTTP ${result.status} (${Math.round(result.responseTime/1000)}s)`);
                this.results.push({
                    testIndex: testIndex + 1,
                    pairId: pair.pairId,
                    users: `${pair.male.name} & ${pair.female.name}`,
                    status: 'HTTP_ERROR',
                    responseTime: result.responseTime,
                    httpStatus: result.status,
                    error: result.data.substring(0, 200)
                });
                return { success: false, complete: false };
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.message}`);
            this.results.push({
                testIndex: testIndex + 1,
                pairId: pair.pairId,
                users: `${pair.male.name} & ${pair.female.name}`,
                status: 'ERROR',
                error: error.message
            });
            return { success: false, complete: false };
        }
    }

    async runFocused15Test() {
        console.log('🚀 ENHANCED COMPATIBILITY 15-TEST VALIDATION');
        console.log('='.repeat(50));
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`🎯 Goal: 100% success rate on 15 consecutive tests`);
        console.log(`🔧 Testing: Fixed edge function with retry logic`);
        console.log('');

        const startTime = Date.now();
        
        // Run all 15 tests sequentially
        for (let i = 0; i < this.testPairs.length; i++) {
            await this.testCompatibilityPair(this.testPairs[i], i);
            
            // Brief pause between tests
            if (i < this.testPairs.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // Calculate results
        const totalTime = Date.now() - startTime;
        const successfulTests = this.results.filter(r => r.status === 'SUCCESS').length;
        const successRate = Math.round((successfulTests / this.results.length) * 100);
        const averageResponseTime = Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length);
        
        console.log('\\n' + '='.repeat(50));
        console.log('🏆 15-TEST VALIDATION RESULTS');
        console.log('='.repeat(50));
        console.log(`📊 Success Rate: ${successfulTests}/15 (${successRate}%)`);
        console.log(`⏱️  Average Response: ${averageResponseTime}ms`);
        console.log(`🕐 Total Time: ${Math.round(totalTime / 60000)} minutes`);
        
        // Show detailed breakdown
        const httpErrors = this.results.filter(r => r.status === 'HTTP_ERROR').length;
        const jsonErrors = this.results.filter(r => r.status === 'JSON_ERROR').length;
        const incompleteTests = this.results.filter(r => r.status === 'INCOMPLETE').length;
        
        if (httpErrors > 0) console.log(`❌ HTTP Errors: ${httpErrors}`);
        if (jsonErrors > 0) console.log(`🔧 JSON Errors: ${jsonErrors}`);
        if (incompleteTests > 0) console.log(`⚠️  Incomplete: ${incompleteTests}`);
        
        if (successRate === 100) {
            console.log('\\n🎉 PERFECT! 100% SUCCESS RATE ACHIEVED!');
            console.log('✅ Enhanced compatibility function is production ready!');
        } else if (successRate >= 80) {
            console.log(`\\n🟡 GOOD! ${successRate}% success rate - minor optimizations possible`);
        } else {
            console.log(`\\n🔴 NEEDS WORK! ${successRate}% success rate - investigate failures`);
            
            // Show failed test details
            const failedTests = this.results.filter(r => r.status !== 'SUCCESS');
            console.log('\\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`   Test ${test.testIndex}: ${test.users} - ${test.status} (${test.error?.substring(0, 100) || 'No details'})`);
            });
        }
        
        // Save report
        const report = {
            testType: 'Enhanced Compatibility 15-Test Validation',
            timestamp: new Date().toISOString(),
            goal: '100% success rate validation',
            results: {
                totalTests: this.results.length,
                successfulTests,
                successRate,
                averageResponseTime,
                totalTimeMinutes: Math.round(totalTime / 60000)
            },
            testResults: this.results
        };
        
        fs.writeFileSync('enhanced-compatibility-15-test-results.json', JSON.stringify(report, null, 2));
        console.log('\\n📄 Report saved: enhanced-compatibility-15-test-results.json');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
        
        return report;
    }
}

// Execute the 15-test validation
console.log('🏁 Starting Enhanced Compatibility 15-Test Validation...');
const tester = new EnhancedCompatibility15Test();
tester.runFocused15Test().catch(console.error);