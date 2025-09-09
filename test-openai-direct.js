// Direct OpenAI API Test
// Tests OpenAI directly to isolate the issue

const testOpenAI = async () => {
    console.log('🤖 DIRECT OPENAI API TEST');
    console.log('=========================');
    console.log(`⏰ Started: ${new Date().toLocaleString()}\n`);
    
    // Read OpenAI API key from environment
    const fs = require('fs');
    let apiKey = '';
    
    try {
        const envContent = fs.readFileSync('supabase/.env', 'utf8');
        const match = envContent.match(/OPENAI_API_KEY=(.+)/);
        if (match) {
            apiKey = match[1].trim();
            console.log(`🔑 Found API key (${apiKey.length} characters)`);
        }
    } catch (error) {
        console.log('❌ Could not read API key from supabase/.env');
        return;
    }
    
    if (!apiKey) {
        console.log('❌ No API key found');
        return;
    }
    
    // Test 1: Simple text completion (no images)
    console.log('\n🔍 Test 1: Simple text completion');
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: 'Say "API test successful" in a JSON format with a "message" field.'
                    }
                ],
                max_tokens: 100,
                response_format: { type: "json_object" }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Text completion successful');
            console.log(`   Response: ${data.choices[0]?.message?.content}`);
            console.log(`   Usage: ${data.usage?.total_tokens} tokens`);
        } else {
            const errorText = await response.text();
            console.log(`❌ Text completion failed: ${response.status}`);
            console.log(`   Error: ${errorText.substring(0, 200)}`);
        }
    } catch (error) {
        console.log(`❌ Text completion error: ${error.message}`);
    }
    
    // Test 2: Vision API with proper image format
    console.log('\n🔍 Test 2: Vision API with base64 image');
    
    // Create a minimal valid JPEG (base64)
    const minimalJpeg = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You analyze images and respond in JSON format.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Describe this image briefly. Return JSON with "description" field.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${minimalJpeg}`,
                                    detail: 'low'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 100,
                response_format: { type: "json_object" }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Vision API successful');
            console.log(`   Response: ${data.choices[0]?.message?.content}`);
            console.log(`   Usage: ${data.usage?.total_tokens} tokens`);
        } else {
            const errorText = await response.text();
            console.log(`❌ Vision API failed: ${response.status}`);
            console.log(`   Error: ${errorText.substring(0, 200)}`);
        }
    } catch (error) {
        console.log(`❌ Vision API error: ${error.message}`);
    }
    
    console.log(`\n⏰ Completed: ${new Date().toLocaleString()}`);
};

testOpenAI().catch(console.error);