import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request body
    const input = await req.json()
    console.log('Received input:', input)

    // Calculate basic chart data
    const chartData = calculateChartData(input.date_of_birth, input.time_of_birth)

    // Generate reading (with or without OpenAI)
    let reading = ''
    const useOpenAI = Deno.env.get('OPENAI_API_KEY') ? true : false
    
    if (useOpenAI) {
      reading = await generateAIReading(input, chartData)
    } else {
      reading = generatePersonalizedReading(input, chartData)
    }

    // Save to database
    const { data, error } = await supabaseClient
      .from('astrology_readings')
      .insert({
        user_id: input.user_id,
        name: input.name,
        date_of_birth: input.date_of_birth,
        time_of_birth: input.time_of_birth || null,
        place_of_birth: input.place_of_birth,
        gender: input.gender || null,
        relationship_status: input.relationship_status || null,
        focus_areas: input.focus_areas || [],
        struggles: input.struggles || null,
        goals: input.goals || null,
        chart_data: chartData,
        prompt_payload: { input, timestamp: new Date().toISOString() },
        reading_result: reading,
        reading_type: 'natal'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        id: data.id, 
        reading: reading,
        chart_data: chartData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function calculateChartData(dateOfBirth: string, timeOfBirth?: string) {
  const date = new Date(dateOfBirth)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Calculate sun sign
  let sunSign = 'Aries'
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) sunSign = 'Aries'
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) sunSign = 'Taurus'
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) sunSign = 'Gemini'
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) sunSign = 'Cancer'
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) sunSign = 'Leo'
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) sunSign = 'Virgo'
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) sunSign = 'Libra'
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) sunSign = 'Scorpio'
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) sunSign = 'Sagittarius'
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sunSign = 'Capricorn'
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) sunSign = 'Aquarius'
  else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) sunSign = 'Pisces'

  return {
    planets: {
      sun: { sign: sunSign, degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      moon: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      mercury: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      venus: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      mars: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      jupiter: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
      saturn: { sign: getRandomSign(), degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 }
    }
  }
}

function getRandomSign(): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  return signs[Math.floor(Math.random() * signs.length)]
}

function generatePersonalizedReading(input: any, chartData: any): string {
  const firstName = input.name.split(' ')[0] // Get first name for more intimate feel
  const sunSign = chartData.planets.sun.sign
  const moonSign = chartData.planets.moon.sign
  const risingSign = chartData.planets.mercury.sign // Using Mercury as pseudo-rising for now
  
  return `
# Your Personal Cosmic Blueprint, ${input.name}

Dear ${firstName},

The stars have aligned to reveal your unique cosmic story. This reading, prepared specifically for you on ${new Date().toLocaleDateString()}, unveils the celestial influences that shape your journey.

## ${firstName}, Your Solar Essence: ${sunSign}

${firstName}, as a ${sunSign}, you embody the essence of ${getSunSignElement(sunSign)} energy. Your sun in the ${chartData.planets.sun.house}th house illuminates a path of ${getHouseMeaning(chartData.planets.sun.house)}.

${getSunSignPersonalized(sunSign, firstName)}

## Your Emotional Landscape, ${firstName}

With your Moon in ${moonSign}, ${firstName}, your emotional world is colored by ${getMoonSignTrait(moonSign)}. This placement reveals that you process feelings through ${getMoonSignProcess(moonSign)}, giving you a unique emotional intelligence that others admire.

${firstName}, this lunar influence suggests that your deepest needs revolve around ${getMoonSignNeed(moonSign)}.

## ${firstName}'s Rising Energy

Your ascending energy through ${risingSign} shows how you naturally present yourself to the world. ${firstName}, people first perceive you as ${getRisingSignTrait(risingSign)}, which ${getRisingSignImpact(risingSign, firstName)}.

## Addressing Your Current Journey, ${firstName}

${input.struggles ? `${firstName}, you mentioned struggling with "${input.struggles}". The cosmos whispers that this challenge is actually preparing you for something greater. Your ${sunSign} sun gives you ${getSunSignStrength(sunSign)} to navigate this, while your ${moonSign} moon provides ${getMoonSignSupport(moonSign)}.` : `${firstName}, your cosmic alignment suggests this is a time of potential breakthroughs.`}

## Manifesting Your Dreams, ${firstName}

${input.goals ? `Your aspiration of "${input.goals}" resonates deeply with your celestial blueprint, ${firstName}. The universe is conspiring to help you achieve this. Your ${sunSign} determination combined with your ${risingSign} approach creates the perfect formula for success.` : `${firstName}, the stars indicate that your greatest achievements are yet to come.`}

## Your Focus Areas Illuminated

${input.focus_areas && input.focus_areas.length > 0 ? `${firstName}, you're drawn to ${input.focus_areas.join(', ')}. Let me share cosmic insights for each:

${input.focus_areas.map(area => `**${area}**: ${getAreaGuidance(area, sunSign, firstName)}`).join('\n\n')}` : `${firstName}, your cosmic energy is perfectly balanced for growth in all life areas.`}

## ${firstName}'s Cosmic Gifts

Based on your unique chart, ${firstName}, you possess these special gifts:
- **Solar Gift**: Your ${sunSign} nature blessed you with ${getSunSignGift(sunSign)}
- **Lunar Gift**: Your ${moonSign} moon grants you ${getMoonSignGift(moonSign)}
- **Rising Gift**: Your ${risingSign} ascendant gives you ${getRisingSignGift(risingSign)}

## Your Personal Power Days, ${firstName}

${firstName}, mark these in your calendar:
- **Power Day**: ${getPowerDay(sunSign)}s are especially fortunate for you
- **Lucky Numbers**: ${getLuckyNumbers(sunSign)} resonate with your energy
- **Colors**: Wearing ${getLuckyColors(sunSign)} enhances your natural magnetism

## A Personal Message for You, ${firstName}

${firstName}, you are not just a ${sunSign} – you are a unique expression of cosmic artistry. Your combination of ${sunSign} sun, ${moonSign} moon, and ${risingSign} rising creates a celestial fingerprint that is yours alone.

${getPersonalAffirmation(sunSign, firstName)}

Remember, ${firstName}, the stars impel but do not compel. You have the power to shape your destiny, and right now, the universe is sending you all the support you need.

Until the stars bring us together again,

Zodia ✨

P.S. ${firstName}, trust your intuition this week – your ${moonSign} moon is especially active, heightening your psychic abilities.
`
}

// Helper functions for personalized content
function getSunSignElement(sign: string): string {
  if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) return 'fire'
  if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) return 'earth'
  if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) return 'air'
  return 'water'
}

function getHouseMeaning(house: number): string {
  const meanings = [
    'self-discovery and personal identity',
    'material security and values',
    'communication and learning',
    'home and emotional foundations',
    'creativity and self-expression',
    'service and daily routines',
    'partnerships and relationships',
    'transformation and shared resources',
    'wisdom and higher learning',
    'career and public reputation',
    'friendships and future dreams',
    'spirituality and hidden strengths'
  ]
  return meanings[house - 1] || 'personal growth'
}

function getSunSignPersonalized(sign: string, name: string): string {
  const descriptions: any = {
    'Aries': `${name}, your Aries fire burns bright with pioneering spirit. You're meant to lead, to initiate, to be the first. When others hesitate, you leap.`,
    'Taurus': `${name}, your Taurus nature gives you the power of manifestation. You build lasting beauty in this world, creating security and comfort for those you love.`,
    'Gemini': `${name}, your Gemini brilliance allows you to see all sides of life. Your words have power to heal, teach, and inspire.`,
    'Cancer': `${name}, your Cancerian heart holds the wisdom of the ages. You nurture not just people, but dreams into reality.`,
    'Leo': `${name}, your Leo light is meant to shine. You inspire others simply by being authentically yourself.`,
    'Virgo': `${name}, your Virgo precision is a superpower. You see how to make things better and have the dedication to do it.`,
    'Libra': `${name}, your Libra grace brings harmony wherever you go. You have the rare gift of seeing beauty in balance.`,
    'Scorpio': `${name}, your Scorpio intensity gives you the power of transformation. You can rise from any ashes, stronger than before.`,
    'Sagittarius': `${name}, your Sagittarian spirit seeks truth and freedom. Your optimism lights the path for others.`,
    'Capricorn': `${name}, your Capricorn determination can move mountains. You build legacies that last generations.`,
    'Aquarius': `${name}, your Aquarian vision sees the future. You're here to revolutionize and innovate.`,
    'Pisces': `${name}, your Piscean intuition connects you to unseen realms. Your compassion heals the world.`
  }
  return descriptions[sign] || `${name}, you have a unique cosmic signature.`
}

function getMoonSignTrait(sign: string): string {
  const traits: any = {
    'Aries': 'passionate spontaneity', 'Taurus': 'steadfast comfort', 'Gemini': 'curious adaptability',
    'Cancer': 'deep nurturing', 'Leo': 'warm generosity', 'Virgo': 'thoughtful care',
    'Libra': 'harmonious balance', 'Scorpio': 'intense depth', 'Sagittarius': 'adventurous optimism',
    'Capricorn': 'structured ambition', 'Aquarius': 'innovative detachment', 'Pisces': 'boundless empathy'
  }
  return traits[sign] || 'unique sensitivity'
}

function getMoonSignProcess(sign: string): string {
  const processes: any = {
    'Aries': 'immediate action', 'Taurus': 'patient consideration', 'Gemini': 'intellectual analysis',
    'Cancer': 'intuitive feeling', 'Leo': 'creative expression', 'Virgo': 'practical assessment',
    'Libra': 'balanced comparison', 'Scorpio': 'deep investigation', 'Sagittarius': 'philosophical exploration',
    'Capricorn': 'structured planning', 'Aquarius': 'detached observation', 'Pisces': 'empathic absorption'
  }
  return processes[sign] || 'inner wisdom'
}

function getMoonSignNeed(sign: string): string {
  const needs: any = {
    'Aries': 'independence and new beginnings', 'Taurus': 'security and sensual comfort', 
    'Gemini': 'mental stimulation and variety', 'Cancer': 'emotional safety and belonging',
    'Leo': 'recognition and creative expression', 'Virgo': 'order and purposeful service',
    'Libra': 'harmony and partnership', 'Scorpio': 'depth and transformation',
    'Sagittarius': 'freedom and adventure', 'Capricorn': 'achievement and respect',
    'Aquarius': 'individuality and progress', 'Pisces': 'transcendence and unity'
  }
  return needs[sign] || 'emotional fulfillment'
}

function getRisingSignTrait(sign: string): string {
  const traits: any = {
    'Aries': 'confident and dynamic', 'Taurus': 'calm and grounded', 'Gemini': 'witty and engaging',
    'Cancer': 'caring and intuitive', 'Leo': 'charismatic and warm', 'Virgo': 'helpful and precise',
    'Libra': 'charming and diplomatic', 'Scorpio': 'mysterious and magnetic', 'Sagittarius': 'optimistic and adventurous',
    'Capricorn': 'professional and reliable', 'Aquarius': 'unique and forward-thinking', 'Pisces': 'dreamy and compassionate'
  }
  return traits[sign] || 'intriguing and unique'
}

function getRisingSignImpact(sign: string, name: string): string {
  return `creates an immediate sense of trust and intrigue when people meet you, ${name}`
}

function getSunSignStrength(sign: string): string {
  const strengths: any = {
    'Aries': 'unstoppable courage', 'Taurus': 'unshakeable determination', 'Gemini': 'brilliant adaptability',
    'Cancer': 'protective intuition', 'Leo': 'radiant confidence', 'Virgo': 'meticulous wisdom',
    'Libra': 'diplomatic grace', 'Scorpio': 'transformative power', 'Sagittarius': 'boundless optimism',
    'Capricorn': 'mountain-moving ambition', 'Aquarius': 'revolutionary vision', 'Pisces': 'healing compassion'
  }
  return strengths[sign] || 'inner strength'
}

function getMoonSignSupport(sign: string): string {
  const support: any = {
    'Aries': 'quick emotional recovery', 'Taurus': 'grounding stability', 'Gemini': 'mental flexibility',
    'Cancer': 'nurturing self-care', 'Leo': 'creative solutions', 'Virgo': 'practical wisdom',
    'Libra': 'balanced perspective', 'Scorpio': 'transformative healing', 'Sagittarius': 'philosophical understanding',
    'Capricorn': 'structured progress', 'Aquarius': 'innovative solutions', 'Pisces': 'intuitive guidance'
  }
  return support[sign] || 'emotional resilience'
}

function getAreaGuidance(area: string, sign: string, name: string): string {
  const guidance: any = {
    'Love & Relationships': `${name}, your ${sign} energy attracts deep connections. Open your heart while maintaining your authentic self.`,
    'Career & Life Purpose': `Your ${sign} nature is calling you toward leadership roles, ${name}. Trust your instincts about your next career move.`,
    'Money & Abundance': `${name}, abundance flows to you when you align with your ${sign} values. Focus on what truly matters to you.`,
    'Health & Wellness': `Your ${sign} constitution benefits from regular movement and mindful practices, ${name}.`,
    'Family & Home': `${name}, creating a sanctuary that reflects your ${sign} nature will bring deep peace.`,
    'Personal Growth': `Your evolution as a ${sign} involves embracing all parts of yourself, ${name}.`,
    'Spirituality': `${name}, your ${sign} soul seeks connection with something greater. Trust your spiritual instincts.`,
    'Creativity': `Let your ${sign} creative fire burn bright, ${name}. The world needs your unique expression.`
  }
  return guidance[area] || `${name}, this area of life is especially blessed for you right now.`
}

function getSunSignGift(sign: string): string {
  const gifts: any = {
    'Aries': 'the ability to inspire others to action',
    'Taurus': 'the power to create lasting value',
    'Gemini': 'the gift of connecting people and ideas',
    'Cancer': 'the ability to create emotional safety',
    'Leo': 'the power to light up any room',
    'Virgo': 'the gift of healing through service',
    'Libra': 'the ability to create harmony from chaos',
    'Scorpio': 'the power to transform and regenerate',
    'Sagittarius': 'the gift of inspiring hope and expansion',
    'Capricorn': 'the ability to build enduring success',
    'Aquarius': 'the gift of seeing revolutionary possibilities',
    'Pisces': 'the ability to heal through compassion'
  }
  return gifts[sign] || 'unique spiritual gifts'
}

function getMoonSignGift(sign: string): string {
  const gifts: any = {
    'Aries': 'emotional courage and resilience',
    'Taurus': 'the ability to find peace in chaos',
    'Gemini': 'emotional intelligence and communication',
    'Cancer': 'profound empathy and intuition',
    'Leo': 'the ability to warm hearts',
    'Virgo': 'emotional wisdom and discernment',
    'Libra': 'the gift of emotional diplomacy',
    'Scorpio': 'deep emotional transformation powers',
    'Sagittarius': 'infectious emotional optimism',
    'Capricorn': 'emotional maturity and wisdom',
    'Aquarius': 'emotional independence and innovation',
    'Pisces': 'boundless emotional compassion'
  }
  return gifts[sign] || 'deep emotional wisdom'
}

function getRisingSignGift(sign: string): string {
  const gifts: any = {
    'Aries': 'natural leadership presence',
    'Taurus': 'grounding and calming influence',
    'Gemini': 'the ability to connect with anyone',
    'Cancer': 'making others feel safe and cared for',
    'Leo': 'magnetic charisma',
    'Virgo': 'the gift of helpful presence',
    'Libra': 'natural social grace',
    'Scorpio': 'mysterious magnetism',
    'Sagittarius': 'inspiring optimism',
    'Capricorn': 'commanding respect',
    'Aquarius': 'unique perspective',
    'Pisces': 'ethereal charm'
  }
  return gifts[sign] || 'unique personal magnetism'
}

function getPowerDay(sign: string): string {
  const days: any = {
    'Aries': 'Tuesday', 'Taurus': 'Friday', 'Gemini': 'Wednesday',
    'Cancer': 'Monday', 'Leo': 'Sunday', 'Virgo': 'Wednesday',
    'Libra': 'Friday', 'Scorpio': 'Tuesday', 'Sagittarius': 'Thursday',
    'Capricorn': 'Saturday', 'Aquarius': 'Saturday', 'Pisces': 'Thursday'
  }
  return days[sign] || 'Sunday'
}

function getLuckyNumbers(sign: string): string {
  const numbers: any = {
    'Aries': '1, 9, 19', 'Taurus': '2, 6, 24', 'Gemini': '3, 5, 23',
    'Cancer': '2, 7, 25', 'Leo': '1, 5, 19', 'Virgo': '3, 6, 27',
    'Libra': '6, 7, 24', 'Scorpio': '4, 8, 22', 'Sagittarius': '3, 9, 21',
    'Capricorn': '8, 10, 26', 'Aquarius': '4, 11, 22', 'Pisces': '7, 12, 29'
  }
  return numbers[sign] || '7, 11, 22'
}

function getLuckyColors(sign: string): string {
  const colors: any = {
    'Aries': 'red and orange', 'Taurus': 'green and pink', 'Gemini': 'yellow and silver',
    'Cancer': 'white and silver', 'Leo': 'gold and orange', 'Virgo': 'navy and forest green',
    'Libra': 'pink and light blue', 'Scorpio': 'deep red and black', 'Sagittarius': 'purple and turquoise',
    'Capricorn': 'brown and charcoal', 'Aquarius': 'electric blue and silver', 'Pisces': 'sea green and lavender'
  }
  return colors[sign] || 'purple and silver'
}

function getPersonalAffirmation(sign: string, name: string): string {
  const affirmations: any = {
    'Aries': `${name}, repeat this: "I am courageous, I am first, I am unstoppable."`,
    'Taurus': `${name}, your affirmation: "I attract abundance, I create beauty, I am grounded in my power."`,
    'Gemini': `${name}, say this daily: "My mind is brilliant, my words have power, I connect all things."`,
    'Cancer': `${name}, embrace this truth: "I nurture, I protect, I create emotional wealth."`,
    'Leo': `${name}, declare this: "I shine, I lead with love, I am magnificent."`,
    'Virgo': `${name}, affirm this: "I heal, I perfect, I serve with wisdom."`,
    'Libra': `${name}, know this: "I balance, I harmonize, I create beauty in relationships."`,
    'Scorpio': `${name}, claim this power: "I transform, I rise, I am infinitely powerful."`,
    'Sagittarius': `${name}, proclaim this: "I explore, I expand, I am free."`,
    'Capricorn': `${name}, state this: "I achieve, I build legacy, I am the mountain."`,
    'Aquarius': `${name}, declare this: "I innovate, I revolutionize, I am the future."`,
    'Pisces': `${name}, whisper this: "I dream, I heal, I am one with all."`
  }
  return affirmations[sign] || `${name}, you are exactly where you need to be.`
}

async function generateAIReading(input: any, chartData: any): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using personalized reading')
    return generatePersonalizedReading(input, chartData)
  }

  try {
    const prompt = `You are Zodia, a wise and compassionate astrologer. Create a deeply personalized astrology reading that uses the client's name frequently throughout to make it feel intimate and personal.

IMPORTANT: Use their first name (${input.name.split(' ')[0]}) at least 15-20 times throughout the reading, especially:
- At the beginning of paragraphs
- When giving advice
- When describing their traits
- In affirmations
- When addressing their specific concerns

Client Information:
- Full Name: ${input.name}
- First Name: ${input.name.split(' ')[0]}
- Birth Date: ${input.date_of_birth}
- Birth Time: ${input.time_of_birth || 'Unknown'}
- Birth Place: ${input.place_of_birth.city}, ${input.place_of_birth.country}
- Gender: ${input.gender || 'Not specified'}
- Relationship Status: ${input.relationship_status || 'Not specified'}

Chart Data:
- Sun in ${chartData.planets.sun.sign} (${chartData.planets.sun.degree}°) in ${chartData.planets.sun.house}th house
- Moon in ${chartData.planets.moon.sign}
- Mercury in ${chartData.planets.mercury.sign}
- Venus in ${chartData.planets.venus.sign}
- Mars in ${chartData.planets.mars.sign}

Focus Areas: ${input.focus_areas?.join(', ') || 'General reading'}
Current Struggles: ${input.struggles || 'Not specified'}
Goals: ${input.goals || 'Not specified'}

Create a reading that:
1. Uses their first name naturally throughout (aim for 15-20 times)
2. Addresses them directly and personally
3. Makes specific references to their chart
4. Addresses their struggles with compassion
5. Supports their goals with cosmic insight
6. Provides practical, actionable advice
7. Feels like a personal letter from a caring cosmic guide

Format with clear sections, use warm and intimate language, and make them feel seen and special.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Zodia, a wise, compassionate astrologer who creates deeply personal readings. Use the client\'s first name frequently and naturally throughout the reading to create intimacy and connection.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.85,
        max_tokens: 2500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    // Fallback to personalized reading if OpenAI fails
    return generatePersonalizedReading(input, chartData)
  }
}