// Test Enhanced Compatibility Function Only - Generate Production Logs
const fs = require('fs');

async function testEnhancedCompatibilityLogs() {
    console.log('🔮 TESTING ENHANCED COMPATIBILITY FUNCTION - PRODUCTION LOGS');
    console.log('='.repeat(70));
    
    const baseUrl = 'https://uaaglfqvvktstzmhbmas.supabase.co/functions/v1';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWdsZnF2dmt0c3R6bWhibWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyODYyMCwiZXhwIjoyMDY5NDA0NjIwfQ.YEtkuQtSfidF2f9JuK2QitYi3ZubenPtlizWbHoI8Us';
    
    // Mock palm reading data for Alexandre
    const alexandrePalmReading = {
        greeting: "Bonjour Alexandre! Ready for your enhanced astro-palm reading?",
        overallPersonality: "As a Cancer born in France, you embody nurturing wisdom with Parisian sophistication.",
        lines: {
            lifeLine: { name: "Life Line", description: "Strong vitality", meaning: "Robust life energy", personalizedInsight: "Your French heritage shows stability" },
            heartLine: { name: "Heart Line", description: "Deep emotional capacity", meaning: "Cancer sensitivity", personalizedInsight: "Nurturing love style" },
            headLine: { name: "Head Line", description: "Analytical thinking", meaning: "Strategic mind", personalizedInsight: "French intellectual tradition" },
            marriageLine: { name: "Marriage Line", description: "Committed partnerships", meaning: "Long-term focus", personalizedInsight: "Traditional values" },
            fateLine: { name: "Fate Line", description: "Clear career path", meaning: "Professional success", personalizedInsight: "Ambition with Parisian flair" },
            successLine: { name: "Success Line", description: "Recognition potential", meaning: "Achievement oriented", personalizedInsight: "Leadership qualities" },
            travelLine: { name: "Travel Line", description: "Adventure spirit", meaning: "Wanderlust", personalizedInsight: "Global perspective" }
        },
        mounts: {
            mars: { name: "Mount of Mars", prominence: "Well-developed", meaning: "Courage and determination" },
            jupiter: { name: "Mount of Jupiter", prominence: "Prominent", meaning: "Leadership and ambition" },
            saturn: { name: "Mount of Saturn", prominence: "Moderate", meaning: "Discipline and responsibility" },
            sun: { name: "Mount of Sun", prominence: "Strong", meaning: "Creativity and recognition" },
            mercury: { name: "Mount of Mercury", prominence: "Developed", meaning: "Communication skills" },
            moon: { name: "Mount of Moon", prominence: "Prominent", meaning: "Intuition and imagination" },
            venus: { name: "Mount of Venus", prominence: "Full", meaning: "Love and artistic appreciation" }
        }
    };
    
    // Mock palm reading data for Elena
    const elenaPalmReading = {
        greeting: "Hey Elena! Time for your cosmic Romanian-Cancer palm reading!",
        overallPersonality: "As a Cancer from Romania, you blend Eastern European depth with water sign intuition.",
        lines: {
            lifeLine: { name: "Life Line", description: "Vibrant energy", meaning: "Strong vitality", personalizedInsight: "Romanian resilience shows" },
            heartLine: { name: "Heart Line", description: "Emotional depth", meaning: "Cancer sensitivity", personalizedInsight: "Passionate Romanian heart" },
            headLine: { name: "Head Line", description: "Creative thinking", meaning: "Imaginative mind", personalizedInsight: "Eastern European wisdom" },
            marriageLine: { name: "Marriage Line", description: "Deep connections", meaning: "Meaningful relationships", personalizedInsight: "Traditional Romanian values" },
            fateLine: { name: "Fate Line", description: "Determined path", meaning: "Strong will", personalizedInsight: "Romanian determination" },
            successLine: { name: "Success Line", description: "Achievement oriented", meaning: "Success potential", personalizedInsight: "Ambitious spirit" },
            travelLine: { name: "Travel Line", description: "Exploration desires", meaning: "Adventure seeking", personalizedInsight: "Curious nature" }
        },
        mounts: {
            mars: { name: "Mount of Mars", prominence: "Strong", meaning: "Warrior spirit" },
            jupiter: { name: "Mount of Jupiter", prominence: "Developed", meaning: "Leadership potential" },
            saturn: { name: "Mount of Saturn", prominence: "Moderate", meaning: "Practical approach" },
            sun: { name: "Mount of Sun", prominence: "Prominent", meaning: "Creative expression" },
            mercury: { name: "Mount of Mercury", prominence: "Well-developed", meaning: "Communication gifts" },
            moon: { name: "Mount of Moon", prominence: "Strong", meaning: "Intuitive abilities" },
            venus: { name: "Mount of Venus", prominence: "Full", meaning: "Romantic nature" }
        }
    };
    
    const alexandreData = {
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
    
    const elenaData = {
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
    
    console.log(`👨 Alexandre: ${alexandreData.age} years, born ${alexandreData.dateOfBirth} at ${alexandreData.timeOfBirth}`);
    console.log(`   📍 ${alexandreData.placeOfBirth.city}, ${alexandreData.placeOfBirth.country}`);
    console.log(`   ⭐ ${alexandreData.zodiacSign} with birth time precision`);
    console.log('');
    console.log(`👩 Elena: ${elenaData.age} years, born ${elenaData.dateOfBirth} at ${elenaData.timeOfBirth}`);
    console.log(`   📍 ${elenaData.placeOfBirth.city}, ${elenaData.placeOfBirth.country}`);
    console.log(`   ⭐ ${elenaData.zodiacSign} with birth time precision`);
    console.log('');
    console.log('🚀 Calling ENHANCED COMPATIBILITY function...');
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${baseUrl}/generate-enhanced-compatibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            },
            body: JSON.stringify({
                userReading: {
                    userData: alexandreData,
                    analysis: alexandrePalmReading
                },
                partnerReading: {
                    userData: elenaData,
                    analysis: elenaPalmReading
                },
                directMode: true,
                matchType: 'romantic'
            })
        });
        
        const responseTime = Date.now() - startTime;
        const responseText = await response.text();
        
        console.log(`📊 Response: ${response.status} (${Math.round(responseTime/1000)}s)`);
        
        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('');
            console.log('🎉 SUCCESS - Enhanced compatibility analysis generated!');
            console.log(`   🎯 Overall Score: ${data.analysis?.overallScore || 'N/A'}%`);
            console.log(`   🏷️  Overall Label: ${data.analysis?.overallLabel || 'N/A'}`);
            console.log(`   🏆 Enhancement Level: ${data.enhancementLevel?.level || 'N/A'} (${data.enhancementLevel?.percentage || 'N/A'}%)`);
            console.log(`   📊 Analysis Type: ${data.analysisType || 'N/A'}`);
            console.log(`   👥 Users: ${data.analysis?.users?.user1?.name || 'N/A'} & ${data.analysis?.users?.user2?.name || 'N/A'}`);
            
            if (data.analysis?.enhancedCategories) {
                console.log('');
                console.log('💖 Category Breakdown:');
                data.analysis.enhancedCategories.forEach(category => {
                    console.log(`   ${category.emoji} ${category.category}: ${category.score}%`);
                });
            }
            
            console.log('');
            console.log('🌟 Birth Data Integration Check:');
            const fullContent = JSON.stringify(data.analysis, null, 2);
            const hasFrance = fullContent.toLowerCase().includes('france') || fullContent.toLowerCase().includes('french');
            const hasRomania = fullContent.toLowerCase().includes('romania') || fullContent.toLowerCase().includes('romanian');
            const hasCancer = fullContent.includes('Cancer');
            const hasBirthTimes = fullContent.includes('birth time') || fullContent.includes('14:30') || fullContent.includes('10:15');
            
            console.log(`   🇫🇷 France context: ${hasFrance ? '✅' : '❌'}`);
            console.log(`   🇷🇴 Romania context: ${hasRomania ? '✅' : '❌'}`);
            console.log(`   ♋ Cancer integration: ${hasCancer ? '✅' : '❌'}`);
            console.log(`   🕐 Birth time precision: ${hasBirthTimes ? '✅' : '❌'}`);
            
            // Save detailed result
            fs.writeFileSync('enhanced-compatibility-production-test.json', JSON.stringify(data, null, 2));
            console.log('');
            console.log('📄 Full result saved to: enhanced-compatibility-production-test.json');
            
        } else {
            console.log('');
            console.log(`❌ FAILED: ${response.status}`);
            console.log(`Error details: ${responseText}`);
        }
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('');
    console.log('📊 PRODUCTION LOGS NOW AVAILABLE AT:');
    console.log('https://supabase.com/dashboard/project/uaaglfqvvktstzmhbmas/functions/generate-enhanced-compatibility/logs');
    console.log('');
    console.log('🔍 Look for logs showing:');
    console.log('  - Enhanced compatibility analysis');
    console.log('  - Birth data integration (France/Romania)');
    console.log('  - Cancer + Cancer zodiac processing');  
    console.log('  - Birth time precision calculations');
    console.log('  - Premium enhancement level (100%)');
    console.log('');
    console.log(`⏰ Test completed: ${new Date().toLocaleString()}`);
}

// Run the enhanced compatibility test
testEnhancedCompatibilityLogs().catch(console.error);