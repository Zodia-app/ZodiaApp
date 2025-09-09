// Minimal Palm Reading Test
// Tests with the smallest valid image to isolate the issue

// Create a minimal 1x1 PNG image
const createMinimalPNG = () => {
    // PNG signature + IHDR chunk for 1x1 RGB image + minimal IDAT + IEND
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, // Width: 1
        0x00, 0x00, 0x00, 0x01, // Height: 1
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), etc.
        0x90, 0x77, 0x53, 0xDE, // IHDR CRC
        0x00, 0x00, 0x00, 0x0C, // IDAT length
        0x49, 0x44, 0x41, 0x54, // IDAT
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, // Compressed data
        0x00, 0x01, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND length
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // IEND CRC
    ]);
    return pngData.toString('base64');
};

const testMinimalPalmReading = async () => {
    console.log('🧪 MINIMAL PALM READING TEST');
    console.log('============================');
    console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
    
    const minimalImage = createMinimalPNG();
    console.log(`📷 Generated minimal PNG image (${minimalImage.length} characters)`);
    
    const testData = {
        userData: {
            name: "TestUser",
            age: 25,
            zodiacSign: "Leo"
        },
        leftPalmImage: minimalImage,
        rightPalmImage: minimalImage
    };
    
    console.log('\n🔍 Testing palm reading edge function...');
    
    try {
        const startTime = Date.now();
        
        const response = await fetch('http://127.0.0.1:54321/functions/v1/generate-palm-reading', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
            },
            body: JSON.stringify(testData)
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`⏱️  Response time: ${responseTime}ms`);
        console.log(`📊 Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`📄 Response length: ${responseText.length} characters`);
        
        if (!response.ok) {
            console.log(`❌ HTTP Error ${response.status}`);
            console.log(`📝 Response: ${responseText}`);
            return;
        }
        
        const data = JSON.parse(responseText);
        
        console.log('\n✅ SUCCESS! Edge function responded correctly');
        
        if (data.reading) {
            console.log('\n📊 Palm Reading Analysis:');
            console.log(`   Greeting: "${data.reading.greeting?.substring(0, 100)}..."`);
            console.log(`   Lines count: ${Object.keys(data.reading.lines || {}).length}/7`);
            console.log(`   Mounts count: ${Object.keys(data.reading.mounts || {}).length}/7`);
            console.log(`   Special markings: ${data.reading.specialMarkings?.length || 0}/4`);
            
            // Check for banned phrases
            const greeting = data.reading.greeting || '';
            const hasMainCharacterEnergy = greeting.includes('MAIN CHARACTER ENERGY');
            console.log(`   Template check: ${hasMainCharacterEnergy ? '❌ Found template phrase' : '✅ Unique content'}`);
        }
        
        if (data.usage) {
            console.log('\n💰 OpenAI Usage:');
            console.log(`   Prompt tokens: ${data.usage.prompt_tokens}`);
            console.log(`   Completion tokens: ${data.usage.completion_tokens}`);
            console.log(`   Total tokens: ${data.usage.total_tokens}`);
        }
        
        console.log('\n🎉 EDGE FUNCTION IS WORKING CORRECTLY!');
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        
        if (error.name === 'AbortError') {
            console.log('⏰ Request timed out - function may be too slow');
        } else if (error.message.includes('fetch')) {
            console.log('🌐 Network error - is Supabase running?');
        }
    }
    
    console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
};

testMinimalPalmReading().catch(console.error);