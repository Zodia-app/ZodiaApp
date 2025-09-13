// Production Edge Functions Test - Generate logs for Supabase Dashboard
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

class ProductionEdgeFunctionTester {
    constructor() {
        // Production Supabase URLs and keys
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        // Load real palm images for testing
        console.log('🖼️  Loading real palm images for production test...');
        this.palmImages = {
            male: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
            },
            female: {
                left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
                right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg')
            }
        };
        
        if (this.palmImages.male.left && this.palmImages.female.left) {
            console.log('✅ All palm images loaded successfully');
        } else {
            console.log('❌ Failed to load palm images');
        }
    }

    async callProductionFunction(functionName, payload, timeout = 120000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            console.log(`🚀 Calling production function: ${functionName}`);
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
            console.log(`📊 Response: ${response.status} (${Math.round(responseTime/1000)}s)`);
            
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

    async testEnhancedPalmReadingProduction() {
        console.log('\n🎯 TESTING PRODUCTION PALM READING WITH ENHANCED BIRTH DATA');
        console.log('━'.repeat(70));
        
        const testData = {
            name: "Alexandre",
            dateOfBirth: "1984-07-11",
            timeOfBirth: "14:30",
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

        console.log(`👤 User: ${testData.name} (${testData.age} years old)`);
        console.log(`📅 Birth: ${testData.dateOfBirth} at ${testData.timeOfBirth}`);
        console.log(`📍 Location: ${testData.placeOfBirth.city}, ${testData.placeOfBirth.country}`);
        console.log(`⭐ Zodiac: ${testData.zodiacSign}`);
        
        try {
            const result = await this.callProductionFunction('generate-palm-reading', {
                userData: testData,
                leftPalmImage: this.palmImages.male.left,
                rightPalmImage: this.palmImages.male.right
            });
            
            if (result.ok) {
                const data = JSON.parse(result.data);
                console.log('🎉 SUCCESS - Production palm reading generated!');
                console.log(`   👋 Greeting: "${data.reading.greeting?.substring(0, 80)}..."`);
                console.log(`   🔮 Personality: "${data.reading.overallPersonality?.substring(0, 60)}..."`);
                
                // Check birth data integration
                const fullContent = JSON.stringify(data.reading, null, 2);
                const hasFrance = fullContent.toLowerCase().includes('france') || fullContent.toLowerCase().includes('paris');
                const hasCancer = fullContent.includes('Cancer');
                const hasAge = fullContent.includes('41') || fullContent.includes('forty');
                
                console.log(`   🇫🇷 France context: ${hasFrance ? '✅' : '❌'}`);
                console.log(`   ♋ Cancer traits: ${hasCancer ? '✅' : '❌'}`);
                console.log(`   📅 Age (41) context: ${hasAge ? '✅' : '❌'}`);
                console.log(`   💰 Tokens used: ${data.usage?.total_tokens || 'N/A'}`);
                
                return data.reading;
            } else {
                console.log(`❌ FAILED: ${result.data}`);
                return null;
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            return null;
        }
    }

    async testEnhancedCompatibilityProduction() {
        console.log('\n💕 TESTING PRODUCTION ENHANCED COMPATIBILITY');
        console.log('━'.repeat(70));
        
        const maleData = {
            name: "Alexandre",
            dateOfBirth: "1984-07-11",
            timeOfBirth: "14:30",
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
            timeOfBirth: "10:15",
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

        console.log(`👨 Male: ${maleData.name} (${maleData.age}, ${maleData.placeOfBirth.country})`);
        console.log(`👩 Female: ${femaleData.name} (${femaleData.age}, ${femaleData.placeOfBirth.country})`);
        
        try {
            // First generate individual readings
            console.log('📋 Generating Alexandre palm reading...');
            const maleResponse = await this.callProductionFunction('generate-palm-reading', {
                userData: maleData,
                leftPalmImage: this.palmImages.male.left,
                rightPalmImage: this.palmImages.male.right
            });
            
            console.log('📋 Generating Elena palm reading...');
            const femaleResponse = await this.callProductionFunction('generate-palm-reading', {
                userData: femaleData,
                leftPalmImage: this.palmImages.female.left,
                rightPalmImage: this.palmImages.female.right
            });

            if (maleResponse.ok && femaleResponse.ok) {
                const maleReading = JSON.parse(maleResponse.data);
                const femaleReading = JSON.parse(femaleResponse.data);
                
                console.log('💕 Generating enhanced compatibility...');
                const compatibilityResult = await this.callProductionFunction('generate-enhanced-compatibility', {
                    userReading: {
                        userData: maleData,
                        analysis: maleReading.reading
                    },
                    partnerReading: {
                        userData: femaleData,
                        analysis: femaleReading.reading
                    },
                    directMode: true,
                    matchType: 'romantic'
                });

                if (compatibilityResult.ok) {
                    const compatibility = JSON.parse(compatibilityResult.data);
                    console.log('🎉 SUCCESS - Production compatibility analysis generated!');
                    console.log(`   🎯 Overall Score: ${compatibility.analysis?.overallScore || 'N/A'}%`);
                    console.log(`   🏷️  Overall Label: ${compatibility.analysis?.overallLabel || 'N/A'}`);
                    console.log(`   🏆 Enhancement Level: ${compatibility.enhancementLevel?.level || 'N/A'}`);
                    console.log(`   📊 Data Completeness: ${compatibility.enhancementLevel?.percentage || 'N/A'}%`);
                    
                    if (compatibility.analysis?.enhancedCategories) {
                        console.log('\n💖 Category Scores:');
                        compatibility.analysis.enhancedCategories.forEach(cat => {
                            console.log(`     ${cat.emoji} ${cat.category}: ${cat.score}%`);
                        });
                    }
                    
                    return compatibility;
                } else {
                    console.log(`❌ Compatibility FAILED: ${compatibilityResult.data}`);
                }
            } else {
                console.log('❌ Individual readings failed');
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
        
        return null;
    }

    async runProductionTests() {
        console.log('🚀 PRODUCTION EDGE FUNCTIONS TEST');
        console.log('==========================================');
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log(`🌐 Production URL: ${this.baseUrl}`);
        console.log('');

        const startTime = Date.now();
        
        // Test 1: Enhanced Palm Reading
        const palmResult = await this.testEnhancedPalmReadingProduction();
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait between calls
        
        // Test 2: Enhanced Compatibility (if palm reading succeeded)
        const compatibilityResult = palmResult ? await this.testEnhancedCompatibilityProduction() : null;

        const totalTime = Date.now() - startTime;
        
        console.log('\n' + '='.repeat(70));
        console.log('🏁 PRODUCTION TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`⏱️  Total Time: ${Math.round(totalTime / 1000)}s`);
        console.log(`🎯 Palm Reading: ${palmResult ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`💕 Compatibility: ${compatibilityResult ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log('');
        console.log('📊 CHECK PRODUCTION LOGS AT:');
        console.log('https://supabase.com/dashboard/project/uaaglfqvvktstzmhbmas/functions');
        console.log('');
        console.log(`⏰ Completed: ${new Date().toLocaleString()}`);
    }
}

// Run the production test
const tester = new ProductionEdgeFunctionTester();
tester.runProductionTests().catch(console.error);