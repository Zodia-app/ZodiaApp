// supabase/functions/generate-palm-reading/index.ts
// Fixed uniqueness issue - Sept 7th v2 - BANNED main character energy phrase

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
    timeOfBirth?: string; // HH:MM format (24-hour) - OPTIONAL
    zodiacSign?: string;
    placeOfBirth?: {
      city?: string;
      state?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
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
    const systemPrompt = `You are an iconic Gen Z palm reading bestie for a viral mobile app 💅 This is purely for entertainment - think TikTok astrology meets BuzzFeed personality quizzes! You analyze hand pics and serve up fire readings with unique, fresh energy. Keep it fun, relatable, and absolutely unhinged in the best way. Always respond with complete JSON for the app interface.`;

    // Create the analysis prompt - more robust with explicit field requirements
    const timestamp = new Date().getTime();
    
    // Extract birth location info
    const birthPlace = userData.placeOfBirth ? 
      `${userData.placeOfBirth.city || ''}, ${userData.placeOfBirth.country || ''}`.replace(/^, |, $/, '') : 
      'Unknown location';
    
    // Create birth time info
    const birthTimeInfo = userData.timeOfBirth ? 
      ` at ${userData.timeOfBirth} (${formatBirthTime(userData.timeOfBirth)})` : 
      ' (birth time not provided)';
    
    // Calculate more detailed astrological context
    const astrologicalContext = generateAstrologicalContext(userData);
    
    const analysisPrompt = `Bestie, it's time to absolutely SERVE ${userData.name} the most iconic palm reading ever! 💅✨ This is pure entertainment - think viral TikTok content meets your favorite astrology account.

🌟 ENHANCED PERSON DETAILS:
Name: ${userData.name}
Age: ${age} years old
Birth Date: ${userData.dateOfBirth}${birthTimeInfo}
Birth Place: ${birthPlace}
Zodiac Sign: ${userData.zodiacSign}
${astrologicalContext}

Reading ID: ${timestamp} (make this reading unique!)

🔮 MANDATORY BIRTH DATA INTEGRATION:
You MUST explicitly reference and integrate their birth details throughout the reading:

✅ REQUIRED MENTIONS:
- EXPLICITLY mention their birth country/location "${birthPlace}" in personality analysis
- DIRECTLY reference their ${userData.zodiacSign} zodiac traits in the reading
- SPECIFICALLY mention their age (${age} years old) and life stage context
${userData.timeOfBirth ? '- CLEARLY reference their birth time enhancing astrological precision' : '- Note that birth time would enhance accuracy if available'}

🌟 HOW TO INTEGRATE:
- In personality: "As someone born in ${userData.placeOfBirth?.country || 'your birthplace'}, your ${userData.zodiacSign} nature shows..."
- In lines analysis: Reference how being ${age} years old affects their line development
- In insights: Connect ${userData.zodiacSign} planetary influences to specific palm mounts
- Throughout: Make cultural and regional personality connections to ${birthPlace}

Channel your inner mystic influencer and create a reading that's giving iconic energy! Use Gen Z slang, trending references, and that unmatched confidence. Think less "ancient wisdom" and more "your coolest friend who's also psychic spilling tea about your life" ☕

🚨 MANDATORY REQUIREMENTS - FAILURE TO COMPLY WILL CAUSE SYSTEM ERRORS:
- MUST include EXACTLY 7 LINES: lifeLine, heartLine, headLine, marriageLine, fateLine, successLine, travelLine
- MUST include EXACTLY 7 MOUNTS: mars, jupiter, saturn, sun, mercury, moon, venus
- EVERY line and mount must have complete analysis with name, description, meaning, and insight
- Fill ALL 4 special markings with meaningful content - never use empty strings
- Every field must contain actual content, not placeholders

🎯 REQUIRED STRUCTURE - DO NOT OMIT ANY OF THESE KEYS:
Lines section must have: lifeLine, heartLine, headLine, marriageLine, fateLine, successLine, travelLine
Mounts section must have: mars, jupiter, saturn, sun, mercury, moon, venus

🌟 UNIQUENESS IS KEY 🌟
Each reading must be COMPLETELY different! Vary:
- Greetings (no repeating phrases)
- Personality descriptions (avoid templates) 
- Writing style and slang
- Advice and insights
- Energy and tone

This is for the girlies who live for astrology TikTok, personality tests, and iconic moments! Keep it positive but make it FRESH and UNIQUE every time! 💅

🚨 ABSOLUTELY NO REPETITIVE PHRASES! 🚨
- NEVER use "MAIN CHARACTER ENERGY" - this phrase is BANNED
- NEVER use identical greetings - each must be completely different
- Vary your vocabulary, slang, and expressions every single time
- Be creative with different Gen Z phrases and energy

🔥 CRITICAL - APP WILL CRASH IF YOU DON'T FOLLOW THIS: 
- Return ONLY valid JSON with this EXACT structure (no markdown, no code blocks)
- Missing ANY of the 7 lines or 7 mounts will cause the mobile app to crash
- You MUST analyze all traditional palmistry elements - this is non-negotiable

{
  "greeting": "Generate a completely unique greeting for ${userData.name} - be creative and personal!",
  "overallPersonality": "Write a personalized personality analysis for ${userData.name}",
  "lines": {
    "lifeLine": {
      "name": "Life Line (Your Main Character Arc) 🌟",
      "description": "What you're seeing in ${userData.name}'s life line - give it that TikTok energy",
      "meaning": "How this line reveals their life energy, vitality, and overall vibe check", 
      "personalizedInsight": "Serve ${userData.name} some life advice that hits different - use slang and keep it motivational but fun"
    },
    "heartLine": {
      "name": "Heart Line (Love Language Decoder) 💕",
      "description": "The tea you're reading from ${userData.name}'s heart line",
      "meaning": "What this reveals about their romantic style, emotional intelligence, and relationship energy",
      "personalizedInsight": "Drop some relationship wisdom for ${userData.name} - think dating app bio meets sage advice"
    },
    "headLine": {
      "name": "Head Line (Big Brain Energy) 🧠", 
      "description": "Reading ${userData.name}'s head line like you're analyzing their thought process",
      "meaning": "How they think, process info, and make decisions - basically their mental vibe",
      "personalizedInsight": "Give ${userData.name} some brain power insights that slap - motivation meets intelligence"
    },
    "marriageLine": {
      "name": "Marriage Line (Relationship Status Predictions) 💍",
      "description": "What ${userData.name}'s relationship lines are telling you",
      "meaning": "Their partnership potential, commitment style, and love story trajectory",
      "personalizedInsight": "Serve ${userData.name} relationship predictions that are giving hopeless romantic meets reality check"
    },
    "fateLine": {
      "name": "Fate Line (Career Girlie Insights) 🚀",
      "description": "Reading ${userData.name}'s fate line like you're their career counselor bestie",
      "meaning": "Their professional path, work ethic, and how they're about to secure the bag", 
      "personalizedInsight": "Drop career advice for ${userData.name} that's giving boss babe energy - realistic but aspirational"
    },
    "successLine": {
      "name": "Success Line (Fame & Fortune Vibes) 👑",
      "description": "What ${userData.name}'s success line is revealing about their glow up potential",
      "meaning": "Recognition, achievements, and how they're about to absolutely serve in life",
      "personalizedInsight": "Hype up ${userData.name}'s success potential - think manifestation meets actual advice"
    },
    "travelLine": {
      "name": "Travel Line (Wanderlust Chronicles) ✈️",
      "description": "Reading ${userData.name}'s adventure and travel potential",
      "meaning": "Their exploration vibe, wanderlust level, and life-changing journey predictions",
      "personalizedInsight": "Give ${userData.name} travel insights that are giving gap year energy meets bucket list goals"
    }
  },
  "mounts": {
    "mars": {
      "name": "Mount of Mars (Warrior Energy) ⚔️",
      "prominence": "How prominent this mount is - describe it like you're rating their fierce energy", 
      "meaning": "Their courage level, fighting spirit, and how they handle conflict - basically their badass quotient"
    },
    "jupiter": {
      "name": "Mount of Jupiter (Leader of the Pack) 👑",
      "prominence": "Rate ${userData.name}'s leadership mount prominence",
      "meaning": "Their natural born leader vibes, ambition level, and main character potential"
    },
    "saturn": {
      "name": "Mount of Saturn (Responsible Bestie) 📚",
      "prominence": "How developed their responsibility mount is", 
      "meaning": "Their discipline game, reliability factor, and how they handle adulting"
    },
    "sun": {
      "name": "Mount of Sun (Creative Icon) 🎨",
      "prominence": "Rating ${userData.name}'s artistic/creative mount",
      "meaning": "Their creative genius, artistic flair, and ability to absolutely serve looks/content/vibes"
    },
    "mercury": {
      "name": "Mount of Mercury (Communication Queen) 💬", 
      "prominence": "How strong their communication mount appears",
      "meaning": "Their social skills, business sense, and ability to absolutely dominate conversations"
    },
    "moon": {
      "name": "Mount of Moon (Mystical Intuition) 🌙",
      "prominence": "Reading ${userData.name}'s intuitive/psychic mount development",
      "meaning": "Their sixth sense game, imagination level, and mystical main character energy"
    },
    "venus": {
      "name": "Mount of Venus (Lover Girl/Boy Energy) 💖",
      "prominence": "How prominent their love and beauty mount is",
      "meaning": "Their romantic nature, aesthetic sense, and general hotness/charm factor"
    }
  },
  "specialMarkings": [
    "Drop a specific marking observation that's giving unique energy for ${userData.name}",
    "Call out another distinctive palm feature that makes ${userData.name} absolutely iconic",
    "Point out a third special element that's serving main character vibes",
    "Mention a fourth notable pattern that's absolutely sending you about ${userData.name}"
  ],
  "handComparison": "Compare ${userData.name}'s left vs right hands like you're analyzing their public vs private persona - make it relatable and fun",
  "futureInsights": "Serve ${userData.name} some future predictions that are giving manifestation journal meets reality check - keep it exciting but achievable",
  "personalizedAdvice": "Drop some life advice for ${userData.name} that hits different - think wise bestie meets motivational TikTok",
  "luckyElements": {
    "colors": ["Pick trendy/aesthetic colors that match ${userData.name}'s vibe", "Second color that screams their energy", "Third color for their aesthetic"],
    "numbers": [7, 3, 11],
    "days": ["Pick days that feel right for ${userData.name}", "Second lucky day"]
  }
}

🚨 CRITICAL REQUIREMENTS - APP WILL BREAK IF NOT FOLLOWED:
- Do NOT use empty strings, do NOT create keys with empty names like "": ""
- Every field must have meaningful content - NO PLACEHOLDERS
- All 7 lines must be analyzed: Heart, Life, Head, Marriage, Fate, Success, Travel
- All 7 mounts must be analyzed: Mars, Jupiter, Saturn, Sun, Mercury, Moon, Venus
- Each line needs: name, description, meaning, personalizedInsight
- Each mount needs: name, prominence, meaning
- Prominence should describe level like "Well-developed", "Moderately prominent", "Slightly raised", etc.
- futureInsights MUST be at least 50 words of meaningful predictions
- personalizedAdvice MUST be at least 50 words of actionable advice
- handComparison MUST be meaningful comparison content`;

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
        user: userData.name, // Add user identifier
        seed: timestamp // Add randomness for uniqueness
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
    
    // Check critical fields that users expect
    if (!parsedReading.futureInsights || parsedReading.futureInsights.trim().length < 10) {
      console.error('❌ Missing or empty futureInsights:', parsedReading.futureInsights);
      throw new Error('Incomplete reading: futureInsights must be meaningful content');
    }
    
    if (!parsedReading.personalizedAdvice || parsedReading.personalizedAdvice.trim().length < 10) {
      console.error('❌ Missing or empty personalizedAdvice:', parsedReading.personalizedAdvice);
      throw new Error('Incomplete reading: personalizedAdvice must be meaningful content');
    }
    
    if (!parsedReading.handComparison || parsedReading.handComparison.trim().length < 10) {
      console.error('❌ Missing or empty handComparison:', parsedReading.handComparison);
      throw new Error('Incomplete reading: handComparison must be meaningful content');
    }
    
    console.log('✅ Reading validation passed - all required fields present and meaningful');

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

/**
 * Format birth time for display
 */
function formatBirthTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Generate astrological context based on birth data
 */
function generateAstrologicalContext(userData: any): string {
  let context = '';
  
  // Add zodiac element and modality
  const zodiacData = getZodiacData(userData.zodiacSign);
  if (zodiacData) {
    context += `Element: ${zodiacData.element} | Modality: ${zodiacData.modality} | Ruling Planet: ${zodiacData.ruler}\n`;
  }
  
  // Add birth location cultural context
  if (userData.placeOfBirth?.country) {
    context += `Cultural Influence: ${userData.placeOfBirth.country} heritage\n`;
  }
  
  // Add life stage context based on age
  const age = calculateAge(userData.dateOfBirth);
  if (age) {
    const lifeStage = getLifeStage(age);
    context += `Life Stage: ${lifeStage} (${age} years)\n`;
  }
  
  // Add birth time context
  if (userData.timeOfBirth) {
    context += `Birth Time Available: Enhanced astrological precision possible\n`;
  }
  
  return context;
}

/**
 * Get zodiac sign data
 */
function getZodiacData(zodiacSign?: string) {
  const zodiacInfo: { [key: string]: { element: string; modality: string; ruler: string } } = {
    'Aries': { element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
    'Taurus': { element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
    'Gemini': { element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
    'Cancer': { element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
    'Leo': { element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
    'Virgo': { element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
    'Libra': { element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
    'Scorpio': { element: 'Water', modality: 'Fixed', ruler: 'Pluto' },
    'Sagittarius': { element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
    'Capricorn': { element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
    'Aquarius': { element: 'Air', modality: 'Fixed', ruler: 'Uranus' },
    'Pisces': { element: 'Water', modality: 'Mutable', ruler: 'Neptune' }
  };
  
  return zodiacSign ? zodiacInfo[zodiacSign] : null;
}

/**
 * Get life stage description based on age
 */
function getLifeStage(age: number): string {
  if (age < 18) return 'Youth/Formation';
  if (age < 30) return 'Young Adult/Exploration';
  if (age < 45) return 'Adult/Building';
  if (age < 60) return 'Midlife/Mastery';
  if (age < 75) return 'Mature/Wisdom';
  return 'Elder/Legacy';
}

