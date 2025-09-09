// Enhanced Compatibility Analysis Edge Function
// Integrates palm reading with astrological birth data including optional birth time

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancedUserData {
  id?: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth?: string; // HH:MM format (24-hour) - OPTIONAL
  zodiacSign?: string;
  age?: number;
  placeOfBirth?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  relationshipStatus?: string;
}

interface RequestBody {
  userReading: {
    userData: EnhancedUserData;
    analysis: any; // Palm reading analysis
  };
  partnerReading?: {
    userData: EnhancedUserData;
    analysis: any; // Palm reading analysis
  };
  friendData?: EnhancedUserData; // For Friend Mode
  directMode?: boolean;
  matchType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json() as RequestBody;
    console.log('=== ENHANCED COMPATIBILITY ANALYSIS ===');
    
    const { userReading, partnerReading, friendData, directMode = false, matchType = 'friend' } = requestBody;

    let partnerData: any;
    let partnerPalmData: any;
    let partnerUserData: EnhancedUserData;

    if (directMode && (partnerReading || friendData)) {
      // Friend Mode - direct compatibility with both readings provided
      console.log('Using Friend Mode - enhanced astro-palm analysis');
      
      if (partnerReading) {
        partnerUserData = partnerReading.userData;
        partnerPalmData = partnerReading.analysis;
      } else if (friendData) {
        // Friend data without palm reading - create basic analysis
        partnerUserData = friendData;
        partnerPalmData = createBasicPalmAnalysisForFriend(friendData);
      }
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Enhanced compatibility requires directMode=true with partner data',
          code: 'INVALID_REQUEST'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('User data available:', !!userReading.userData);
    console.log('Partner data available:', !!partnerUserData);
    console.log('User birth time:', !!userReading.userData.timeOfBirth);
    console.log('Partner birth time:', !!partnerUserData!.timeOfBirth);

    // Generate enhanced compatibility analysis with AI
    const enhancedCompatibility = await generateEnhancedCompatibilityWithAI(
      userReading.userData,
      partnerUserData!,
      userReading.analysis,
      partnerPalmData,
      matchType
    );

    console.log('Enhanced compatibility analysis generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: enhancedCompatibility,
        enhancementLevel: getEnhancementLevel(userReading.userData, partnerUserData!),
        partnerName: partnerUserData!.name,
        analysisType: 'enhanced_astro_palm_compatibility'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in enhanced compatibility analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        code: 'INTERNAL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateEnhancedCompatibilityWithAI(
  user1: EnhancedUserData,
  user2: EnhancedUserData,
  user1PalmReading: any,
  user2PalmReading: any,
  matchType: string
): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Calculate zodiac signs
  const user1ZodiacSign = user1.zodiacSign || calculateZodiacSign(user1.dateOfBirth);
  const user2ZodiacSign = user2.zodiacSign || calculateZodiacSign(user2.dateOfBirth);

  // Calculate base compatibility scores
  const baseAnalysis = calculateBaseCompatibility(user1, user2, user1PalmReading, user2PalmReading);

  // Generate enhanced prompt
  const enhancedPrompt = generateEnhancedPrompt(user1, user2, user1PalmReading, user2PalmReading, baseAnalysis, matchType);

  console.log('=== CALLING OPENAI FOR ENHANCED ANALYSIS ===');
  console.log(`Users: ${user1.name} (${user1ZodiacSign}) + ${user2.name} (${user2ZodiacSign})`);
  console.log(`Birth times: ${!!user1.timeOfBirth} + ${!!user2.timeOfBirth}`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system', 
            content: `You are an expert astro-palmistry compatibility analyst for a viral mobile app 💅 You combine traditional palmistry with astrological birth chart analysis to create the most comprehensive relationship compatibility readings. This is for entertainment purposes - think cosmic relationship coach meets palm reading bestie! Always respond with complete JSON for the mobile app.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const enhancedAnalysisContent = result.choices[0]?.message?.content;

    if (!enhancedAnalysisContent) {
      throw new Error('No enhanced analysis generated');
    }

    // Parse and validate the JSON response
    let enhancedAnalysis;
    try {
      enhancedAnalysis = JSON.parse(enhancedAnalysisContent);
    } catch (e) {
      console.error('Failed to parse enhanced analysis as JSON:', e);
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Add metadata
    enhancedAnalysis.generatedAt = new Date().toISOString();
    enhancedAnalysis.model = 'gpt-4o';
    enhancedAnalysis.analysisType = 'enhanced_astro_palm_compatibility';
    enhancedAnalysis.users = {
      user1: { name: user1.name, zodiacSign: user1ZodiacSign, hasBirthTime: !!user1.timeOfBirth },
      user2: { name: user2.name, zodiacSign: user2ZodiacSign, hasBirthTime: !!user2.timeOfBirth }
    };
    enhancedAnalysis.enhancementLevel = getEnhancementLevel(user1, user2);

    return enhancedAnalysis;

  } catch (error) {
    console.error('Error generating enhanced AI compatibility:', error);
    throw error;
  }
}

function calculateZodiacSign(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  
  return 'Unknown';
}

function calculateBaseCompatibility(user1: EnhancedUserData, user2: EnhancedUserData, palmReading1: any, palmReading2: any) {
  // Simplified base compatibility calculation
  const zodiac1 = calculateZodiacSign(user1.dateOfBirth);
  const zodiac2 = calculateZodiacSign(user2.dateOfBirth);
  
  // Basic zodiac compatibility (simplified)
  const zodiacScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const palmScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const correlationScore = Math.floor(Math.random() * 20) + 75; // 75-95
  
  const overallScore = Math.round((zodiacScore * 0.4) + (palmScore * 0.4) + (correlationScore * 0.2));
  
  return {
    overallScore,
    astrologicalCompatibility: { score: zodiacScore },
    palmReadingCompatibility: { score: palmScore },
    palmAstroCorrelations: { 
      score: correlationScore,
      correlations: [
        'Heart line patterns align with Venus influences',
        'Head line characteristics match Mercury communication styles',
        'Life line vitality reflects elemental energy compatibility'
      ]
    }
  };
}

function generateEnhancedPrompt(
  user1: EnhancedUserData,
  user2: EnhancedUserData,
  user1PalmReading: any,
  user2PalmReading: any,
  baseAnalysis: any,
  matchType: string
): string {
  
  const user1TimeInfo = user1.timeOfBirth ? 
    `born at ${user1.timeOfBirth} (enables rising sign & house analysis)` : 
    'birth time not provided (sun sign analysis only)';
    
  const user2TimeInfo = user2.timeOfBirth ? 
    `born at ${user2.timeOfBirth} (enables rising sign & house analysis)` : 
    'birth time not provided (sun sign analysis only)';

  const zodiac1 = calculateZodiacSign(user1.dateOfBirth);
  const zodiac2 = calculateZodiacSign(user2.dateOfBirth);

  return `Create the most ICONIC astro-palmistry compatibility analysis ever! 💅⭐🤲 This is revolutionary - combining palm reading with birth chart analysis!

USER 1 - ${user1.name}:
🎂 Born: ${user1.dateOfBirth} (${user1TimeInfo})
⭐ Zodiac: ${zodiac1}
📍 Location: ${user1.placeOfBirth?.city || 'Unknown'}, ${user1.placeOfBirth?.country || 'Unknown'}

PALM ANALYSIS FOR ${user1.name.toUpperCase()}:
${JSON.stringify(user1PalmReading, null, 2)}

USER 2 - ${user2.name}:
🎂 Born: ${user2.dateOfBirth} (${user2TimeInfo})
⭐ Zodiac: ${zodiac2}
📍 Location: ${user2.placeOfBirth?.city || 'Unknown'}, ${user2.placeOfBirth?.country || 'Unknown'}

PALM ANALYSIS FOR ${user2.name.toUpperCase()}:
${JSON.stringify(user2PalmReading, null, 2)}

BASE COMPATIBILITY CALCULATIONS:
🌟 Overall: ${baseAnalysis.overallScore}%
🔮 Astro: ${baseAnalysis.astrologicalCompatibility.score}%
🤲 Palm: ${baseAnalysis.palmReadingCompatibility.score}%
✨ Correlation: ${baseAnalysis.palmAstroCorrelations.score}%

${user1.timeOfBirth && user2.timeOfBirth ? `
🕐 PREMIUM ANALYSIS MODE:
Both birth times available - include rising signs, moon signs, houses, and precise planetary aspects!
` : `
⭐ ENHANCED ANALYSIS MODE:
Sun sign compatibility enhanced by detailed palm reading cross-correlations.
`}

Return ONLY this JSON structure:

{
  "overallScore": ${baseAnalysis.overallScore},
  "overallLabel": "<Cosmic Soulmates/Divine Connection/Beautiful Harmony/Perfect Balance>",
  "analysisBreakdown": {
    "palmReadingInsights": {
      "score": ${baseAnalysis.palmReadingCompatibility.score},
      "keyFindings": [
        "Heart line compatibility specific to ${user1.name} & ${user2.name}",
        "Head line intellectual harmony analysis",
        "Life line energy synchronization",
        "Mount prominence compatibility patterns"
      ]
    },
    "astrologicalInsights": {
      "score": ${baseAnalysis.astrologicalCompatibility.score},
      "sunSignDynamic": "${zodiac1} + ${zodiac2} relationship dynamics",
      ${user1.timeOfBirth && user2.timeOfBirth ? `
      "risingSignHarmony": "First impression and daily interaction compatibility",
      "moonSignConnection": "Emotional needs and nurturing style alignment",
      "venusCompatibility": "Love language and romantic expression harmony",
      "marsInteraction": "Passion dynamics and conflict resolution styles",` : `
      "elementalHarmony": "Fire/Earth/Air/Water elemental compatibility",
      "modalityBalance": "Cardinal/Fixed/Mutable energy interaction",`}
      "communicationStyle": "Mercury-influenced conversation and mental compatibility"
    },
    "astropalmCorrelations": {
      "score": ${baseAnalysis.palmAstroCorrelations.score},
      "uniqueConnections": [
        "How ${user1.name}'s heart line reflects their ${zodiac1} love nature",
        "How ${user2.name}'s head line aligns with ${zodiac2} mental approach",
        "Life line vitality patterns matching astrological element energy",
        "Career line synchronization with planetary career indicators"
      ]
    }
  },
  "enhancedCategories": [
    {
      "category": "Emotional Intimacy",
      "score": <75-100>,
      "palmInsight": "Heart line analysis for ${user1.name} & ${user2.name}",
      "astroInsight": "${user1.timeOfBirth && user2.timeOfBirth ? 'Moon sign emotional compatibility' : 'Water sign emotional resonance analysis'}",
      "synthesis": "Combined emotional compatibility assessment",
      "emoji": "💖"
    },
    {
      "category": "Mental Connection",
      "score": <75-100>,
      "palmInsight": "Head line intellectual compatibility patterns",
      "astroInsight": "Mercury communication and air sign mental harmony",
      "synthesis": "Thought process and communication alignment",
      "emoji": "🧠"
    },
    {
      "category": "Life Direction Alignment",
      "score": <75-100>,
      "palmInsight": "Fate line and career mount compatibility",
      "astroInsight": "${user1.timeOfBirth && user2.timeOfBirth ? 'Midheaven and 10th house career alignment' : 'Earth sign practical goal compatibility'}",
      "synthesis": "Shared life path and mutual support potential",
      "emoji": "🎯"
    },
    {
      "category": "Passion & Energy",
      "score": <75-100>,
      "palmInsight": "Life line vitality and Mars mount intensity",
      "astroInsight": "Mars placement passion compatibility and fire element energy",
      "synthesis": "Physical chemistry and energy matching",
      "emoji": "🔥"
    }
  ],
  "crossCorrelationHighlights": [
    "Specific palm-astro correlation unique to ${user1.name} & ${user2.name}",
    "How their zodiac traits enhance palm-indicated strengths",
    "Palm patterns that confirm astrological compatibility indicators",
    "${user1.timeOfBirth && user2.timeOfBirth ? 'Birth time precision reveals hidden compatibility layers' : 'Sun sign analysis enriched by detailed palm correlations'}"
  ],
  "enhancedAdvice": {
    "strengthBuilding": [
      "Leverage ${zodiac1}-${zodiac2} natural harmony in specific ways",
      "Use palm-indicated communication styles for deeper connection",
      "Timing relationship milestones with astrological influences"
    ],
    "challengeNavigation": [
      "How to balance different palm-indicated approaches to conflict",
      "Using zodiac understanding to navigate relationship tensions",
      "${user1.timeOfBirth && user2.timeOfBirth ? 'Rising sign differences and how to bridge them' : 'Elemental differences as growth opportunities'}"
    ],
    "practicalSteps": [
      "Daily relationship practices based on both palm and astro insights",
      "Monthly check-ins aligned with lunar cycles and palm energy patterns",
      "Long-term relationship growth leveraging both analysis systems"
    ]
  },
  "cosmicPalmMessage": "Epic personalized message about ${user1.name} & ${user2.name}'s unique astro-palm combination",
  "enhancementLevel": "${user1.timeOfBirth && user2.timeOfBirth ? 'Premium' : 'Enhanced'}",
  "dataQuality": {
    "user1Completeness": "${user1.timeOfBirth ? '95' : '75'}%",
    "user2Completeness": "${user2.timeOfBirth ? '95' : '75'}%",
    "analysisDepth": "${user1.timeOfBirth && user2.timeOfBirth ? 'Full birth chart + detailed palmistry' : 'Sun sign astrology + comprehensive palmistry'}"
  }
}

Make this the most comprehensive relationship analysis ever - specific to ${user1.name} & ${user2.name}'s actual data! 💅⭐🤲`;
}

function getEnhancementLevel(user1: EnhancedUserData, user2: EnhancedUserData) {
  let score = 30; // Base level
  
  if (user1.timeOfBirth && user2.timeOfBirth) score += 40;
  if (user1.placeOfBirth?.city && user2.placeOfBirth?.city) score += 20;
  if (user1.placeOfBirth?.latitude && user2.placeOfBirth?.latitude) score += 10;
  
  return {
    level: score >= 80 ? 'premium' : score >= 60 ? 'enhanced' : 'basic',
    percentage: score,
    features: score >= 80 ? 
      'Complete birth chart analysis + detailed palmistry correlation' :
      score >= 60 ? 
      'Enhanced zodiac compatibility + comprehensive palm reading' :
      'Basic compatibility with palm reading enhancement'
  };
}

function createBasicPalmAnalysisForFriend(friendData: EnhancedUserData) {
  // Create a basic palm analysis structure for friends without palm readings
  return {
    greeting: `Basic compatibility analysis for ${friendData.name}`,
    overallPersonality: `${friendData.name} shows ${friendData.zodiacSign || calculateZodiacSign(friendData.dateOfBirth)} characteristics`,
    lines: {
      lifeLine: { name: 'Life Line', description: 'Basic analysis', meaning: 'General vitality' },
      heartLine: { name: 'Heart Line', description: 'Basic emotional analysis', meaning: 'Relationship approach' }
    },
    mounts: {
      venus: { name: 'Venus Mount', prominence: 'Moderate', meaning: 'Love nature' }
    }
  };
}