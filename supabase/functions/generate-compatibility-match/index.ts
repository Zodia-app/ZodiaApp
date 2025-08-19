// supabase/functions/generate-compatibility-match/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  initiator_reading: any;
  partner_reading: any;
  initiator_info: {
    name: string;
    age?: number;
    zodiacSign?: string;
  };
  partner_info: {
    name: string;
    age?: number;
    zodiacSign?: string;
  };
  match_type: 'romantic' | 'friendship' | 'platonic';
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== COMPATIBILITY MATCH FUNCTION CALLED ===');
    const requestBody = await req.json() as RequestBody;
    console.log('Request body keys:', Object.keys(requestBody));
    
    const { initiator_reading, partner_reading, initiator_info, partner_info, match_type } = requestBody;

    // Validate required fields
    if (!initiator_reading || !partner_reading || !initiator_info || !partner_info) {
      console.error('Missing required data');
      throw new Error('Missing required reading or user data');
    }
    
    console.log('All required data present, proceeding with compatibility analysis...');

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create the system prompt for compatibility analysis
    const systemPrompt = `You are the most iconic Gen Z compatibility analyst bestie! 💅 You analyze palm readings to create viral-worthy compatibility insights. Think TikTok astrology meets relationship expert meets your most psychic friend. Keep it fun, relatable, and absolutely unhinged in the best way! Always respond with complete JSON.`;

    // Create the compatibility analysis prompt
    const compatibilityPrompt = `BESTIE! Time to serve the most ICONIC compatibility analysis for ${initiator_info.name} & ${partner_info.name}! 🔥

Match Type: ${match_type}
Person 1: ${initiator_info.name}, ${initiator_info.age || 'unknown age'}, ${initiator_info.zodiacSign || 'zodiac unknown'}
Person 2: ${partner_info.name}, ${partner_info.age || 'unknown age'}, ${partner_info.zodiacSign || 'zodiac unknown'}

I'm giving you both of their complete palm readings. Use this data to create a compatibility analysis that's giving main character energy! Channel your inner mystic influencer and create insights that are perfect for sharing on social media.

🚨 COMPATIBILITY ANALYSIS REQUIREMENTS:
You MUST calculate scores (0-100) for:
- overall_score: Combined compatibility 
- love_score: Heart lines, marriage lines, venus mounts analysis
- communication_score: Head lines, mercury mounts, interaction patterns
- life_goals_score: Fate lines, success lines, jupiter mounts alignment  
- energy_score: Life lines, mars mounts, overall vitality match

Create analysis that's:
- Using Gen Z slang and trending language
- Positive but realistic about challenges
- Shareable and meme-worthy
- Specific to their palm reading data
- Appropriate for the match type (${match_type})

🔥 REQUIRED JSON STRUCTURE:

{
  "compatibility_scores": {
    "overall_score": 85,
    "love_score": 88,
    "communication_score": 82,
    "life_goals_score": 87,
    "energy_score": 83
  },
  "analysis": {
    "greeting": "Iconic greeting using both names and score - pure Gen Z energy",
    "vibe_summary": "3-4 sentences about their overall compatibility vibe using slang",
    "compatibility_highlights": [
      "First major strength using specific palm reading insights",
      "Second strength with Gen Z language", 
      "Third highlight that's absolutely sending you",
      "Fourth highlight about their connection"
    ],
    "potential_challenges": [
      "First growth area phrased positively with slang",
      "Second challenge reframed as opportunity",
      "Third area for development if needed"
    ],
    "relationship_dynamics": {
      "communication_style": "How they communicate based on head lines and mercury mounts",
      "conflict_resolution": "How they handle drama based on palm patterns",
      "shared_interests": "Common ground from their readings",
      "growth_potential": "Long-term potential based on compatibility type"
    },
    "fun_facts": [
      "Interesting observation about their palm compatibility",
      "Another fun insight that's shareable",
      "Third fact that's absolutely iconic",
      "Fourth observation that's giving cosmic vibes"
    ],
    ${match_type === 'romantic' ? `"date_ideas": [
      "Creative date idea based on their palm energies",
      "Adventure suggestion from their compatibility",
      "Intimate activity that matches their vibe",
      "Fun experience that amplifies their connection"
    ],` : `"friendship_activities": [
      "Activity that matches their combined energy",
      "Adventure based on their compatibility patterns", 
      "Creative project idea for their dynamic",
      "Social activity that enhances their bond"
    ],`}
    "advice_for_duo": "4-5 sentences of actionable relationship advice using Gen Z wisdom",
    "cosmic_connection": "2-3 sentences about their spiritual/cosmic compatibility",
    "shareable_quote": "One-liner that perfectly captures their vibe - meme worthy!",
    "aesthetic_theme": {
      "emoji_combo": ["💅", "✨", "🔥", "💕"],
      "color_palette": ["Color 1", "Color 2", "Color 3"],
      "vibe_keywords": ["main character", "iconic", "unmatched", "serving"]
    }
  }
}

PALM READING DATA:
Person 1 (${initiator_info.name}): ${JSON.stringify(initiator_reading)}
Person 2 (${partner_info.name}): ${JSON.stringify(partner_reading)}

Remember: Make this compatibility analysis absolutely ICONIC! Use their actual palm reading data to create personalized insights. The goal is to create something they'll want to screenshot and share with everyone! 💅✨`;

    // Call OpenAI API for compatibility analysis
    console.log('=== CALLING OPENAI FOR COMPATIBILITY ANALYSIS ===');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: compatibilityPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);
    
    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('=== OPENAI ERROR DETAILS ===');
      console.error('Status:', openAIResponse.status);
      console.error('Error Response:', error);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    console.log('=== OPENAI RESPONSE DATA ===');
    console.log('Response received successfully');
    
    const analysisContent = data.choices[0]?.message?.content;
    console.log('Analysis content received:', !!analysisContent);

    if (!analysisContent) {
      console.error('No analysis content in response');
      throw new Error('OpenAI returned empty compatibility analysis');
    }

    // Parse the JSON response
    let compatibilityResult;
    try {
      compatibilityResult = JSON.parse(analysisContent);
    } catch (e) {
      console.error('Failed to parse compatibility analysis as JSON:', e);
      console.error('Raw analysis content:', analysisContent);
      throw new Error('Failed to parse OpenAI compatibility response as JSON');
    }

    // Validate the response structure
    if (!compatibilityResult.compatibility_scores || !compatibilityResult.analysis) {
      console.error('Invalid compatibility analysis structure');
      throw new Error('Incomplete compatibility analysis structure');
    }

    console.log('✅ Compatibility analysis validation passed');

    return new Response(
      JSON.stringify({ 
        compatibility_result: compatibilityResult,
        model: data.model,
        usage: data.usage,
        generated_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error generating compatibility match:', error);
    
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