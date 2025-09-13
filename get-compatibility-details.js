// Get full compatibility analysis details
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

async function getCompatibilityDetails() {
    console.log('🔮 Getting Alexandre & Elena Compatibility Details...\n');
    
    // Load palm images
    const palmImages = {
        male: {
            left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.34.jpeg'),
            right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35.jpeg')
        },
        female: {
            left: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg'),
            right: convertImageToBase64('/Users/robrod/Downloads/WhatsApp Image 2025-09-08 at 18.39.35 (1).jpeg')
        }
    };

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

    // Generate individual readings first
    console.log('📋 Step 1: Generating Alexandre palm reading...');
    const maleResponse = await fetch('http://127.0.0.1:54321/functions/v1/generate-palm-reading', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        },
        body: JSON.stringify({
            userData: maleData,
            leftPalmImage: palmImages.male.left,
            rightPalmImage: palmImages.male.right
        })
    });
    const maleReading = await maleResponse.json();
    
    console.log('📋 Step 2: Generating Elena palm reading...');
    const femaleResponse = await fetch('http://127.0.0.1:54321/functions/v1/generate-palm-reading', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        },
        body: JSON.stringify({
            userData: femaleData,
            leftPalmImage: palmImages.female.left,
            rightPalmImage: palmImages.female.right
        })
    });
    const femaleReading = await femaleResponse.json();

    console.log('💕 Step 3: Generating compatibility analysis...');
    const compatibilityResponse = await fetch('http://127.0.0.1:54321/functions/v1/generate-enhanced-compatibility', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        },
        body: JSON.stringify({
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
        })
    });

    const compatibilityResult = await compatibilityResponse.json();
    
    console.log('\n' + '='.repeat(80));
    console.log('💕 ALEXANDRE & ELENA COMPATIBILITY ANALYSIS');
    console.log('='.repeat(80));
    
    if (compatibilityResult.analysis) {
        console.log(`🎯 Overall Score: ${compatibilityResult.analysis.overallScore}%`);
        console.log(`🏷️  Overall Label: ${compatibilityResult.analysis.overallLabel}`);
        console.log(`🏆 Enhancement Level: ${compatibilityResult.enhancementLevel?.level} (${compatibilityResult.enhancementLevel?.percentage}%)`);
        console.log(`🔮 Analysis Type: ${compatibilityResult.analysisType}`);
        
        console.log('\n📊 COMPATIBILITY BREAKDOWN:');
        if (compatibilityResult.analysis.analysisBreakdown) {
            const breakdown = compatibilityResult.analysis.analysisBreakdown;
            console.log(`   🤲 Palm Reading Score: ${breakdown.palmReadingInsights?.score}%`);
            console.log(`   ⭐ Astrological Score: ${breakdown.astrologicalInsights?.score}%`);
            console.log(`   ✨ Cross-Correlation Score: ${breakdown.crossCorrelationMagic?.score}%`);
        }
        
        if (compatibilityResult.analysis.compatibilityCategories) {
            console.log('\n💖 DETAILED CATEGORY SCORES:');
            compatibilityResult.analysis.compatibilityCategories.forEach(category => {
                console.log(`   ${category.emoji} ${category.name}: ${category.score}%`);
                console.log(`      Palm: "${category.palmContribution?.substring(0, 60)}..."`);
                console.log(`      Astro: "${category.astroContribution?.substring(0, 60)}..."`);
            });
        }
        
        console.log('\n🌟 COSMIC MESSAGE:');
        console.log(`"${compatibilityResult.analysis.cosmicMessage}"`);
        
        console.log('\n💡 RELATIONSHIP ADVICE:');
        if (compatibilityResult.analysis.relationshipAdvice) {
            const advice = compatibilityResult.analysis.relationshipAdvice;
            console.log('Strengths:', advice.strengthAreas?.[0] || 'N/A');
            console.log('Growth:', advice.growthOpportunities?.[0] || 'N/A');
            console.log('Communication:', advice.communicationTips?.[0] || 'N/A');
        }
        
        // Save detailed report
        fs.writeFileSync('alexandre-elena-compatibility.json', JSON.stringify(compatibilityResult, null, 2));
        console.log('\n📄 Full report saved to: alexandre-elena-compatibility.json');
        
    } else {
        console.log('❌ Error:', compatibilityResult.error);
    }
}

getCompatibilityDetails().catch(console.error);