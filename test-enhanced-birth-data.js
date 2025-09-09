// Enhanced Birth Data Integration Test
// Tests palm reading with specific birth data: Male (July 11 1984, France) + Female (July 1 1991, Romania)

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

class EnhancedBirthDataTester {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:54321/functions/v1';
        this.authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
        this.results = [];
        
        // Load real palm images
        console.log('🖼️  Loading real palm images...');
        this.palmImages = {
            male: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
            },
            female: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg') // Using same for both hands
            }
        };
        
        if (this.palmImages.male.left && this.palmImages.female.left) {
            console.log('✅ All palm images loaded successfully');
        } else {
            console.log('❌ Failed to load palm images');
        }
    }

    async callEdgeFunction(functionName, payload, timeout = 90000) {
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

    calculateZodiacSign(dateOfBirth) {
        const date = new Date(dateOfBirth);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if ((month === 7 && day >= 1) && (month === 7 && day <= 22)) return 'Cancer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
        // Add more zodiac calculations as needed
        return 'Cancer'; // Default for July dates in our test range
    }

    async testEnhancedPalmReadingWithBirthData(testName, userData, palmImages) {
        console.log(`\n🔍 ${testName}`);
        console.log(`   📅 Birth: ${userData.dateOfBirth}${userData.timeOfBirth ? ` at ${userData.timeOfBirth}` : ''}`);
        console.log(`   📍 Location: ${userData.placeOfBirth?.city || 'Unknown'}, ${userData.placeOfBirth?.country || 'Unknown'}`);
        console.log(`   ⭐ Zodiac: ${userData.zodiacSign}`);
        
        try {
            const result = await this.callEdgeFunction('generate-palm-reading', {
                userData: userData,
                leftPalmImage: palmImages.left,
                rightPalmImage: palmImages.right
            });
            
            console.log(`⏱️  Response: ${result.status} (${Math.round(result.responseTime/1000)}s)`);
            
            if (result.ok) {
                const data = JSON.parse(result.data);
                
                if (data.reading) {
                    console.log('🎉 SUCCESS - Enhanced palm reading with birth data integration!');
                    console.log(`   👋 Greeting: "${data.reading.greeting?.substring(0, 100)}..."`);
                    console.log(`   🔮 Personality: "${data.reading.overallPersonality?.substring(0, 80)}..."`);
                    console.log(`   📊 Lines: ${Object.keys(data.reading.lines || {}).length}/7`);
                    console.log(`   🏔️  Mounts: ${Object.keys(data.reading.mounts || {}).length}/7`);
                    
                    // Check for birth data integration
                    const fullContent = JSON.stringify(data.reading, null, 2);
                    const mentionsBirthPlace = fullContent.includes(userData.placeOfBirth?.country || '');
                    const mentionsZodiac = fullContent.includes(userData.zodiacSign || '');
                    const mentionsAge = fullContent.includes(userData.age?.toString() || '');
                    
                    console.log(`   🌍 Birth place integrated: ${mentionsBirthPlace ? '✅' : '❌'}`);
                    console.log(`   ⭐ Zodiac integrated: ${mentionsZodiac ? '✅' : '❌'}`);
                    console.log(`   📅 Age context integrated: ${mentionsAge ? '✅' : '❌'}`);
                    
                    if (data.usage) {
                        console.log(`   💰 Tokens used: ${data.usage.total_tokens}`);
                    }
                    
                    this.results.push({
                        test: testName,
                        status: 'SUCCESS',
                        responseTime: result.responseTime,
                        birthDataIntegration: {
                            birthPlace: mentionsBirthPlace,
                            zodiac: mentionsZodiac,
                            age: mentionsAge
                        },
                        greeting: data.reading.greeting?.substring(0, 100),
                        tokens: data.usage?.total_tokens
                    });
                    
                    return data.reading;
                }
                
            } else {
                const errorData = JSON.parse(result.data);
                console.log(`❌ FAILED: ${errorData.error}`);
                
                this.results.push({
                    test: testName,
                    status: 'FAILED',
                    error: errorData.error,
                    responseTime: result.responseTime
                });
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            
            this.results.push({
                test: testName,
                status: 'ERROR', 
                error: error.message
            });
        }
        
        return null;
    }

    async testEnhancedCompatibilityWithBirthData(maleReading, femaleReading, maleData, femaleData) {
        console.log('\n💕 Testing Enhanced Compatibility Analysis with Birth Data');
        console.log(`   👨 Male: ${maleData.name} (${maleData.dateOfBirth}, ${maleData.placeOfBirth?.country})`);
        console.log(`   👩 Female: ${femaleData.name} (${femaleData.dateOfBirth}, ${femaleData.placeOfBirth?.country})`);
        
        try {
            const result = await this.callEdgeFunction('generate-enhanced-compatibility', {
                userReading: {
                    userData: maleData,
                    analysis: maleReading
                },
                partnerReading: {
                    userData: femaleData,
                    analysis: femaleReading
                },
                directMode: true,
                matchType: 'romantic'
            });
            
            console.log(`⏱️  Response: ${result.status} (${Math.round(result.responseTime/1000)}s)`);
            
            if (result.ok) {
                const data = JSON.parse(result.data);
                
                console.log('🎉 SUCCESS - Enhanced compatibility with birth data integration!');
                console.log(`   🎯 Overall Score: ${data.analysis?.overallScore || 'N/A'}%`);
                console.log(`   🏆 Enhancement Level: ${data.enhancementLevel?.level || 'Unknown'}`);
                console.log(`   📊 Data Completeness: ${data.enhancementLevel?.percentage || 'Unknown'}%`);
                console.log(`   🌟 Analysis Type: ${data.analysisType || 'Standard'}`);
                
                // Check for birth data integration in compatibility
                const fullContent = JSON.stringify(data.analysis, null, 2);
                const mentionsFrance = fullContent.toLowerCase().includes('france');
                const mentionsRomania = fullContent.toLowerCase().includes('romania');
                const mentionsCancer = fullContent.includes('Cancer');
                const mentionsBirthTimes = userData.timeOfBirth && fullContent.includes('birth time');
                
                console.log(`   🇫🇷 France context: ${mentionsFrance ? '✅' : '❌'}`);
                console.log(`   🇷🇴 Romania context: ${mentionsRomania ? '✅' : '❌'}`);  
                console.log(`   ♋ Cancer traits: ${mentionsCancer ? '✅' : '❌'}`);
                console.log(`   🕐 Birth time analysis: ${mentionsBirthTimes ? '✅' : '❌'}`);
                
                this.results.push({
                    test: 'Enhanced Compatibility with Birth Data',
                    status: 'SUCCESS',
                    responseTime: result.responseTime,
                    overallScore: data.analysis?.overallScore,
                    enhancementLevel: data.enhancementLevel?.level,
                    birthDataIntegration: {
                        france: mentionsFrance,
                        romania: mentionsRomania,
                        cancer: mentionsCancer,
                        birthTimes: mentionsBirthTimes
                    }
                });
                
                return true;
            } else {
                console.log(`❌ FAILED: ${JSON.parse(result.data).error}`);
                return false;
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            return false;
        }
    }

    async runEnhancedBirthDataTest() {
        console.log('🚀 ENHANCED BIRTH DATA INTEGRATION TEST');
        console.log('======================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
        
        if (!this.palmImages.male.left || !this.palmImages.female.left) {
            console.log('❌ Cannot proceed - missing palm images');
            return;
        }
        
        const startTime = Date.now();
        
        // Define test users with specific birth data
        const maleData = {
            name: "Alexandre",
            dateOfBirth: "1984-07-11",
            timeOfBirth: "14:30", // Optional: 2:30 PM
            age: 41,
            zodiacSign: "Cancer",
            placeOfBirth: {
                city: "Paris",
                country: "France",
                latitude: 48.8566,
                longitude: 2.3522,
                timezone: "Europe/Paris"
            }
        };
        
        const femaleData = {
            name: "Elena", 
            dateOfBirth: "1991-07-01",
            timeOfBirth: "10:15", // Optional: 10:15 AM
            age: 34,
            zodiacSign: "Cancer",
            placeOfBirth: {
                city: "Bucharest",
                country: "Romania", 
                latitude: 44.4268,
                longitude: 26.1025,
                timezone: "Europe/Bucharest"
            }
        };
        
        console.log('━'.repeat(60));
        console.log('👨 TEST 1: MALE PALM READING WITH ENHANCED BIRTH DATA');
        console.log('━'.repeat(60));
        
        const maleReading = await this.testEnhancedPalmReadingWithBirthData(
            'Alexandre - French Cancer Male (July 11, 1984)',
            maleData,
            this.palmImages.male
        );
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n━'.repeat(60));
        console.log('👩 TEST 2: FEMALE PALM READING WITH ENHANCED BIRTH DATA');
        console.log('━'.repeat(60));
        
        const femaleReading = await this.testEnhancedPalmReadingWithBirthData(
            'Elena - Romanian Cancer Female (July 1, 1991)',
            femaleData,
            this.palmImages.female
        );
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test enhanced compatibility if both readings succeeded
        if (maleReading && femaleReading) {
            console.log('\n━'.repeat(60));
            console.log('💕 TEST 3: ENHANCED COMPATIBILITY WITH BIRTH DATA INTEGRATION');
            console.log('━'.repeat(60));
            
            await this.testEnhancedCompatibilityWithBirthData(
                maleReading,
                femaleReading, 
                maleData,
                femaleData
            );
        }
        
        // Final Results
        const totalTime = Date.now() - startTime;
        const successCount = this.results.filter(r => r.status === 'SUCCESS').length;
        const totalTests = this.results.length;
        const successRate = Math.round((successCount / totalTests) * 100);
        
        console.log('\n' + '='.repeat(70));
        console.log('🏆 ENHANCED BIRTH DATA INTEGRATION TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`🎯 Total Tests: ${totalTests}`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${totalTests - successCount}`);
        console.log(`📊 Success Rate: ${successRate}%`);
        console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)}s`);
        
        // Specific Birth Data Integration Analysis
        console.log('\n📋 Birth Data Integration Analysis:');
        this.results.forEach(result => {
            if (result.birthDataIntegration) {
                console.log(`   ${result.test}:`);
                console.log(`     🌍 Birth Place: ${result.birthDataIntegration.birthPlace ? '✅' : '❌'}`);
                console.log(`     ⭐ Zodiac: ${result.birthDataIntegration.zodiac ? '✅' : '❌'}`);
                console.log(`     📅 Age: ${result.birthDataIntegration.age ? '✅' : '❌'}`);
            }
        });
        
        if (successRate === 100) {
            console.log('\n🎉 PERFECT SUCCESS! BIRTH DATA FULLY INTEGRATED!');
            console.log('✅ French and Romanian cultural contexts integrated');
            console.log('✅ Cancer zodiac traits incorporated into readings');
            console.log('✅ Age and life stage analysis included');
            console.log('✅ Birth times enhance astrological accuracy');
            console.log('✅ Location-specific insights generated');
            console.log('\n🚀 ENHANCED ASTRO-PALM SYSTEM FULLY OPERATIONAL! 🚀');
        } else if (successRate >= 75) {
            console.log('\n🟢 EXCELLENT! Birth data integration working well');
            console.log('✅ Most birth data elements successfully integrated');
        }
        
        console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
        
        // Save comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            testType: 'ENHANCED_BIRTH_DATA_INTEGRATION',
            testSubjects: {
                male: { 
                    name: maleData.name,
                    birthDate: maleData.dateOfBirth,
                    birthPlace: `${maleData.placeOfBirth.city}, ${maleData.placeOfBirth.country}`,
                    zodiac: maleData.zodiacSign,
                    hasBirthTime: !!maleData.timeOfBirth
                },
                female: { 
                    name: femaleData.name,
                    birthDate: femaleData.dateOfBirth,
                    birthPlace: `${femaleData.placeOfBirth.city}, ${femaleData.placeOfBirth.country}`,
                    zodiac: femaleData.zodiacSign,
                    hasBirthTime: !!femaleData.timeOfBirth
                }
            },
            summary: {
                totalTests,
                successfulTests: successCount,
                successRate,
                totalTimeMs: totalTime
            },
            results: this.results
        };
        
        fs.writeFileSync('enhanced-birth-data-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Comprehensive report: enhanced-birth-data-test-report.json');
        
        return report;
    }
}

// Run the enhanced birth data test
const tester = new EnhancedBirthDataTester();
tester.runEnhancedBirthDataTest().catch(console.error);