// Focused Reliability Test - 100 Tests with 2 Palm Image Sets
// Tests complete field validation with diverse profiles but same palm images
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

class FocusedReliabilityTest {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        this.results = [];
        
        // Load the 2 palm image sets we have
        console.log('🖼️  Loading 2 palm image sets...');
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

        // Generate 100 diverse test profiles
        this.testProfiles = this.generateTestProfiles();
        
        if (this.palmImageSets.set1.left && this.palmImageSets.set2.left) {
            console.log('✅ Both palm image sets loaded successfully');
            console.log(`📊 Generated ${this.testProfiles.length} test profiles`);
        } else {
            console.log('❌ Failed to load palm images');
        }
    }

    generateTestProfiles() {
        const profiles = [];
        const baseNames = ['Alexandre', 'Elena', 'Marcus', 'Sofia', 'David', 'Luna', 'Carlos', 'Aria', 'James', 'Maya'];
        const locations = [
            { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
            { city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, tz: 'Europe/Bucharest' },
            { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
            { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
            { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, tz: 'America/Sao_Paulo' }
        ];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const birthTimes = ['08:15', '10:30', '14:45', '16:20', '22:10', null];

        for (let i = 0; i < 100; i++) {
            const birthYear = 1980 + Math.floor(Math.random() * 30); // 1980-2010
            const birthMonth = Math.floor(Math.random() * 12) + 1;
            const birthDay = Math.floor(Math.random() * 28) + 1;
            const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
            const age = 2025 - birthYear;
            const location = locations[Math.floor(Math.random() * locations.length)];
            const birthTime = birthTimes[Math.floor(Math.random() * birthTimes.length)];
            const nameIndex = i % baseNames.length;
            const nameVariant = Math.floor(i / baseNames.length) + 1;

            profiles.push({
                name: `${baseNames[nameIndex]}${nameVariant}`,
                dateOfBirth: birthDate,
                timeOfBirth: birthTime,
                age: age,
                zodiacSign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
                palmSet: i % 2 === 0 ? 'set1' : 'set2', // Alternate between the 2 palm sets
                placeOfBirth: {
                    city: location.city,
                    country: location.country,
                    latitude: location.lat,
                    longitude: location.lng,
                    timezone: location.tz
                }
            });
        }

        return profiles;
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

    validateReadingCompleteness(reading) {
        const issues = [];
        
        // Check essential fields
        if (!reading.greeting || reading.greeting.length < 10) issues.push('Greeting missing/short');
        if (!reading.overallPersonality || reading.overallPersonality.length < 20) issues.push('Personality missing/short');
        
        // Check lines (7 required)
        const requiredLines = ['lifeLine', 'heartLine', 'headLine', 'marriageLine', 'fateLine', 'successLine', 'travelLine'];
        if (!reading.lines) {
            issues.push('Lines section missing');
        } else {
            requiredLines.forEach(line => {
                if (!reading.lines[line]) {
                    issues.push(`Missing: ${line}`);
                } else {
                    const l = reading.lines[line];
                    if (!l.name) issues.push(`${line}.name missing`);
                    if (!l.description) issues.push(`${line}.description missing`);
                    if (!l.meaning) issues.push(`${line}.meaning missing`);
                    if (!l.personalizedInsight) issues.push(`${line}.personalizedInsight missing`);
                }
            });
        }
        
        // Check mounts (7 required)
        const requiredMounts = ['mars', 'jupiter', 'saturn', 'sun', 'mercury', 'moon', 'venus'];
        if (!reading.mounts) {
            issues.push('Mounts section missing');
        } else {
            requiredMounts.forEach(mount => {
                if (!reading.mounts[mount]) {
                    issues.push(`Missing: ${mount} mount`);
                } else {
                    const m = reading.mounts[mount];
                    if (!m.name) issues.push(`${mount}.name missing`);
                    if (!m.prominence) issues.push(`${mount}.prominence missing`);
                    if (!m.meaning) issues.push(`${mount}.meaning missing`);
                }
            });
        }
        
        // Check other required fields
        if (!reading.specialMarkings || reading.specialMarkings.length !== 4) {
            issues.push(`SpecialMarkings not 4 items (${reading.specialMarkings?.length || 0})`);
        }
        if (!reading.handComparison || reading.handComparison.length < 30) issues.push('HandComparison missing/short');
        if (!reading.futureInsights || reading.futureInsights.length < 50) issues.push('FutureInsights missing/short');
        if (!reading.personalizedAdvice || reading.personalizedAdvice.length < 50) issues.push('PersonalizedAdvice missing/short');
        if (!reading.luckyElements) {
            issues.push('LuckyElements missing');
        } else {
            if (!reading.luckyElements.colors || reading.luckyElements.colors.length !== 3) issues.push('Lucky colors not 3');
            if (!reading.luckyElements.numbers || reading.luckyElements.numbers.length !== 3) issues.push('Lucky numbers not 3');
            if (!reading.luckyElements.days || reading.luckyElements.days.length !== 2) issues.push('Lucky days not 2');
        }
        
        return {
            isComplete: issues.length === 0,
            issues: issues
        };
    }

    async testSinglePalmReading(profile, testIndex) {
        const palmImages = this.palmImageSets[profile.palmSet];
        
        console.log(`🔍 Test ${testIndex + 1}/100: ${profile.name}`);
        console.log(`   📊 ${profile.zodiacSign}, ${profile.age}y, ${profile.placeOfBirth.country}${profile.timeOfBirth ? ', birth time' : ''}`);
        console.log(`   🖼️  Using palm set: ${profile.palmSet}`);
        
        const result = await this.callFunction('generate-palm-reading', {
            userData: profile,
            leftPalmImage: palmImages.left,
            rightPalmImage: palmImages.right
        });
        
        if (result.ok) {
            try {
                const data = JSON.parse(result.data);
                const validation = this.validateReadingCompleteness(data.reading);
                
                const testResult = {
                    testIndex: testIndex + 1,
                    profile: profile.name,
                    status: validation.isComplete ? 'PERFECT' : 'INCOMPLETE',
                    responseTime: result.responseTime,
                    tokensUsed: data.usage?.total_tokens || 0,
                    issues: validation.issues,
                    palmSet: profile.palmSet,
                    hasTimeOfBirth: !!profile.timeOfBirth,
                    country: profile.placeOfBirth.country,
                    zodiac: profile.zodiacSign
                };
                
                this.results.push(testResult);
                
                if (validation.isComplete) {
                    console.log(`   ✅ PERFECT (${Math.round(result.responseTime/1000)}s, ${data.usage?.total_tokens || 0} tokens)`);
                } else {
                    console.log(`   ⚠️  INCOMPLETE - ${validation.issues.length} issues (${Math.round(result.responseTime/1000)}s)`);
                    if (validation.issues.length <= 3) {
                        console.log(`      Issues: ${validation.issues.join(', ')}`);
                    } else {
                        console.log(`      Major issues: ${validation.issues.slice(0, 3).join(', ')}... (+${validation.issues.length - 3} more)`);
                    }
                }
                
                return { success: true, complete: validation.isComplete };
                
            } catch (parseError) {
                console.log(`   ❌ JSON PARSE ERROR (${Math.round(result.responseTime/1000)}s)`);
                this.results.push({
                    testIndex: testIndex + 1,
                    profile: profile.name,
                    status: 'JSON_ERROR',
                    responseTime: result.responseTime,
                    error: parseError.message,
                    palmSet: profile.palmSet
                });
                return { success: false, complete: false };
            }
        } else {
            console.log(`   ❌ FAILED - HTTP ${result.status} (${Math.round(result.responseTime/1000)}s)`);
            this.results.push({
                testIndex: testIndex + 1,
                profile: profile.name,
                status: 'HTTP_ERROR',
                responseTime: result.responseTime,
                httpStatus: result.status,
                error: result.data,
                palmSet: profile.palmSet
            });
            return { success: false, complete: false };
        }
    }

    async runFocusedReliabilityTest() {
        console.log('🚀 FOCUSED RELIABILITY TEST - 100 PALM READINGS');
        console.log('='.repeat(60));
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`🎯 Testing: Complete field validation with 2 palm image sets`);
        console.log(`📊 Profiles: 100 diverse users, alternating between palm sets`);
        console.log('');

        const startTime = Date.now();
        
        // Run all 100 tests
        for (let i = 0; i < this.testProfiles.length; i++) {
            await this.testSinglePalmReading(this.testProfiles[i], i);
            
            // Brief pause to avoid rate limits
            if (i < this.testProfiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            // Progress update every 10 tests
            if ((i + 1) % 10 === 0) {
                const perfectSoFar = this.results.filter(r => r.status === 'PERFECT').length;
                const percentComplete = Math.round(((i + 1) / this.testProfiles.length) * 100);
                const successRate = Math.round((perfectSoFar / (i + 1)) * 100);
                console.log(`   📈 Progress: ${i + 1}/100 (${percentComplete}%) - Success rate: ${successRate}%`);
            }
        }
        
        // Calculate final statistics
        const totalTime = Date.now() - startTime;
        const perfectReadings = this.results.filter(r => r.status === 'PERFECT').length;
        const incompleteReadings = this.results.filter(r => r.status === 'INCOMPLETE').length;
        const jsonErrors = this.results.filter(r => r.status === 'JSON_ERROR').length;
        const httpErrors = this.results.filter(r => r.status === 'HTTP_ERROR').length;
        const successRate = Math.round((perfectReadings / this.results.length) * 100);
        const averageResponseTime = Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length);
        const averageTokens = Math.round(this.results.filter(r => r.tokensUsed).reduce((sum, r) => sum + r.tokensUsed, 0) / this.results.filter(r => r.tokensUsed).length);
        
        // Analyze by palm set
        const set1Results = this.results.filter(r => r.palmSet === 'set1');
        const set2Results = this.results.filter(r => r.palmSet === 'set2');
        const set1Success = Math.round((set1Results.filter(r => r.status === 'PERFECT').length / set1Results.length) * 100);
        const set2Success = Math.round((set2Results.filter(r => r.status === 'PERFECT').length / set2Results.length) * 100);
        
        console.log('\n' + '='.repeat(60));
        console.log('🏆 FOCUSED RELIABILITY TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${this.results.length}`);
        console.log(`✅ Perfect Results: ${perfectReadings} (${successRate}%)`);
        console.log(`⚠️  Incomplete: ${incompleteReadings}`);
        console.log(`🔧 JSON Errors: ${jsonErrors}`);
        console.log(`❌ HTTP Errors: ${httpErrors}`);
        console.log(`⏱️  Average Response: ${averageResponseTime}ms`);
        console.log(`🪙 Average Tokens: ${averageTokens}`);
        console.log(`🕐 Total Time: ${Math.round(totalTime / 60000)} minutes`);
        
        console.log('\n📊 Performance by Palm Set:');
        console.log(`   🖼️  Set 1: ${set1Results.filter(r => r.status === 'PERFECT').length}/${set1Results.length} (${set1Success}%)`);
        console.log(`   🖼️  Set 2: ${set2Results.filter(r => r.status === 'PERFECT').length}/${set2Results.length} (${set2Success}%)`);
        
        // Show most common issues
        const allIssues = this.results.filter(r => r.issues).flatMap(r => r.issues);
        const issueCount = {};
        allIssues.forEach(issue => {
            issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
        const topIssues = Object.entries(issueCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (topIssues.length > 0) {
            console.log('\n🔍 Most Common Issues:');
            topIssues.forEach(([issue, count]) => {
                console.log(`   ${count}x: ${issue}`);
            });
        }
        
        // Success rate assessment
        if (successRate >= 95) {
            console.log('\n🎉 EXCELLENT! 95%+ SUCCESS RATE - SYSTEM READY FOR PRODUCTION!');
        } else if (successRate >= 90) {
            console.log('\n🟢 GREAT! 90%+ SUCCESS RATE - Minor improvements possible');
        } else if (successRate >= 80) {
            console.log('\n🟡 GOOD! 80%+ SUCCESS RATE - Some optimization needed');
        } else {
            console.log('\n🔴 NEEDS WORK! <80% SUCCESS RATE - Investigate major issues');
        }
        
        // Save comprehensive report
        const report = {
            testType: 'Focused Reliability Test',
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.results.length,
                perfectReadings,
                incompleteReadings,
                jsonErrors,
                httpErrors,
                successRate,
                averageResponseTime,
                averageTokens,
                totalTimeMinutes: Math.round(totalTime / 60000),
                palmSetPerformance: {
                    set1: { tests: set1Results.length, perfect: set1Results.filter(r => r.status === 'PERFECT').length, successRate: set1Success },
                    set2: { tests: set2Results.length, perfect: set2Results.filter(r => r.status === 'PERFECT').length, successRate: set2Success }
                }
            },
            topIssues: topIssues.map(([issue, count]) => ({ issue, count })),
            results: this.results
        };
        
        fs.writeFileSync('focused-reliability-test-results.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved: focused-reliability-test-results.json');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
        
        return report;
    }
}

// Execute the focused reliability test
console.log('🏁 Starting Focused Reliability Test...');
const tester = new FocusedReliabilityTest();
tester.runFocusedReliabilityTest().catch(console.error);