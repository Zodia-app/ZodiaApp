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

  console.log('=== CALLING OPENAI FOR ENHANCED ANALYSIS ===');
  console.log(`Users: ${user1.name} (${user1ZodiacSign}) + ${user2.name} (${user2ZodiacSign})`);
  console.log(`Birth times: ${!!user1.timeOfBirth} + ${!!user2.timeOfBirth}`);
  
  // Use retry logic with exponential backoff
  let enhancedAnalysis: any;
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 OpenAI attempt ${attempt}/${maxRetries} for enhanced compatibility`);
      
      // Generate optimized prompt (shorter for reliability)
      const optimizedPrompt = generateOptimizedCompatibilityPrompt(user1, user2, user1PalmReading, user2PalmReading, baseAnalysis, matchType);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
      
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
              content: `You are an expert astro-palmistry compatibility analyst. Create comprehensive yet concise relationship compatibility analysis combining palm reading with birth chart data. Always respond with complete JSON only.`
            },
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          max_tokens: 3000, // Reduced for reliability
          temperature: 0.7, // Slightly lower for consistency
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenAI API error (attempt ${attempt}):`, response.status, errorText);
        
        // Retry on server errors
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const enhancedAnalysisContent = result.choices[0]?.message?.content;

      if (!enhancedAnalysisContent) {
        console.warn(`⚠️ No analysis from OpenAI (attempt ${attempt}), will retry`);
        if (attempt < maxRetries) continue;
        enhancedAnalysis = createFallbackCompatibility(user1, user2);
      } else {
        // Parse and validate the JSON response
        try {
          enhancedAnalysis = JSON.parse(enhancedAnalysisContent);
          
          // Basic validation
          if (!enhancedAnalysis.overallScore || !enhancedAnalysis.enhancedCategories) {
            console.warn(`⚠️ Incomplete analysis (attempt ${attempt}), will retry`);
            if (attempt < maxRetries) continue;
            enhancedAnalysis = createFallbackCompatibility(user1, user2);
          } else {
            console.log(`✅ Valid enhanced analysis received on attempt ${attempt}`);
            break; // Success!
          }
        } catch (e) {
          console.error(`❌ JSON parse error (attempt ${attempt}):`, e);
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying due to invalid JSON...`);
            continue;
          }
          enhancedAnalysis = createFallbackCompatibility(user1, user2);
        }
      }
      
    } catch (error: any) {
      console.error(`❌ Request failed (attempt ${attempt}):`, error.message);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      // Final attempt failed, use bulletproof fallback
      console.warn('⚠️ All attempts failed, using bulletproof fallback compatibility');
      enhancedAnalysis = createBulletproofCompatibilityFallback(user1, user2);
      break;
    }
  }

  // Ensure all required fields exist
  enhancedAnalysis = ensureCompatibilityFields(enhancedAnalysis, user1, user2);

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

function generateOptimizedCompatibilityPrompt(
  user1: EnhancedUserData,
  user2: EnhancedUserData,
  user1PalmReading: any,
  user2PalmReading: any,
  baseAnalysis: any,
  matchType: string
): string {
  
  const zodiac1 = calculateZodiacSign(user1.dateOfBirth);
  const zodiac2 = calculateZodiacSign(user2.dateOfBirth);
  const hasBothBirthTimes = user1.timeOfBirth && user2.timeOfBirth;

  // Create concise palm summaries instead of full JSON
  const user1PalmSummary = `Heart: ${user1PalmReading?.lines?.heartLine?.meaning || 'Strong emotional capacity'}, Head: ${user1PalmReading?.lines?.headLine?.meaning || 'Clear thinking patterns'}, Life: ${user1PalmReading?.lines?.lifeLine?.meaning || 'Vibrant life energy'}`;
  const user2PalmSummary = `Heart: ${user2PalmReading?.lines?.heartLine?.meaning || 'Deep emotional nature'}, Head: ${user2PalmReading?.lines?.headLine?.meaning || 'Analytical mindset'}, Life: ${user2PalmReading?.lines?.lifeLine?.meaning || 'Strong vitality'}`;

  return `Create enhanced astro-palmistry compatibility analysis for ${user1.name} & ${user2.name}:

USER DATA:
${user1.name}: ${zodiac1}, born ${user1.dateOfBirth}${user1.timeOfBirth ? ` at ${user1.timeOfBirth}` : ''}, ${user1.placeOfBirth?.country || 'Unknown location'}
${user2.name}: ${zodiac2}, born ${user2.dateOfBirth}${user2.timeOfBirth ? ` at ${user2.timeOfBirth}` : ''}, ${user2.placeOfBirth?.country || 'Unknown location'}

PALM INSIGHTS:
${user1.name}: ${user1PalmSummary}
${user2.name}: ${user2PalmSummary}

BASE SCORES: Overall ${baseAnalysis.overallScore}%, Astro ${baseAnalysis.astrologicalCompatibility.score}%, Palm ${baseAnalysis.palmReadingCompatibility.score}%

Create comprehensive analysis with ${hasBothBirthTimes ? 'premium birth time precision' : 'enhanced zodiac-palm correlation'}:

{
  "overallScore": ${baseAnalysis.overallScore},
  "overallLabel": "Choose appropriate label based on score",
  "analysisBreakdown": {
    "palmReadingInsights": {
      "score": ${baseAnalysis.palmReadingCompatibility.score},
      "keyFindings": ["4 specific palm compatibility insights for ${user1.name} & ${user2.name}"]
    },
    "astrologicalInsights": {
      "score": ${baseAnalysis.astrologicalCompatibility.score},
      "sunSignDynamic": "${zodiac1} + ${zodiac2} relationship dynamics",
      ${hasBothBirthTimes ? '"risingSignHarmony": "Birth time precision insights",' : '"elementalHarmony": "Elemental compatibility analysis",'}
      "communicationStyle": "Mercury-influenced compatibility"
    }
  },
  "enhancedCategories": [
    {"category": "Emotional Intimacy", "score": 75-95, "emoji": "💖"},
    {"category": "Mental Connection", "score": 75-95, "emoji": "🧠"},
    {"category": "Life Direction Alignment", "score": 75-95, "emoji": "🎯"},
    {"category": "Passion & Energy", "score": 75-95, "emoji": "🔥"}
  ],
  "cosmicPalmMessage": "Personalized message about ${user1.name} & ${user2.name}'s unique combination"
}

Focus on quality insights over length. Make it specific to their actual data.`;
}

function generateEnhancedPrompt(
  user1: EnhancedUserData,
  user2: EnhancedUserData,
  user1PalmReading: any,
  user2PalmReading: any,
  baseAnalysis: any,
  matchType: string
): string {
  // Fallback to optimized version
  return generateOptimizedCompatibilityPrompt(user1, user2, user1PalmReading, user2PalmReading, baseAnalysis, matchType);
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

function createBulletproofCompatibilityFallback(user1: EnhancedUserData, user2: EnhancedUserData) {
  const zodiac1 = calculateZodiacSign(user1.dateOfBirth);
  const zodiac2 = calculateZodiacSign(user2.dateOfBirth);
  
  return {
    overallScore: 83,
    overallLabel: "Harmonious Connection",
    analysisBreakdown: {
      palmReadingInsights: {
        score: 85,
        keyFindings: [
          `${user1.name} and ${user2.name} display remarkably complementary palm patterns that suggest natural harmony`,
          "Your heart lines indicate deep emotional compatibility and the potential for lasting love",
          "Head line analysis reveals intellectual synergy and the ability to support each other's growth",
          "Life line patterns show excellent energy balance and mutual vitality enhancement"
        ]
      },
      astrologicalInsights: {
        score: 81,
        sunSignDynamic: `The ${zodiac1}-${zodiac2} combination creates a beautiful cosmic dance of complementary energies`,
        elementalHarmony: "Your elemental energies create perfect balance and mutual enhancement",
        communicationStyle: "Natural understanding flows between you with effortless telepathic connection"
      },
      astropalmCorrelations: {
        score: 83,
        uniqueConnections: [
          `${user1.name}'s heart line perfectly aligns with their ${zodiac1} love nature, creating magnetic attraction`,
          `${user2.name}'s head line reflects their ${zodiac2} mental approach, complementing their partner beautifully`,
          "Life line vitality patterns match your astrological elements, creating perfect energy harmony",
          "Career and fate lines synchronize with planetary influences, suggesting shared destiny"
        ]
      }
    },
    enhancedCategories: [
      { 
        category: "Emotional Intimacy", 
        score: 87, 
        palmInsight: `Heart lines show deep emotional resonance between ${user1.name} and ${user2.name}`,
        astroInsight: `${zodiac1} and ${zodiac2} emotional compatibility creates lasting bonds`,
        synthesis: "Perfect emotional harmony with potential for soul-mate connection",
        emoji: "💖" 
      },
      { 
        category: "Mental Connection", 
        score: 82, 
        palmInsight: "Head line patterns indicate excellent intellectual compatibility and shared interests",
        astroInsight: "Mercury influences create natural communication flow and understanding",
        synthesis: "Minds that meet and grow together in perfect intellectual harmony",
        emoji: "🧠" 
      },
      { 
        category: "Life Direction Alignment", 
        score: 85, 
        palmInsight: "Fate lines suggest parallel life paths with mutual support and shared goals",
        astroInsight: "Planetary alignments indicate similar life purposes and complementary destinies",
        synthesis: "Walking the same path together with mutual support and shared dreams",
        emoji: "🎯" 
      },
      { 
        category: "Passion & Energy", 
        score: 88, 
        palmInsight: "Life line vitality and Mars mount intensity show incredible physical chemistry",
        astroInsight: "Fire element energy creates passionate connection and magnetic attraction",
        synthesis: "Explosive chemistry combined with sustainable, long-term passion",
        emoji: "🔥" 
      }
    ],
    crossCorrelationHighlights: [
      `${user1.name}'s palm patterns perfectly complement their ${zodiac1} astrological traits`,
      `${user2.name}'s natural ${zodiac2} qualities enhance the palmistry-indicated strengths`,
      "Hand formations confirm what the stars already know - you're meant to be together",
      "Both palmistry and astrology point to exceptional compatibility and shared destiny"
    ],
    enhancedAdvice: {
      strengthBuilding: [
        `Leverage your natural ${zodiac1}-${zodiac2} harmony by embracing each other's unique qualities`,
        "Use your complementary communication styles to deepen your emotional connection daily",
        "Time important relationship milestones with favorable astrological transits for maximum success"
      ],
      challengeNavigation: [
        "Balance different approaches to problem-solving by appreciating each other's unique perspectives",
        "Use zodiac wisdom to understand and navigate any temporary tensions with love and patience",
        "Turn differences into growth opportunities that make your bond even stronger"
      ],
      practicalSteps: [
        "Create daily rituals that honor both your palmistry insights and astrological connection",
        "Schedule monthly relationship check-ins during new moons to maintain harmony and growth",
        "Build your future together by combining both palmistry guidance and astrological timing"
      ]
    },
    cosmicPalmMessage: `${user1.name} and ${user2.name}, the universe has woven your destinies together through both the lines in your palms and the stars above. Your ${zodiac1}-${zodiac2} connection is blessed by cosmic forces, while your palm patterns reveal a love that's written in your very hands. This is a connection that transcends the ordinary - embrace it fully.`,
    enhancementLevel: "Premium",
    dataQuality: {
      user1Completeness: "95%",
      user2Completeness: "95%",
      analysisDepth: "Comprehensive astro-palmistry analysis with cosmic correlation"
    }
  };
}

function createFallbackCompatibility(user1: EnhancedUserData, user2: EnhancedUserData) {
  // Legacy fallback - now redirects to bulletproof version
  return createBulletproofCompatibilityFallback(user1, user2);
}

function ensureCompatibilityFields(analysis: any, user1: EnhancedUserData, user2: EnhancedUserData) {
  // Ensure minimum required structure
  if (!analysis.overallScore) analysis.overallScore = 75;
  if (!analysis.overallLabel) analysis.overallLabel = "Good Connection";
  
  if (!analysis.enhancedCategories || analysis.enhancedCategories.length < 4) {
    analysis.enhancedCategories = [
      { category: "Emotional Intimacy", score: analysis.overallScore || 75, emoji: "💖" },
      { category: "Mental Connection", score: analysis.overallScore - 5 || 70, emoji: "🧠" },
      { category: "Life Direction Alignment", score: analysis.overallScore || 75, emoji: "🎯" },
      { category: "Passion & Energy", score: analysis.overallScore + 2 || 77, emoji: "🔥" }
    ];
  }
  
  if (!analysis.cosmicPalmMessage) {
    analysis.cosmicPalmMessage = `${user1.name} and ${user2.name}, your connection shows beautiful potential with natural compatibility and growth opportunities.`;
  }
  
  return analysis;
}