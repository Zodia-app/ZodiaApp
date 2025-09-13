// Comprehensive 100-Test Plan - Individual Palm Readings + Enhanced Compatibility
// Tests every single field for completeness and quality
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

class Comprehensive100TestPlan {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        this.results = {
            individualReadings: [],
            compatibilityAnalyses: [],
            summary: {
                totalTests: 0,
                successfulTests: 0,
                failedTests: 0,
                incompleteResponses: 0,
                averageResponseTime: 0
            }
        };

        // Load real palm images
        console.log('🖼️  Loading real palm images for comprehensive testing...');
        this.palmImages = {
            male: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
            },
            female: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (2).jpeg')
            }
        };

        // Generate diverse test profiles
        this.testProfiles = this.generateDiverseTestProfiles();
        
        if (this.palmImages.male.left && this.palmImages.female.left) {
            console.log('✅ All palm images loaded successfully');
            console.log(`📊 Generated ${this.testProfiles.length} diverse test profiles`);
        } else {
            console.log('❌ Failed to load palm images - tests cannot proceed');
        }
    }

    generateDiverseTestProfiles() {
        const profiles = [];
        const names = ['Alexandre', 'Elena', 'Marcus', 'Sofia', 'David', 'Luna', 'Carlos', 'Aria', 'James', 'Maya'];
        const cities = [
            { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
            { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, tz: 'Europe/Bucharest' },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, tz: 'Asia/Tokyo' },
            { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
            { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, tz: 'America/Sao_Paulo' }
        ];
        const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const birthTimes = ['08:15', '10:30', '14:45', '16:20', '22:10', null]; // null for no birth time

        // Generate 50 diverse profiles for individual testing
        for (let i = 0; i < 50; i++) {
            const birthYear = 1970 + Math.floor(Math.random() * 40); // 1970-2010
            const birthMonth = Math.floor(Math.random() * 12) + 1;
            const birthDay = Math.floor(Math.random() * 28) + 1;
            const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
            const age = 2025 - birthYear;
            const city = cities[Math.floor(Math.random() * cities.length)];
            const birthTime = birthTimes[Math.floor(Math.random() * birthTimes.length)];

            profiles.push({
                name: `${names[i % names.length]}${Math.floor(i/names.length) + 1}`,
                dateOfBirth: birthDate,
                timeOfBirth: birthTime,
                age: age,
                zodiacSign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
                gender: i % 2 === 0 ? 'male' : 'female',
                placeOfBirth: {
                    city: city.name,
                    country: city.country,
                    latitude: city.lat,
                    longitude: city.lng,
                    timezone: city.tz
                }
            });
        }

        return profiles;
    }

    async callProductionFunction(functionName, payload, timeout = 180000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const startTime = Date.now();
            
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
                ok: response.ok,
                status: response.status,
                data: responseText,
                responseTime
            };
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    validatePalmReadingCompleteness(reading, testName) {
        const issues = [];
        
        // Check required top-level fields
        if (!reading.greeting || reading.greeting.length < 10) {
            issues.push('Greeting too short or missing');
        }
        if (!reading.overallPersonality || reading.overallPersonality.length < 20) {
            issues.push('Overall personality too short or missing');
        }
        
        // Check lines (all 7 required)
        const requiredLines = ['lifeLine', 'heartLine', 'headLine', 'marriageLine', 'fateLine', 'successLine', 'travelLine'];
        if (!reading.lines) {
            issues.push('Lines section missing');
        } else {
            requiredLines.forEach(line => {
                if (!reading.lines[line]) {
                    issues.push(`Missing line: ${line}`);
                } else {
                    const l = reading.lines[line];
                    if (!l.name || l.name.length < 5) issues.push(`${line} name too short`);
                    if (!l.description || l.description.length < 10) issues.push(`${line} description too short`);
                    if (!l.meaning || l.meaning.length < 10) issues.push(`${line} meaning too short`);
                    if (!l.personalizedInsight || l.personalizedInsight.length < 15) issues.push(`${line} insight too short`);
                }
            });
        }
        
        // Check mounts (all 7 required)
        const requiredMounts = ['mars', 'jupiter', 'saturn', 'sun', 'mercury', 'moon', 'venus'];
        if (!reading.mounts) {
            issues.push('Mounts section missing');
        } else {
            requiredMounts.forEach(mount => {
                if (!reading.mounts[mount]) {
                    issues.push(`Missing mount: ${mount}`);
                } else {
                    const m = reading.mounts[mount];
                    if (!m.name || m.name.length < 5) issues.push(`${mount} name too short`);
                    if (!m.prominence || m.prominence.length < 5) issues.push(`${mount} prominence too short`);
                    if (!m.meaning || m.meaning.length < 10) issues.push(`${mount} meaning too short`);
                }
            });
        }
        
        // Check other required fields
        if (!reading.specialMarkings || reading.specialMarkings.length !== 4) {
            issues.push(`Special markings should be exactly 4, got ${reading.specialMarkings?.length || 0}`);
        } else {
            reading.specialMarkings.forEach((marking, i) => {
                if (!marking || marking.length < 10) issues.push(`Special marking ${i+1} too short`);
            });
        }
        
        if (!reading.handComparison || reading.handComparison.length < 50) {
            issues.push('Hand comparison too short');
        }
        if (!reading.futureInsights || reading.futureInsights.length < 100) {
            issues.push('Future insights too short');
        }
        if (!reading.personalizedAdvice || reading.personalizedAdvice.length < 100) {
            issues.push('Personalized advice too short');
        }
        
        // Check lucky elements
        if (!reading.luckyElements) {
            issues.push('Lucky elements missing');
        } else {
            if (!reading.luckyElements.colors || reading.luckyElements.colors.length !== 3) {
                issues.push('Lucky colors should be exactly 3');
            }
            if (!reading.luckyElements.numbers || reading.luckyElements.numbers.length !== 3) {
                issues.push('Lucky numbers should be exactly 3');
            }
            if (!reading.luckyElements.days || reading.luckyElements.days.length !== 2) {
                issues.push('Lucky days should be exactly 2');
            }
        }
        
        return {
            isComplete: issues.length === 0,
            issues: issues,
            testName: testName
        };
    }

    async testIndividualPalmReading(profile, testIndex) {
        const testName = `Individual Reading #${testIndex + 1} - ${profile.name}`;
        console.log(`🔍 ${testName}`);
        console.log(`   📅 ${profile.dateOfBirth}${profile.timeOfBirth ? ` at ${profile.timeOfBirth}` : ''}`);
        console.log(`   📍 ${profile.placeOfBirth.city}, ${profile.placeOfBirth.country}`);
        
        try {
            const palmImages = this.palmImages[profile.gender];
            const result = await this.callProductionFunction('generate-palm-reading', {
                userData: profile,
                leftPalmImage: palmImages.left,
                rightPalmImage: palmImages.right
            });
            
            if (result.ok) {
                const data = JSON.parse(result.data);
                const validation = this.validatePalmReadingCompleteness(data.reading, testName);
                
                const testResult = {
                    testName,
                    profile: profile.name,
                    status: validation.isComplete ? 'PERFECT' : 'INCOMPLETE',
                    responseTime: result.responseTime,
                    issues: validation.issues,
                    tokensUsed: data.usage?.total_tokens || 0,
                    greetingPreview: data.reading.greeting?.substring(0, 50) + '...'
                };
                
                this.results.individualReadings.push(testResult);
                
                if (validation.isComplete) {
                    console.log(`   ✅ PERFECT - All fields complete (${Math.round(result.responseTime/1000)}s)`);
                } else {
                    console.log(`   ⚠️  INCOMPLETE - ${validation.issues.length} issues (${Math.round(result.responseTime/1000)}s)`);
                    validation.issues.forEach(issue => console.log(`      - ${issue}`));
                }
                
                return { success: true, complete: validation.isComplete, reading: data.reading };
                
            } else {
                console.log(`   ❌ FAILED - ${result.status}`);
                this.results.individualReadings.push({
                    testName,
                    profile: profile.name,
                    status: 'FAILED',
                    responseTime: result.responseTime,
                    error: result.data
                });
                return { success: false, complete: false };
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.message}`);
            this.results.individualReadings.push({
                testName,
                profile: profile.name,
                status: 'ERROR',
                error: error.message
            });
            return { success: false, complete: false };
        }
    }

    async testEnhancedCompatibility(profile1, profile2, reading1, reading2, testIndex) {
        const testName = `Compatibility #${testIndex + 1} - ${profile1.name} & ${profile2.name}`;
        console.log(`💕 ${testName}`);
        
        try {
            const result = await this.callProductionFunction('generate-enhanced-compatibility', {
                userReading: {
                    userData: profile1,
                    analysis: reading1
                },
                partnerReading: {
                    userData: profile2,
                    analysis: reading2
                },
                directMode: true,
                matchType: 'romantic'
            });
            
            if (result.ok) {
                const data = JSON.parse(result.data);
                
                // Validate compatibility completeness
                const issues = [];
                if (!data.analysis?.overallScore) issues.push('Missing overall score');
                if (!data.analysis?.overallLabel) issues.push('Missing overall label');
                if (!data.analysis?.enhancedCategories || data.analysis.enhancedCategories.length < 4) {
                    issues.push('Missing or incomplete enhanced categories');
                }
                if (!data.analysis?.cosmicPalmMessage) issues.push('Missing cosmic message');
                
                const isComplete = issues.length === 0;
                
                const testResult = {
                    testName,
                    users: `${profile1.name} & ${profile2.name}`,
                    status: isComplete ? 'PERFECT' : 'INCOMPLETE',
                    responseTime: result.responseTime,
                    overallScore: data.analysis?.overallScore || 0,
                    enhancementLevel: data.enhancementLevel?.level || 'unknown',
                    issues: issues
                };
                
                this.results.compatibilityAnalyses.push(testResult);
                
                if (isComplete) {
                    console.log(`   ✅ PERFECT - Score: ${data.analysis.overallScore}%, Level: ${data.enhancementLevel?.level} (${Math.round(result.responseTime/1000)}s)`);
                } else {
                    console.log(`   ⚠️  INCOMPLETE - ${issues.length} issues (${Math.round(result.responseTime/1000)}s)`);
                }
                
                return { success: true, complete: isComplete };
                
            } else {
                console.log(`   ❌ FAILED - ${result.status}`);
                this.results.compatibilityAnalyses.push({
                    testName,
                    users: `${profile1.name} & ${profile2.name}`,
                    status: 'FAILED',
                    error: result.data
                });
                return { success: false, complete: false };
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.message}`);
            this.results.compatibilityAnalyses.push({
                testName,
                users: `${profile1.name} & ${profile2.name}`,
                status: 'ERROR',
                error: error.message
            });
            return { success: false, complete: false };
        }
    }

    async runComprehensive100Tests() {
        console.log('🚀 COMPREHENSIVE 100-TEST PLAN EXECUTION');
        console.log('==========================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`🎯 Plan: 50 Individual Readings + 50 Enhanced Compatibility Tests`);
        console.log('📊 Validating EVERY field for completeness and quality\n');

        const startTime = Date.now();
        let individualReadings = [];
        
        // Phase 1: 50 Individual Palm Readings
        console.log('━'.repeat(80));
        console.log('📖 PHASE 1: 50 INDIVIDUAL PALM READINGS');
        console.log('━'.repeat(80));
        
        for (let i = 0; i < 50; i++) {
            const profile = this.testProfiles[i];
            const result = await this.testIndividualPalmReading(profile, i);
            
            if (result.success && result.complete) {
                individualReadings.push({ profile, reading: result.reading });
            }
            
            // Brief pause between requests to avoid rate limits
            if (i < 49) await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n📊 Phase 1 Complete: ${individualReadings.length}/50 successful readings\n`);
        
        // Phase 2: 50 Enhanced Compatibility Tests
        console.log('━'.repeat(80));
        console.log('💕 PHASE 2: 50 ENHANCED COMPATIBILITY ANALYSES');
        console.log('━'.repeat(80));
        
        const compatibilityPairs = [];
        for (let i = 0; i < Math.min(50, Math.floor(individualReadings.length / 2) * 2); i += 2) {
            if (i + 1 < individualReadings.length) {
                const pair1 = individualReadings[i];
                const pair2 = individualReadings[i + 1];
                compatibilityPairs.push([pair1, pair2]);
            }
        }
        
        console.log(`🔀 Creating ${Math.min(25, compatibilityPairs.length)} compatibility pairs from successful readings\n`);
        
        for (let i = 0; i < Math.min(25, compatibilityPairs.length); i++) {
            const [pair1, pair2] = compatibilityPairs[i];
            await this.testEnhancedCompatibility(
                pair1.profile, 
                pair2.profile, 
                pair1.reading, 
                pair2.reading, 
                i
            );
            
            // Brief pause between requests
            if (i < Math.min(24, compatibilityPairs.length - 1)) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
        
        // Calculate final statistics
        const totalTime = Date.now() - startTime;
        const totalTests = this.results.individualReadings.length + this.results.compatibilityAnalyses.length;
        const successfulIndividual = this.results.individualReadings.filter(r => r.status === 'PERFECT').length;
        const successfulCompatibility = this.results.compatibilityAnalyses.filter(r => r.status === 'PERFECT').length;
        const totalSuccessful = successfulIndividual + successfulCompatibility;
        const successRate = Math.round((totalSuccessful / totalTests) * 100);
        const averageResponseTime = Math.round(totalTime / totalTests);
        
        this.results.summary = {
            totalTests,
            successfulTests: totalSuccessful,
            failedTests: totalTests - totalSuccessful,
            individualReadings: {
                total: this.results.individualReadings.length,
                perfect: successfulIndividual,
                incomplete: this.results.individualReadings.filter(r => r.status === 'INCOMPLETE').length,
                failed: this.results.individualReadings.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length
            },
            compatibilityAnalyses: {
                total: this.results.compatibilityAnalyses.length,
                perfect: successfulCompatibility,
                incomplete: this.results.compatibilityAnalyses.filter(r => r.status === 'INCOMPLETE').length,
                failed: this.results.compatibilityAnalyses.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length
            },
            successRate,
            averageResponseTime,
            totalTimeMinutes: Math.round(totalTime / 60000)
        };
        
        // Display final results
        console.log('\n' + '='.repeat(80));
        console.log('🏆 COMPREHENSIVE 100-TEST PLAN RESULTS');
        console.log('='.repeat(80));
        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Perfect Results: ${totalSuccessful} (${successRate}%)`);
        console.log(`⚠️  Incomplete: ${this.results.summary.failedTests}`);
        console.log(`⏱️  Total Time: ${this.results.summary.totalTimeMinutes} minutes`);
        console.log(`📈 Average Response: ${averageResponseTime}ms`);
        
        console.log('\n📖 Individual Palm Readings:');
        console.log(`   ✅ Perfect: ${this.results.summary.individualReadings.perfect}/${this.results.summary.individualReadings.total}`);
        console.log(`   ⚠️  Incomplete: ${this.results.summary.individualReadings.incomplete}`);
        console.log(`   ❌ Failed: ${this.results.summary.individualReadings.failed}`);
        
        console.log('\n💕 Enhanced Compatibility:');
        console.log(`   ✅ Perfect: ${this.results.summary.compatibilityAnalyses.perfect}/${this.results.summary.compatibilityAnalyses.total}`);
        console.log(`   ⚠️  Incomplete: ${this.results.summary.compatibilityAnalyses.incomplete}`);
        console.log(`   ❌ Failed: ${this.results.summary.compatibilityAnalyses.failed}`);
        
        if (successRate >= 95) {
            console.log('\n🎉 EXCELLENT! 95%+ SUCCESS RATE - SYSTEM IS PRODUCTION READY!');
        } else if (successRate >= 85) {
            console.log('\n🟢 GOOD! 85%+ SUCCESS RATE - Minor optimizations needed');
        } else {
            console.log('\n🟡 NEEDS WORK! <85% SUCCESS RATE - Investigate failures');
        }
        
        // Save comprehensive report
        const report = {
            testPlan: 'Comprehensive 100-Test Validation',
            timestamp: new Date().toISOString(),
            summary: this.results.summary,
            individualReadings: this.results.individualReadings,
            compatibilityAnalyses: this.results.compatibilityAnalyses,
            testProfiles: this.testProfiles.map(p => ({ name: p.name, country: p.placeOfBirth.country, zodiac: p.zodiacSign }))
        };
        
        fs.writeFileSync('comprehensive-100-test-results.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved: comprehensive-100-test-results.json');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
        
        return report;
    }
}

// Execute the comprehensive 100-test plan
console.log('🏁 Initializing Comprehensive 100-Test Plan...');
const tester = new Comprehensive100TestPlan();
tester.runComprehensive100Tests().catch(console.error);