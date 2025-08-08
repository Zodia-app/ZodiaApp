// supabase/functions/generate-astrology-reading/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.20.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Parse request body
    const {
      user_id,
      name,
      date_of_birth,
      time_of_birth,
      place_of_birth,
      gender,
      relationship_status,
      focus_areas,
      struggles,
      goals
    } = await req.json()

    // Calculate birth chart data (simplified version for now)
    // In production, you'd use a proper ephemeris service or API
    const chart_data = calculateBirthChart({
      date: date_of_birth,
      time: time_of_birth || '12:00',
      lat: place_of_birth.lat || 0,
      lng: place_of_birth.lng || 0
    })

    // Extract first name for personalization
    const firstName = name.split(' ')[0]

    // Build the prompt for OpenAI
    const prompt_payload = {
      name: firstName,
      full_name: name,
      gender,
      relationship_status,
      focus_areas,
      struggles,
      goals,
      birth: {
        date: date_of_birth,
        time: time_of_birth,
        place: place_of_birth
      },
      natal_chart: chart_data
    }

    const systemPrompt = `You are Zodia, a wise, compassionate, and highly skilled astrologer with decades of experience. You provide deeply personalized, insightful, and actionable astrology readings that blend traditional astrological wisdom with modern psychological understanding.

Your communication style:
- Always address the person by their first name (${firstName})
- Write in a warm, personal, and encouraging tone
- Be specific and detailed, avoiding generic statements
- Provide actionable advice and practical guidance
- Reference specific planetary placements and aspects
- Sign off as "Zodia" with cosmic blessings

Structure your reading with these sections:
1. Personal greeting and overview of their unique cosmic blueprint
2. Sun, Moon, and Rising sign analysis
3. Key planetary placements and their influence
4. Current transits and timing
5. Love and relationships insights
6. Career and life purpose guidance
7. Personal growth and spiritual development
8. Specific advice based on their struggles and goals
9. Lucky periods and important dates ahead
10. Closing message with encouragement and cosmic wisdom`

    const userPrompt = `Create a comprehensive, deeply personalized astrology reading for this individual:

${JSON.stringify(prompt_payload, null, 2)}

Make the reading at least 1500 words, highly specific to their chart, and address their struggles and goals directly. Include specific dates, planetary positions, and actionable advice.`

    // Generate reading with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.8,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })

    const reading_result = completion.choices[0].message.content

    // Save to database
    const { data, error } = await supabase
      .from('astrology_readings')
      .insert({
        user_id,
        name,
        date_of_birth,
        time_of_birth,
        place_of_birth,
        gender,
        relationship_status,
        focus_areas,
        struggles,
        goals,
        chart_data,
        prompt_payload,
        reading_result,
        reading_type: 'natal'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true,
        reading_id: data.id,
        reading: reading_result,
        chart_data: chart_data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

// Simplified birth chart calculation
// In production, use Swiss Ephemeris or an astrology API
function calculateBirthChart({ date, time, lat, lng }: any) {
  // This is a placeholder - you'd integrate with a proper ephemeris here
  const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  
  // Mock data - replace with actual calculations
  const planets = {
    sun: { sign: 'Leo', degree: 15.5, house: 10 },
    moon: { sign: 'Cancer', degree: 22.3, house: 9 },
    mercury: { sign: 'Virgo', degree: 8.7, house: 11 },
    venus: { sign: 'Libra', degree: 19.2, house: 12 },
    mars: { sign: 'Aries', degree: 5.8, house: 6 },
    jupiter: { sign: 'Sagittarius', degree: 12.4, house: 2 },
    saturn: { sign: 'Capricorn', degree: 28.9, house: 3 },
    uranus: { sign: 'Aquarius', degree: 7.1, house: 4 },
    neptune: { sign: 'Pisces', degree: 18.6, house: 5 },
    pluto: { sign: 'Scorpio', degree: 24.5, house: 1 },
    ascendant: { sign: 'Scorpio', degree: 12.0, house: 1 },
    midheaven: { sign: 'Leo', degree: 10.0, house: 10 }
  }

  // Calculate aspects (simplified)
  const aspects = [
    { planet1: 'sun', planet2: 'moon', aspect: 'square', orb: 2.3 },
    { planet1: 'venus', planet2: 'mars', aspect: 'opposition', orb: 1.5 },
    { planet1: 'mercury', planet2: 'jupiter', aspect: 'trine', orb: 0.8 }
  ]

  return {
    planets,
    aspects,
    houses: generateHouses(lat, lng),
    calculated_at: new Date().toISOString()
  }
}

function generateHouses(lat: number, lng: number) {
  // Placeholder for house calculations
  const houses = []
  for (let i = 1; i <= 12; i++) {
    houses.push({
      house: i,
      sign: ['Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Aries',
             'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra'][i - 1],
      degree: (i - 1) * 30
    })
  }
  return houses
}