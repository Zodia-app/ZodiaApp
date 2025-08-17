// supabase/functions/generate-palm-reading/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  leftPalmImage: string;
  rightPalmImage: string;
  userData: {
    name: string;
    age?: number;
    dateOfBirth?: string;
    zodiacSign?: string;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== EDGE FUNCTION CALLED ===');
    const requestBody = await req.json() as RequestBody;
    console.log('Request body keys:', Object.keys(requestBody));
    
    const { userData, leftPalmImage, rightPalmImage } = requestBody;

    // Validate required fields
    if (!userData || !leftPalmImage || !rightPalmImage) {
      console.error('Missing data - userData:', !!userData, 'leftPalmImage:', !!leftPalmImage, 'rightPalmImage:', !!rightPalmImage);
      throw new Error('Missing required data');
    }
    
    console.log('All required data present, proceeding...');

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API key exists:', !!openAIApiKey);
    console.log('OpenAI API key length:', openAIApiKey?.length || 0);
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // The images are already base64 from the client
    console.log('Image data lengths - left:', leftPalmImage?.length, 'right:', rightPalmImage?.length);
    const leftPalmBase64 = leftPalmImage;
    const rightPalmBase64 = rightPalmImage;

    // Calculate age if not provided
    const age = userData.age || calculateAge(userData.dateOfBirth);

    // Create the system prompt - entertainment focused to avoid content policy issues
    const systemPrompt = `You are a fun entertainment palm reading assistant for a mobile app. This is purely for entertainment purposes, like horoscopes or personality quizzes. You analyze hand images and create engaging, positive, personalized content for young adults. Always respond with complete JSON for the app interface.`;

    // Create the analysis prompt - more robust with explicit field requirements
    const analysisPrompt = `Create a comprehensive palm reading for ${userData.name} based on these hand photos! This is for entertainment only, like a personality quiz or horoscope app for Gen Z users.

Person Details: ${userData.name}, ${age} years old, ${userData.zodiacSign}

Create a positive, uplifting reading that focuses on personality traits, potential, and encouragement. This is similar to astrology or MBTI personality analysis - use the visual elements you observe in the hand photos to craft insights about character, strengths, and opportunities.

🚨 MANDATORY REQUIREMENTS - FAILURE TO COMPLY WILL CAUSE SYSTEM ERRORS:
- MUST include EXACTLY 7 LINES: lifeLine, heartLine, headLine, marriageLine, fateLine, successLine, travelLine
- MUST include EXACTLY 7 MOUNTS: mars, jupiter, saturn, sun, mercury, moon, venus
- EVERY line and mount must have complete analysis with name, description, meaning, and insight
- Fill ALL 4 special markings with meaningful content - never use empty strings
- Every field must contain actual content, not placeholders

🎯 REQUIRED STRUCTURE - DO NOT OMIT ANY OF THESE KEYS:
Lines section must have: lifeLine, heartLine, headLine, marriageLine, fateLine, successLine, travelLine
Mounts section must have: mars, jupiter, saturn, sun, mercury, moon, venus

Remember: This is entertainment content for a social media app, like BuzzFeed quizzes or daily horoscopes. Focus on positive traits, personal growth, and encouragement.

🔥 CRITICAL - APP WILL CRASH IF YOU DON'T FOLLOW THIS: 
- Return ONLY valid JSON with this EXACT structure (no markdown, no code blocks)
- Missing ANY of the 7 lines or 7 mounts will cause the mobile app to crash
- You MUST analyze all traditional palmistry elements - this is non-negotiable

{
  "greeting": "Hi ${userData.name}! ✨ Your personalized palm entertainment reading is ready!",
  "overallPersonality": "Write 3-4 positive sentences about ${userData.name}'s personality traits and potential",
  "lines": {
    "lifeLine": {
      "name": "Life Line",
      "description": "Describe what you observe about the life line",
      "meaning": "Explain what this reveals about vitality and life approach", 
      "personalizedInsight": "Write 2-3 sentences of personal guidance for ${userData.name}"
    },
    "heartLine": {
      "name": "Heart Line",
      "description": "Describe what you observe about the heart line",
      "meaning": "Explain what this reveals about emotional nature",
      "personalizedInsight": "Write 2-3 sentences of relationship guidance for ${userData.name}"
    },
    "headLine": {
      "name": "Head Line", 
      "description": "Describe what you observe about the head line",
      "meaning": "Explain what this reveals about thinking patterns",
      "personalizedInsight": "Write 2-3 sentences of mental guidance for ${userData.name}"
    },
    "marriageLine": {
      "name": "Marriage Line",
      "description": "Describe what you observe about the marriage/relationship lines",
      "meaning": "Explain what this reveals about relationships and partnerships",
      "personalizedInsight": "Write 2-3 sentences of love guidance for ${userData.name}"
    },
    "fateLine": {
      "name": "Fate Line",
      "description": "Describe what you observe about the fate line",
      "meaning": "Explain what this reveals about career and life direction", 
      "personalizedInsight": "Write 2-3 sentences of career guidance for ${userData.name}"
    },
    "successLine": {
      "name": "Success Line",
      "description": "Describe what you observe about the success/sun line",
      "meaning": "Explain what this reveals about achievement and recognition",
      "personalizedInsight": "Write 2-3 sentences of success guidance for ${userData.name}"
    },
    "travelLine": {
      "name": "Travel Line",
      "description": "Describe what you observe about travel lines",
      "meaning": "Explain what this reveals about journeys and adventures",
      "personalizedInsight": "Write 2-3 sentences of travel guidance for ${userData.name}"
    }
  },
  "mounts": {
    "mars": {
      "name": "Mount of Mars",
      "prominence": "Describe the prominence level you observe", 
      "meaning": "Explain the courage and determination insights this reveals"
    },
    "jupiter": {
      "name": "Mount of Jupiter",
      "prominence": "Describe the prominence level you observe",
      "meaning": "Explain the leadership and ambition insights this reveals"
    },
    "saturn": {
      "name": "Mount of Saturn",
      "prominence": "Describe the prominence level you observe", 
      "meaning": "Explain the discipline and responsibility insights this reveals"
    },
    "sun": {
      "name": "Mount of Sun (Apollo)",
      "prominence": "Describe the prominence level you observe",
      "meaning": "Explain the creativity and artistic insights this reveals"
    },
    "mercury": {
      "name": "Mount of Mercury", 
      "prominence": "Describe the prominence level you observe",
      "meaning": "Explain the communication and business insights this reveals"
    },
    "moon": {
      "name": "Mount of Moon (Luna)",
      "prominence": "Describe the prominence level you observe",
      "meaning": "Explain the intuition and imagination insights this reveals"
    },
    "venus": {
      "name": "Mount of Venus",
      "prominence": "Describe the prominence level you observe",
      "meaning": "Explain the love and vitality insights this reveals"
    }
  },
  "specialMarkings": [
    "Write a first specific marking observation for ${userData.name}",
    "Write a second unique palm feature for ${userData.name}",
    "Write a third distinctive element for ${userData.name}",
    "Write a fourth notable pattern for ${userData.name}"
  ],
  "handComparison": "Write 3-4 sentences comparing left vs right hands for ${userData.name}",
  "futureInsights": "Write 4-5 sentences of predictions and opportunities for ${userData.name}",
  "personalizedAdvice": "Write 4-5 sentences of actionable guidance for ${userData.name}",
  "luckyElements": {
    "colors": ["First Color", "Second Color", "Third Color"],
    "numbers": [3, 7, 9],
    "days": ["First Day", "Second Day"]
  }
}

IMPORTANT: 
- Do NOT use empty strings, do NOT create keys with empty names like "": ""
- Every field must have meaningful content
- All 7 lines must be analyzed: Heart, Life, Head, Marriage, Fate, Success, Travel
- All 7 mounts must be analyzed: Mars, Jupiter, Saturn, Sun, Mercury, Moon, Venus
- Each line needs: name, description, meaning, personalizedInsight
- Each mount needs: name, prominence, meaning
- Prominence should describe level like "Well-developed", "Moderately prominent", "Slightly raised", etc.`;

    // Call OpenAI API with vision capability
    console.log('=== CALLING OPENAI API ===');
    console.log('API Key length:', openAIApiKey.length);
    console.log('Model: gpt-4o');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using the vision-capable model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${leftPalmBase64}`,
                  detail: 'high'
                }
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${rightPalmBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        response_format: { type: "json_object" },
        user: userData.name // Add user identifier
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);
    
    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('=== OPENAI ERROR DETAILS ===');
      console.error('Status:', openAIResponse.status);
      console.error('Error Response:', error);
      
      // Log error details but don't fallback
      console.error('OpenAI API failed with status:', openAIResponse.status);
      console.error('Error details:', error);
      
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    console.log('=== OPENAI RESPONSE DATA ===');
    console.log('Data structure:', JSON.stringify(data, null, 2));
    
    const reading = data.choices[0]?.message?.content;
    console.log('Reading content:', reading);

    if (!reading) {
      console.error('No reading in response - data.choices:', data.choices);
      throw new Error('OpenAI returned empty response');
    }

    // Parse the JSON response
    let parsedReading;
    try {
      parsedReading = JSON.parse(reading);
    } catch (e) {
      console.error('Failed to parse reading as JSON:', e);
      console.error('Raw reading content:', reading);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Validate the response has all required elements
    const requiredLines = ['lifeLine', 'heartLine', 'headLine', 'marriageLine', 'fateLine', 'successLine', 'travelLine'];
    const requiredMounts = ['mars', 'jupiter', 'saturn', 'sun', 'mercury', 'moon', 'venus'];
    
    console.log('=== VALIDATING READING STRUCTURE ===');
    console.log('Lines found:', Object.keys(parsedReading.lines || {}));
    console.log('Mounts found:', Object.keys(parsedReading.mounts || {}));
    
    // Check lines
    if (!parsedReading.lines) {
      console.error('❌ Missing lines in response');
      throw new Error('Incomplete reading: missing lines section');
    }
    
    const missingLines = requiredLines.filter(line => !parsedReading.lines[line]);
    if (missingLines.length > 0) {
      console.error('❌ Missing lines:', missingLines);
      console.error('Required lines:', requiredLines);
      console.error('Found lines:', Object.keys(parsedReading.lines));
      throw new Error(`Incomplete reading: missing lines - ${missingLines.join(', ')}`);
    }
    
    // Check mounts
    if (!parsedReading.mounts) {
      console.error('❌ Missing mounts in response');
      throw new Error('Incomplete reading: missing mounts section');
    }
    
    const missingMounts = requiredMounts.filter(mount => !parsedReading.mounts[mount]);
    if (missingMounts.length > 0) {
      console.error('❌ Missing mounts:', missingMounts);
      console.error('Required mounts:', requiredMounts);
      console.error('Found mounts:', Object.keys(parsedReading.mounts));
      throw new Error(`Incomplete reading: missing mounts - ${missingMounts.join(', ')}`);
    }
    
    // Check other required fields
    if (!parsedReading.specialMarkings || parsedReading.specialMarkings.length < 4) {
      console.error('❌ Insufficient special markings:', parsedReading.specialMarkings?.length || 0);
      throw new Error('Incomplete reading: need at least 4 special markings');
    }
    
    console.log('✅ Reading validation passed - all 7 lines and 7 mounts present');

    return new Response(
      JSON.stringify({ 
        reading: parsedReading,
        model: data.model,
        usage: data.usage,
        basedOnActualImages: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error generating palm reading:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

