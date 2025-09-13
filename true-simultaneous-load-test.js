// True Simultaneous Load Test - 200 users hitting edge functions at EXACTLY the same time
// No stagger, no delays - pure simultaneous load testing
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

class TrueSimultaneousLoadTester {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        // Load real palm images once
        this.palmImages = {
            set1: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
            },
            set2: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (2).jpeg')
            }
        };

        // Generate test data sets
        this.palmReadingProfiles = this.generatePalmReadingProfiles(100);
        this.compatibilityPairs = this.generateCompatibilityPairs(100);
        
        this.results = {
            palmReading: [],
            compatibility: [],
            startTime: null,
            endTime: null,
            simultaneousStartTime: null
        };
    }

    generatePalmReadingProfiles(count) {
        const profiles = [];
        const names = ['Alexandre', 'Elena', 'Marcus', 'Sofia', 'David', 'Luna', 'Carlos', 'Aria', 'James', 'Maya'];
        const countries = ['France', 'Romania', 'Italy', 'Spain', 'Czech Republic'];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'];
        const birthTimes = ['08:15', '14:30', '22:10', null];

        for (let i = 0; i < count; i++) {
            const birthYear = 1980 + (i % 30);
            profiles.push({
                id: `palm_${i + 1}`,
                name: `${names[i % names.length]}${Math.floor(i/names.length) + 1}`,
                dateOfBirth: `${birthYear}-${String(Math.floor(i % 12) + 1).padStart(2, '0')}-15`,
                timeOfBirth: birthTimes[i % birthTimes.length],
                age: 2025 - birthYear,
                zodiacSign: zodiacSigns[i % zodiacSigns.length],
                palmSet: i % 2 === 0 ? 'set1' : 'set2',
                placeOfBirth: {
                    country: countries[i % countries.length],
                    city: 'TestCity' + (i % 5),
                    latitude: 45.0 + (i % 10),
                    longitude: 2.0 + (i % 10),
                    timezone: 'Europe/Paris'
                }
            });
        }
        return profiles;
    }

    generateCompatibilityPairs(count) {
        const pairs = [];
        const maleNames = ['Alexandre', 'Marcus', 'David', 'Carlos', 'James'];
        const femaleNames = ['Elena', 'Sofia', 'Luna', 'Aria', 'Maya'];
        const countries = ['France', 'Romania', 'Italy', 'Spain', 'Czech Republic'];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'];
        const birthTimes = ['08:15', '14:30', '22:10', null];

        for (let i = 0; i < count; i++) {
            const maleYear = 1985 + (i % 20);
            const femaleYear = 1988 + (i % 15);
            
            const male = {
                name: `${maleNames[i % maleNames.length]}${Math.floor(i/5) + 1}`,
                dateOfBirth: `${maleYear}-06-${String((i % 28) + 1).padStart(2, '0')}`,
                timeOfBirth: birthTimes[i % birthTimes.length],
                age: 2025 - maleYear,
                zodiacSign: zodiacSigns[i % zodiacSigns.length],
                palmSet: 'set1',
                placeOfBirth: {
                    country: countries[i % countries.length],
                    city: 'TestCity' + (i % 3),
                    latitude: 46.0 + (i % 5),
                    longitude: 3.0 + (i % 5),
                    timezone: 'Europe/Paris'
                }
            };

            const female = {
                name: `${femaleNames[i % femaleNames.length]}${Math.floor(i/5) + 1}`,
                dateOfBirth: `${femaleYear}-09-${String((i % 28) + 1).padStart(2, '0')}`,
                timeOfBirth: birthTimes[(i + 1) % birthTimes.length],
                age: 2025 - femaleYear,
                zodiacSign: zodiacSigns[(i + 2) % zodiacSigns.length],
                palmSet: 'set2',
                placeOfBirth: {
                    country: countries[(i + 1) % countries.length],
                    city: 'TestCity' + ((i + 1) % 3),
                    latitude: 47.0 + (i % 5),
                    longitude: 4.0 + (i % 5),
                    timezone: 'Europe/Rome'
                }
            };

            pairs.push({
                id: `compat_${i + 1}`,
                male,
                female
            });
        }
        return pairs;
    }

    async callEdgeFunction(functionName, payload, testId) {
        try {
            // Record exact start time when function is called
            const startTime = Date.now();
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout for heavy load
            
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.serviceRoleKey}`,
                    'apikey': this.serviceRoleKey
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            const responseText = await response.text();
            
            return { 
                testId,
                ok: response.ok,
                status: response.status,
                data: responseText,
                responseTime,
                timestamp: new Date().toISOString(),
                requestStartTime: startTime
            };
            
        } catch (error) {
            return {
                testId,
                ok: false,
                status: 0,
                data: error.message,
                responseTime: 0,
                timestamp: new Date().toISOString(),
                error: error.message,
                requestStartTime: Date.now()
            };
        }
    }

    createMockPalmReading(user) {
        return {
            greeting: `Hey ${user.name}! Ready for your palm reading?`,
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

    async runTrueSimultaneousTest() {
        console.log('🚀 TRUE SIMULTANEOUS LOAD TEST - 200 USERS AT EXACTLY THE SAME TIME');
        console.log('='.repeat(80));
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`💥 Testing: ALL 200 requests fire simultaneously with NO stagger`);
        console.log(`🔥 Load: Maximum thundering herd stress test`);
        console.log('');

        this.results.startTime = Date.now();

        console.log('📋 Preparing all 200 requests...');
        
        // Prepare all palm reading requests
        const palmPromises = this.palmReadingProfiles.map((profile) => {
            const palmImages = this.palmImages[profile.palmSet];
            return () => this.callEdgeFunction('generate-palm-reading', {
                userData: profile,
                leftPalmImage: palmImages.left,
                rightPalmImage: palmImages.right
            }, profile.id);
        });

        // Prepare all compatibility requests
        const compatPromises = this.compatibilityPairs.map((pair) => {
            const malePalmReading = this.createMockPalmReading(pair.male);
            const femalePalmReading = this.createMockPalmReading(pair.female);
            
            return () => this.callEdgeFunction('generate-enhanced-compatibility', {
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
            }, pair.id);
        });

        // Combine all requests
        const allRequests = [...palmPromises, ...compatPromises];
        
        console.log(`🎯 ${allRequests.length} requests prepared. Firing ALL simultaneously in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('⏳ 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('⏳ 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // FIRE ALL REQUESTS SIMULTANEOUSLY!
        console.log('💥 FIRING ALL 200 REQUESTS NOW!');
        this.results.simultaneousStartTime = Date.now();
        
        const allResults = await Promise.allSettled(allRequests.map(request => request()));

        this.results.endTime = Date.now();
        const totalTime = this.results.endTime - this.results.startTime;
        const simultaneousTime = this.results.endTime - this.results.simultaneousStartTime;

        // Process results
        const palmResults = allResults.slice(0, 100);
        const compatResults = allResults.slice(100, 200);

        // Process palm reading results
        palmResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const testResult = result.value;
                let status = 'FAILED';
                let issues = [];
                
                if (testResult.ok) {
                    try {
                        const data = JSON.parse(testResult.data);
                        if (data.reading && data.reading.greeting && data.reading.lines) {
                            status = 'SUCCESS';
                        } else {
                            status = 'INCOMPLETE';
                            issues.push('Missing required fields');
                        }
                    } catch (e) {
                        status = 'JSON_ERROR';
                        issues.push('JSON parse failed');
                    }
                } else {
                    issues.push(`HTTP ${testResult.status}`);
                }
                
                this.results.palmReading.push({
                    testId: testResult.testId,
                    profile: this.palmReadingProfiles[index].name,
                    status,
                    responseTime: testResult.responseTime,
                    httpStatus: testResult.status,
                    issues,
                    timestamp: testResult.timestamp,
                    requestStartTime: testResult.requestStartTime
                });
            } else {
                this.results.palmReading.push({
                    testId: `palm_${index + 1}`,
                    profile: this.palmReadingProfiles[index].name,
                    status: 'ERROR',
                    responseTime: 0,
                    error: result.reason?.message || 'Unknown error',
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Process compatibility results
        compatResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const testResult = result.value;
                let status = 'FAILED';
                let issues = [];
                let overallScore = 0;
                
                if (testResult.ok) {
                    try {
                        const data = JSON.parse(testResult.data);
                        if (data.analysis && data.analysis.overallScore && data.analysis.enhancedCategories) {
                            status = 'SUCCESS';
                            overallScore = data.analysis.overallScore;
                        } else {
                            status = 'INCOMPLETE';
                            issues.push('Missing required fields');
                        }
                    } catch (e) {
                        status = 'JSON_ERROR';
                        issues.push('JSON parse failed');
                    }
                } else {
                    issues.push(`HTTP ${testResult.status}`);
                }
                
                this.results.compatibility.push({
                    testId: testResult.testId,
                    users: `${this.compatibilityPairs[index].male.name} & ${this.compatibilityPairs[index].female.name}`,
                    status,
                    responseTime: testResult.responseTime,
                    httpStatus: testResult.status,
                    overallScore,
                    issues,
                    timestamp: testResult.timestamp,
                    requestStartTime: testResult.requestStartTime
                });
            } else {
                this.results.compatibility.push({
                    testId: `compat_${index + 1}`,
                    users: `${this.compatibilityPairs[index].male.name} & ${this.compatibilityPairs[index].female.name}`,
                    status: 'ERROR',
                    responseTime: 0,
                    error: result.reason?.message || 'Unknown error',
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Calculate statistics
        const palmSuccess = this.results.palmReading.filter(r => r.status === 'SUCCESS').length;
        const palmFailed = this.results.palmReading.filter(r => r.status !== 'SUCCESS').length;
        const palmAvgTime = this.results.palmReading.filter(r => r.responseTime > 0).length > 0 ? Math.round(
            this.results.palmReading
                .filter(r => r.responseTime > 0)
                .reduce((sum, r) => sum + r.responseTime, 0) / 
            this.results.palmReading.filter(r => r.responseTime > 0).length
        ) : 0;

        const compatSuccess = this.results.compatibility.filter(r => r.status === 'SUCCESS').length;
        const compatFailed = this.results.compatibility.filter(r => r.status !== 'SUCCESS').length;
        const compatAvgTime = this.results.compatibility.filter(r => r.responseTime > 0).length > 0 ? Math.round(
            this.results.compatibility
                .filter(r => r.responseTime > 0)
                .reduce((sum, r) => sum + r.responseTime, 0) / 
            this.results.compatibility.filter(r => r.responseTime > 0).length
        ) : 0;

        const totalSuccess = palmSuccess + compatSuccess;
        const totalTests = this.results.palmReading.length + this.results.compatibility.length;
        const overallSuccessRate = Math.round((totalSuccess / totalTests) * 100);

        // Display results
        console.log('\\n' + '='.repeat(80));
        console.log('🏆 TRUE SIMULTANEOUS LOAD TEST RESULTS');
        console.log('='.repeat(80));
        console.log(`💥 THUNDERING HERD: All ${totalTests} requests fired simultaneously`);
        console.log(`📊 Total Success: ${totalSuccess}/${totalTests} (${overallSuccessRate}%)`);
        console.log(`🕐 Total Time: ${Math.round(totalTime / 1000)} seconds`);
        console.log(`⚡ Simultaneous Execution Time: ${Math.round(simultaneousTime / 1000)} seconds`);
        
        console.log('\\n🤲 Palm Reading Results (100 simultaneous):');
        console.log(`   ✅ Success: ${palmSuccess}/100 (${Math.round((palmSuccess/100)*100)}%)`);
        console.log(`   ❌ Failed: ${palmFailed}/100`);
        console.log(`   ⏱️  Avg Response: ${palmAvgTime}ms`);
        
        console.log('\\n💕 Enhanced Compatibility Results (100 simultaneous):');
        console.log(`   ✅ Success: ${compatSuccess}/100 (${Math.round((compatSuccess/100)*100)}%)`);
        console.log(`   ❌ Failed: ${compatFailed}/100`);
        console.log(`   ⏱️  Avg Response: ${compatAvgTime}ms`);

        // Show error breakdown
        const palmTimeouts = this.results.palmReading.filter(r => r.error?.includes('abort')).length;
        const palmHttpErrors = this.results.palmReading.filter(r => r.issues?.some(i => i.includes('HTTP 5'))).length;
        const compatTimeouts = this.results.compatibility.filter(r => r.error?.includes('abort')).length;
        const compatHttpErrors = this.results.compatibility.filter(r => r.issues?.some(i => i.includes('HTTP 5'))).length;
        
        if (palmHttpErrors > 0 || compatHttpErrors > 0 || palmTimeouts > 0 || compatTimeouts > 0) {
            console.log('\\n⚠️  Error Breakdown:');
            if (palmHttpErrors > 0) console.log(`   🤲 Palm Reading HTTP 5xx: ${palmHttpErrors}`);
            if (palmTimeouts > 0) console.log(`   🤲 Palm Reading Timeouts: ${palmTimeouts}`);
            if (compatHttpErrors > 0) console.log(`   💕 Compatibility HTTP 5xx: ${compatHttpErrors}`);
            if (compatTimeouts > 0) console.log(`   💕 Compatibility Timeouts: ${compatTimeouts}`);
        }

        // Performance assessment under true simultaneous load
        console.log('\\n📊 THUNDERING HERD PERFORMANCE ANALYSIS:');
        if (overallSuccessRate >= 90) {
            console.log('🎉 INCREDIBLE! 90%+ success rate even with 200 simultaneous users!');
            console.log('✅ Both edge functions can handle extreme thundering herd loads!');
        } else if (overallSuccessRate >= 75) {
            console.log('🟢 EXCELLENT! 75%+ success rate under extreme simultaneous load');
            console.log('✅ System handles thundering herd scenarios well');
        } else if (overallSuccessRate >= 50) {
            console.log('🟡 ACCEPTABLE! 50%+ success rate - typical for extreme loads');
            console.log('⚡ Some requests fail under thundering herd, which is expected');
        } else {
            console.log('🔴 NEEDS WORK! <50% success rate under simultaneous load');
            console.log('💡 Consider implementing request queuing or rate limiting');
        }

        // Save comprehensive report
        const report = {
            testType: 'True Simultaneous Load Test (Thundering Herd)',
            timestamp: new Date().toISOString(),
            testParameters: {
                palmReadingTests: 100,
                compatibilityTests: 100,
                totalTests: 200,
                simultaneousExecution: true,
                noStagger: true,
                thunderingHerd: true
            },
            timing: {
                totalTimeSeconds: Math.round(totalTime / 1000),
                simultaneousExecutionSeconds: Math.round(simultaneousTime / 1000),
                startTime: new Date(this.results.startTime).toISOString(),
                simultaneousStartTime: new Date(this.results.simultaneousStartTime).toISOString(),
                endTime: new Date(this.results.endTime).toISOString()
            },
            summary: {
                totalTests,
                totalSuccess,
                overallSuccessRate,
                palmReading: {
                    success: palmSuccess,
                    failed: palmFailed,
                    successRate: Math.round((palmSuccess/100)*100),
                    avgResponseTime: palmAvgTime,
                    timeouts: palmTimeouts,
                    httpErrors: palmHttpErrors
                },
                compatibility: {
                    success: compatSuccess,
                    failed: compatFailed,
                    successRate: Math.round((compatSuccess/100)*100),
                    avgResponseTime: compatAvgTime,
                    timeouts: compatTimeouts,
                    httpErrors: compatHttpErrors
                }
            },
            detailedResults: {
                palmReading: this.results.palmReading,
                compatibility: this.results.compatibility
            }
        };
        
        fs.writeFileSync('true-simultaneous-load-test-results.json', JSON.stringify(report, null, 2));
        console.log('\\n📄 Comprehensive report saved: true-simultaneous-load-test-results.json');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
        
        return report;
    }
}

// Execute the true simultaneous load test
console.log('🏁 Initializing True Simultaneous Load Test...');
const tester = new TrueSimultaneousLoadTester();

if (!tester.palmImages.set1.left || !tester.palmImages.set2.left) {
    console.error('❌ Failed to load palm images - test cannot proceed');
    process.exit(1);
}

console.log('✅ Palm images loaded successfully');
console.log(`📊 Generated ${tester.palmReadingProfiles.length} palm reading profiles`);
console.log(`💕 Generated ${tester.compatibilityPairs.length} compatibility pairs`);
console.log('💥 Preparing for TRUE SIMULTANEOUS execution...');

tester.runTrueSimultaneousTest().catch(console.error);