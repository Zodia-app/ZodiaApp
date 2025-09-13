// Enhanced Compatibility 100-Test Plan
// Tests complete compatibility analysis with birth data integration
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

class EnhancedCompatibility100Test {
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

        // Generate 100 user pairs for compatibility testing
        this.userPairs = this.generateUserPairs();
        
        if (this.palmImageSets.set1.left && this.palmImageSets.set2.left) {
            console.log('✅ Both palm image sets loaded successfully');
            console.log(`📊 Generated ${this.userPairs.length} user pairs for compatibility testing`);
        } else {
            console.log('❌ Failed to load palm images');
        }
    }

    generateUserPairs() {
        const pairs = [];
        const maleNames = ['Alexandre', 'Marcus', 'David', 'Carlos', 'James', 'Luca', 'Miguel', 'Adrian', 'Gabriel', 'Sebastian'];
        const femaleNames = ['Elena', 'Sofia', 'Luna', 'Aria', 'Maya', 'Isabella', 'Camila', 'Victoria', 'Natalia', 'Valentina'];
        const locations = [
            { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
            { city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, tz: 'Europe/Bucharest' },
            { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, tz: 'Europe/Madrid' },
            { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, tz: 'Europe/Rome' },
            { city: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, tz: 'Europe/Prague' }
        ];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const birthTimes = ['08:15', '10:30', '14:45', '16:20', '22:10', null];

        for (let i = 0; i < 100; i++) {
            // Generate male profile
            const maleYear = 1980 + Math.floor(Math.random() * 25); // 1980-2005
            const maleMonth = Math.floor(Math.random() * 12) + 1;
            const maleDay = Math.floor(Math.random() * 28) + 1;
            const maleLocation = locations[Math.floor(Math.random() * locations.length)];
            const maleBirthTime = birthTimes[Math.floor(Math.random() * birthTimes.length)];
            
            const male = {
                name: `${maleNames[i % maleNames.length]}${Math.floor(i/maleNames.length) + 1}`,
                dateOfBirth: `${maleYear}-${maleMonth.toString().padStart(2, '0')}-${maleDay.toString().padStart(2, '0')}`,
                timeOfBirth: maleBirthTime,
                age: 2025 - maleYear,
                zodiacSign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
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
            const femaleYear = 1980 + Math.floor(Math.random() * 25); // 1980-2005
            const femaleMonth = Math.floor(Math.random() * 12) + 1;
            const femaleDay = Math.floor(Math.random() * 28) + 1;
            const femaleLocation = locations[Math.floor(Math.random() * locations.length)];
            const femaleBirthTime = birthTimes[Math.floor(Math.random() * birthTimes.length)];
            
            const female = {
                name: `${femaleNames[i % femaleNames.length]}${Math.floor(i/femaleNames.length) + 1}`,
                dateOfBirth: `${femaleYear}-${femaleMonth.toString().padStart(2, '0')}-${femaleDay.toString().padStart(2, '0')}`,
                timeOfBirth: femaleBirthTime,
                age: 2025 - femaleYear,
                zodiacSign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
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

    // Create mock palm reading for user (since we need palm data for compatibility)
    createMockPalmReading(user) {
        return {
            greeting: `Hey ${user.name}! Ready for your palm reading adventure?`,
            overallPersonality: `As a ${user.zodiacSign} from ${user.placeOfBirth.country}, ${user.name} has a unique blend of cultural wisdom and zodiac intuition.`,
            lines: {
                lifeLine: { name: "Life Line", description: `${user.name}'s life line shows vitality`, meaning: "Strong life energy", personalizedInsight: "Your journey is filled with potential" },
                heartLine: { name: "Heart Line", description: "Deep emotional capacity", meaning: `${user.zodiacSign} love nature`, personalizedInsight: "You love with depth and sincerity" },
                headLine: { name: "Head Line", description: "Clear thinking patterns", meaning: "Analytical mind", personalizedInsight: "Your thoughts are well-organized" },
                marriageLine: { name: "Marriage Line", description: "Commitment patterns", meaning: "Partnership potential", personalizedInsight: "Strong relationship foundations" },
                fateLine: { name: "Fate Line", description: "Career direction", meaning: "Professional path", personalizedInsight: "Success through dedication" },
                successLine: { name: "Success Line", description: "Achievement potential", meaning: "Recognition coming", personalizedInsight: "Your talents will be recognized" },
                travelLine: { name: "Travel Line", description: "Adventure spirit", meaning: "Journey ahead", personalizedInsight: "Exploration brings growth" }
            },
            mounts: {
                mars: { name: "Mount of Mars", prominence: "Well-developed", meaning: "Courage and determination" },
                jupiter: { name: "Mount of Jupiter", prominence: "Prominent", meaning: "Leadership qualities" },
                saturn: { name: "Mount of Saturn", prominence: "Moderate", meaning: "Discipline and wisdom" },
                sun: { name: "Mount of Sun", prominence: "Strong", meaning: "Creativity and recognition" },
                mercury: { name: "Mount of Mercury", prominence: "Developed", meaning: "Communication skills" },
                moon: { name: "Mount of Moon", prominence: "Prominent", meaning: "Intuition and imagination" },
                venus: { name: "Mount of Venus", prominence: "Full", meaning: "Love and artistic nature" }
            }
        };
    }

    validateCompatibilityCompleteness(analysis) {
        const issues = [];
        
        if (!analysis.overallScore || typeof analysis.overallScore !== 'number') {
            issues.push('Overall score missing/invalid');
        }
        if (!analysis.overallLabel || analysis.overallLabel.length < 5) {
            issues.push('Overall label missing/short');
        }
        
        // Check analysis breakdown
        if (!analysis.analysisBreakdown) {
            issues.push('Analysis breakdown missing');
        } else {
            if (!analysis.analysisBreakdown.palmReadingInsights?.score) {
                issues.push('Palm reading insights score missing');
            }
            if (!analysis.analysisBreakdown.astrologicalInsights?.score) {
                issues.push('Astrological insights score missing');
            }
        }
        
        // Check enhanced categories (should be 4)
        if (!analysis.enhancedCategories || analysis.enhancedCategories.length < 4) {
            issues.push(`Enhanced categories incomplete (${analysis.enhancedCategories?.length || 0}/4)`);
        } else {
            analysis.enhancedCategories.forEach((cat, i) => {
                if (!cat.category) issues.push(`Category ${i+1} name missing`);
                if (!cat.score || typeof cat.score !== 'number') issues.push(`Category ${i+1} score missing`);
                if (!cat.emoji) issues.push(`Category ${i+1} emoji missing`);
            });
        }
        
        if (!analysis.cosmicPalmMessage || analysis.cosmicPalmMessage.length < 30) {
            issues.push('Cosmic message missing/short');
        }
        
        return {
            isComplete: issues.length === 0,
            issues: issues
        };
    }

    async testCompatibilityPair(pair, testIndex) {
        console.log(`💕 Test ${testIndex + 1}/100: ${pair.male.name} & ${pair.female.name}`);
        console.log(`   👨 ${pair.male.zodiacSign}, ${pair.male.age}y, ${pair.male.placeOfBirth.country}${pair.male.timeOfBirth ? ' +time' : ''}`);
        console.log(`   👩 ${pair.female.zodiacSign}, ${pair.female.age}y, ${pair.female.placeOfBirth.country}${pair.female.timeOfBirth ? ' +time' : ''}`);
        
        try {
            // Create mock palm readings for both users
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
                    const validation = this.validateCompatibilityCompleteness(data.analysis);
                    
                    const testResult = {
                        testIndex: testIndex + 1,
                        pairId: pair.pairId,
                        users: `${pair.male.name} & ${pair.female.name}`,
                        status: validation.isComplete ? 'PERFECT' : 'INCOMPLETE',
                        responseTime: result.responseTime,
                        overallScore: data.analysis?.overallScore || 0,
                        enhancementLevel: data.enhancementLevel?.level || 'unknown',
                        dataCompleteness: data.enhancementLevel?.percentage || 0,
                        issues: validation.issues,
                        maleBirthTime: !!pair.male.timeOfBirth,
                        femaleBirthTime: !!pair.female.timeOfBirth,
                        countries: `${pair.male.placeOfBirth.country}-${pair.female.placeOfBirth.country}`,
                        zodiacMatch: `${pair.male.zodiacSign}-${pair.female.zodiacSign}`
                    };
                    
                    this.results.push(testResult);
                    
                    if (validation.isComplete) {
                        console.log(`   ✅ PERFECT - ${data.analysis.overallScore}%, ${data.enhancementLevel?.level} (${Math.round(result.responseTime/1000)}s)`);
                    } else {
                        console.log(`   ⚠️  INCOMPLETE - ${validation.issues.length} issues (${Math.round(result.responseTime/1000)}s)`);
                        if (validation.issues.length <= 2) {
                            console.log(`      Issues: ${validation.issues.join(', ')}`);
                        }
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
                    error: result.data
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

    async runCompatibility100Test() {
        console.log('🚀 ENHANCED COMPATIBILITY 100-TEST PLAN');
        console.log('='.repeat(60));
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`💕 Testing: Complete enhanced compatibility validation`);
        console.log(`📊 Pairs: 100 diverse romantic pairs with birth data`);
        console.log('');

        const startTime = Date.now();
        
        // Run all 100 compatibility tests
        for (let i = 0; i < this.userPairs.length; i++) {
            await this.testCompatibilityPair(this.userPairs[i], i);
            
            // Brief pause to avoid rate limits
            if (i < this.userPairs.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
            
            // Progress update every 10 tests
            if ((i + 1) % 10 === 0) {
                const perfectSoFar = this.results.filter(r => r.status === 'PERFECT').length;
                const percentComplete = Math.round(((i + 1) / this.userPairs.length) * 100);
                const successRate = Math.round((perfectSoFar / (i + 1)) * 100);
                console.log(`   📈 Progress: ${i + 1}/100 (${percentComplete}%) - Success rate: ${successRate}%`);
            }
        }
        
        // Calculate final statistics
        const totalTime = Date.now() - startTime;
        const perfectCompatibilities = this.results.filter(r => r.status === 'PERFECT').length;
        const incompleteCompatibilities = this.results.filter(r => r.status === 'INCOMPLETE').length;
        const jsonErrors = this.results.filter(r => r.status === 'JSON_ERROR').length;
        const httpErrors = this.results.filter(r => r.status === 'HTTP_ERROR').length;
        const successRate = Math.round((perfectCompatibilities / this.results.length) * 100);
        const averageResponseTime = Math.round(this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length);
        const averageScore = Math.round(this.results.filter(r => r.overallScore).reduce((sum, r) => sum + r.overallScore, 0) / this.results.filter(r => r.overallScore).length);
        
        // Analyze enhancement levels
        const premiumLevel = this.results.filter(r => r.enhancementLevel === 'premium').length;
        const enhancedLevel = this.results.filter(r => r.enhancementLevel === 'enhanced').length;
        const basicLevel = this.results.filter(r => r.enhancementLevel === 'basic').length;
        
        console.log('\n' + '='.repeat(60));
        console.log('🏆 ENHANCED COMPATIBILITY 100-TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${this.results.length}`);
        console.log(`✅ Perfect Results: ${perfectCompatibilities} (${successRate}%)`);
        console.log(`⚠️  Incomplete: ${incompleteCompatibilities}`);
        console.log(`🔧 JSON Errors: ${jsonErrors}`);
        console.log(`❌ HTTP Errors: ${httpErrors}`);
        console.log(`⏱️  Average Response: ${averageResponseTime}ms`);
        console.log(`💖 Average Score: ${averageScore}%`);
        console.log(`🕐 Total Time: ${Math.round(totalTime / 60000)} minutes`);
        
        console.log('\n📊 Enhancement Levels:');
        console.log(`   🏆 Premium: ${premiumLevel} (full birth data)`);
        console.log(`   ⭐ Enhanced: ${enhancedLevel} (partial birth data)`);
        console.log(`   📄 Basic: ${basicLevel} (minimal data)`);
        
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
            console.log('\n🎉 EXCELLENT! 95%+ SUCCESS RATE - COMPATIBILITY SYSTEM READY!');
        } else if (successRate >= 90) {
            console.log('\n🟢 GREAT! 90%+ SUCCESS RATE - Minor improvements possible');
        } else if (successRate >= 80) {
            console.log('\n🟡 GOOD! 80%+ SUCCESS RATE - Some optimization needed');
        } else {
            console.log('\n🔴 NEEDS WORK! <80% SUCCESS RATE - Investigate major issues');
        }
        
        // Save comprehensive report
        const report = {
            testType: 'Enhanced Compatibility 100-Test',
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.results.length,
                perfectCompatibilities,
                incompleteCompatibilities,
                jsonErrors,
                httpErrors,
                successRate,
                averageResponseTime,
                averageScore,
                totalTimeMinutes: Math.round(totalTime / 60000),
                enhancementLevels: {
                    premium: premiumLevel,
                    enhanced: enhancedLevel,
                    basic: basicLevel
                }
            },
            topIssues: topIssues.map(([issue, count]) => ({ issue, count })),
            results: this.results
        };
        
        fs.writeFileSync('enhanced-compatibility-100-test-results.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved: enhanced-compatibility-100-test-results.json');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
        
        return report;
    }
}

// Execute the enhanced compatibility 100-test
console.log('🏁 Starting Enhanced Compatibility 100-Test...');
const tester = new EnhancedCompatibility100Test();
tester.runCompatibility100Test().catch(console.error);