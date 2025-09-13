// Test Enhanced Palm Reading Content
// Clears cache and tests a single palm reading with new richer content

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

class EnhancedContentTester {
    constructor() {
        this.baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
        this.serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
        
        // Load test palm images
        this.palmImages = {
            left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
            right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
        };

        // Test user data
        this.testUser = {
            name: 'EnhancedTester',
            dateOfBirth: '1990-03-15',
            timeOfBirth: '10:30',
            age: 35,
            zodiacSign: 'Pisces',
            placeOfBirth: {
                city: 'Barcelona',
                country: 'Spain',
                latitude: 41.3851,
                longitude: 2.1734,
                timezone: 'Europe/Madrid'
            }
        };
    }

    async testEnhancedReading() {
        console.log('🧪 TESTING ENHANCED PALM READING CONTENT');
        console.log('=' .repeat(60));
        console.log(`⏰ Started: ${new Date().toLocaleString()}`);
        console.log('🎯 Testing: New enhanced edge function with richer content');
        console.log('');

        const startTime = Date.now();
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout
            
            console.log('📡 Calling enhanced palm reading edge function...');
            const response = await fetch(`${this.baseUrl}/generate-palm-reading`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.serviceRoleKey}`,
                    'apikey': this.serviceRoleKey
                },
                body: JSON.stringify({
                    userData: this.testUser,
                    leftPalmImage: this.palmImages.left,
                    rightPalmImage: this.palmImages.right
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            
            console.log(`📊 Response: ${response.status} in ${Math.round(responseTime/1000)}s`);
            
            if (response.ok) {
                const result = await response.json();
                const reading = result.reading;
                
                console.log('');
                console.log('📝 CONTENT QUALITY ANALYSIS:');
                console.log('-'.repeat(40));
                
                // Analyze content length and quality
                const analyses = [
                    { field: 'greeting', content: reading.greeting, minExpected: 30 },
                    { field: 'overallPersonality', content: reading.overallPersonality, minExpected: 100 },
                    { field: 'futureInsights', content: reading.futureInsights, minExpected: 300 },
                    { field: 'personalizedAdvice', content: reading.personalizedAdvice, minExpected: 300 },
                    { field: 'handComparison', content: reading.handComparison, minExpected: 150 }
                ];
                
                analyses.forEach(analysis => {
                    const length = analysis.content ? analysis.content.length : 0;
                    const status = length >= analysis.minExpected ? '✅' : '⚠️';
                    const quality = length >= analysis.minExpected ? 'GOOD' : 'SHORT';
                    
                    console.log(`${status} ${analysis.field}: ${length} chars (${quality})`);
                    if (length < analysis.minExpected) {
                        console.log(`   Expected: ${analysis.minExpected}+ chars, Got: ${length}`);
                    }
                });
                
                console.log('');
                console.log('📋 LINE ANALYSIS QUALITY:');
                console.log('-'.repeat(30));
                
                if (reading.lines) {
                    Object.keys(reading.lines).forEach(lineKey => {
                        const line = reading.lines[lineKey];
                        const descLength = line.description ? line.description.length : 0;
                        const insightLength = line.personalizedInsight ? line.personalizedInsight.length : 0;
                        
                        const descStatus = descLength >= 80 ? '✅' : '⚠️';
                        const insightStatus = insightLength >= 100 ? '✅' : '⚠️';
                        
                        console.log(`${descStatus} ${lineKey} description: ${descLength} chars`);
                        console.log(`${insightStatus} ${lineKey} insight: ${insightLength} chars`);
                    });
                }
                
                console.log('');
                console.log('🏔️ MOUNTS ANALYSIS:');
                console.log('-'.repeat(20));
                
                if (reading.mounts) {
                    Object.keys(reading.mounts).forEach(mountKey => {
                        const mount = reading.mounts[mountKey];
                        const meaningLength = mount.meaning ? mount.meaning.length : 0;
                        const status = meaningLength >= 50 ? '✅' : '⚠️';
                        
                        console.log(`${status} ${mountKey}: ${meaningLength} chars`);
                    });
                }
                
                console.log('');
                console.log('🎯 OVERALL ASSESSMENT:');
                console.log('-'.repeat(25));
                
                const totalTokens = result.usage?.total_tokens || 0;
                const isRich = analyses.every(a => (a.content?.length || 0) >= a.minExpected);
                
                console.log(`📊 Total AI Tokens Used: ${totalTokens}`);
                console.log(`📝 Content Quality: ${isRich ? '✅ RICH & DETAILED' : '⚠️ NEEDS IMPROVEMENT'}`);
                console.log(`⏱️ Response Time: ${Math.round(responseTime/1000)}s`);
                console.log(`🤖 Model: ${result.model}`);
                console.log(`🖼️ Based on Images: ${result.basedOnActualImages ? '✅' : '❌'}`);
                
                // Sample content preview
                console.log('');
                console.log('📖 CONTENT SAMPLES:');
                console.log('-'.repeat(20));
                console.log(`Greeting: "${reading.greeting}"`);
                console.log(`Future (first 100 chars): "${reading.futureInsights?.substring(0, 100) || 'N/A'}..."`);
                console.log(`Advice (first 100 chars): "${reading.personalizedAdvice?.substring(0, 100) || 'N/A'}..."`);
                
                // Save detailed report
                fs.writeFileSync('enhanced-content-test-result.json', JSON.stringify(result, null, 2));
                console.log('');
                console.log('📄 Full result saved: enhanced-content-test-result.json');
                
            } else {
                console.log(`❌ Request failed: ${response.status}`);
                const errorText = await response.text();
                console.log(`Error: ${errorText}`);
            }
            
        } catch (error) {
            console.log(`❌ Test failed: ${error.message}`);
        }
        
        console.log(`⏰ Test completed: ${new Date().toLocaleString()}`);
    }
}

// Run the enhanced content test
console.log('🏁 Starting Enhanced Content Test...');
const tester = new EnhancedContentTester();

if (!tester.palmImages.left || !tester.palmImages.right) {
    console.error('❌ Failed to load palm images - test cannot proceed');
    process.exit(1);
}

console.log('✅ Palm images loaded successfully');
tester.testEnhancedReading().catch(console.error);