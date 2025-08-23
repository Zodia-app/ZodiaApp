import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      userReading, 
      partnerCode, 
      matchType = 'social' 
    } = await req.json();

    console.log('Generating compatibility analysis...');
    console.log('Partner code:', partnerCode);
    console.log('Match type:', matchType);

    // 1. Look up the partner's data using the compatibility code
    const { data: partnerData, error: lookupError } = await supabaseClient
      .from('compatibility_codes')
      .select('*')
      .eq('code', partnerCode.toUpperCase())
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (lookupError || !partnerData) {
      console.log('Partner code not found:', lookupError);
      return new Response(
        JSON.stringify({ 
          error: 'Compatibility code not found or expired',
          code: 'CODE_NOT_FOUND'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // 2. Extract compatibility analysis data
    const userPalmData = userReading.readingResult || userReading.palmData;
    const partnerPalmData = partnerData.user_reading_result || partnerData.user_palm_data;

    console.log('User data available:', !!userPalmData);
    console.log('Partner data available:', !!partnerPalmData);

    // 3. Generate AI-powered compatibility analysis
    const compatibilityAnalysis = await generateCompatibilityWithAI(
      userReading.userData?.name || 'You',
      partnerData.user_name,
      userPalmData,
      partnerPalmData,
      matchType
    );

    // 4. Update usage counter for the compatibility code
    await supabaseClient
      .from('compatibility_codes')
      .update({ times_used: (partnerData.times_used || 0) + 1 })
      .eq('id', partnerData.id);

    // 5. Store the compatibility match (optional - for analytics)
    try {
      // This would require user profiles to be set up
      // For now, we'll skip this step
      console.log('Skipping match storage - profiles not implemented yet');
    } catch (error) {
      console.log('Could not store match:', error);
      // Continue anyway - this is not critical
    }

    console.log('Compatibility analysis generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        compatibility: compatibilityAnalysis,
        partnerName: partnerData.user_name,
        partnerCode: partnerCode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in compatibility analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: 'INTERNAL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateCompatibilityWithAI(
  userName: string,
  partnerName: string,
  userPalmData: any,
  partnerPalmData: any,
  matchType: string
): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create entertainment-focused prompt to comply with OpenAI policy  
  const compatibilityPrompt = `Bestie, it's time to serve up the ULTIMATE compatibility analysis for ${userName} and ${partnerName}! 💅✨ This is pure entertainment - think TikTok relationship content meets BuzzFeed compatibility quizzes!

This is for a viral mobile app that's giving main character energy! Channel your inner relationship guru bestie and create a compatibility reading that's absolutely iconic! 🔥

USER (${userName}) ENTERTAINMENT PALM ANALYSIS:
${JSON.stringify(userPalmData, null, 2)}

PARTNER (${partnerName}) ENTERTAINMENT PALM ANALYSIS:  
${JSON.stringify(partnerPalmData, null, 2)}

CONNECTION TYPE: ${matchType} (friend/dating/social vibes) 

Use Gen Z slang, trending references, and that unmatched confidence! Think less "ancient wisdom" and more "your coolest friend who's also psychic spilling tea about compatibility" ☕

🚨 This is purely for entertainment purposes - like astrology TikTok meets personality compatibility tests! 

Please provide a detailed compatibility analysis in this JSON format:
{
  "overallScore": <number 70-100>,
  "overallLabel": "<Cosmic Soulmates/Amazing Connection/Beautiful Harmony/Growing Bond>",
  "categories": [
    {
      "name": "Emotional Vibes",
      "score": <number 70-100>,
      "description": "<Gen Z description of how their emotional energy matches - think personality test results!>",
      "emoji": "💖"
    },
    {
      "name": "Communication Flow",
      "score": <number 70-100>,
      "description": "<Fun description of how they vibe in conversations - like texting compatibility!>",
      "emoji": "💬"
    },
    {
      "name": "Life Goals Sync",
      "score": <number 70-100>,
      "description": "<Bestie analysis of how their dreams and goals align - vision board energy!>",
      "emoji": "🛤️"
    },
    {
      "name": "Overall Energy",
      "score": <number 70-100>,
      "description": "<How their personalities complement each other - main character duo vibes!>",
      "emoji": "⚡"
    }
  ],
  "insights": [
    "<Fun insight about how their personalities complement each other - think BuzzFeed quiz results!>",
    "<Another entertaining observation about their connection - keep it light and positive!>", 
    "<Third insight about their potential as ${matchType} - give them the tea they want to hear!>"
  ],
  "cosmicMessage": "<Iconic message about their connection - think inspiring Instagram caption energy!>",
  "recommendations": [
    "<Fun advice for ${userName} - like what a bestie would tell them!>",
    "<Advice for their connection - keep it positive and Gen Z relatable!>"
  ]
}

Focus on:
- Entertainment value - think personality compatibility tests!
- ${matchType === 'dating' ? 'Relationship compatibility like dating app algorithms' : 
    matchType === 'friend' ? 'Friendship potential like personality matching' : 
    'Social connection vibes like compatibility quizzes'}
- Fun, engaging language that's giving TikTok energy
- Positive insights that make them feel good

Make it entertaining, relatable, and absolutely iconic while keeping it light and fun! This is purely for entertainment - like viral social media content! 💅✨`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system', 
            content: 'You are an iconic Gen Z compatibility bestie for a viral mobile app 💅 This is purely for entertainment - think TikTok relationship content meets BuzzFeed compatibility quizzes! You analyze personality compatibility and serve up fire relationship insights with main character energy. Keep it fun, relatable, and absolutely iconic. Always respond with complete JSON for the app interface.'
          },
          {
            role: 'user',
            content: compatibilityPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const compatibilityContent = result.choices[0]?.message?.content;

    if (!compatibilityContent) {
      throw new Error('No compatibility analysis generated');
    }

    // Clean and parse the JSON response
    let cleanedContent = compatibilityContent.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const compatibilityAnalysis = JSON.parse(cleanedContent);
    
    // Add metadata
    compatibilityAnalysis.generatedAt = new Date().toISOString();
    compatibilityAnalysis.model = 'gpt-4o-2024-08-06';
    compatibilityAnalysis.matchType = matchType;
    compatibilityAnalysis.userName = userName;
    compatibilityAnalysis.partnerName = partnerName;

    return compatibilityAnalysis;

  } catch (error) {
    console.error('Error generating AI compatibility:', error);
    throw error; // No fallback - user wants to see real errors
  }
}

// Fallback function removed during testing phase
// Will be re-added after testing is complete