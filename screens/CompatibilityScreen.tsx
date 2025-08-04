// supabase/functions/generate-reading/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const { readingId, type, userData } = await req.json()
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get reading details
    const { data: reading, error } = await supabase
      .from('readings')
      .select('*')
      .eq('id', readingId)
      .single()
    
    if (error) throw error
    
    // Generate content based on type
    let prompt = ""
    let model = "gpt-4o-mini" // Cost-effective model
    
    switch(type) {
      case 'astrology':
        prompt = generateAstrologyPrompt(userData, reading)
        break
      case 'palm':
        prompt = generatePalmPrompt(userData, reading)
        break
      case 'clairvoyance':
        prompt = generateClairvoyancePrompt(userData, reading)
        model = "gpt-4o" // Use better model for premium readings
        break
    }
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are Zodia, a mystical fortune teller with deep wisdom..."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: type === 'teaser' ? 500 : 2000,
    })
    
    const content = completion.choices[0].message.content
    
    // Update reading with generated content
    await supabase
      .from('readings')
      .update({ 
        content: content,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', readingId)
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// Helper functions for prompts
function generateAstrologyPrompt(userData: any, reading: any) {
  return `Create a ${reading.reading_type} astrology reading for:
    Name: ${userData.name}
    Zodiac Sign: ${userData.zodiac_sign}
    Birth Date: ${userData.birth_date}
    ${reading.reading_type === 'teaser' ? 'Keep it brief (1 page) but intriguing.' : 'Provide detailed insights (3-4 pages).'}
    Include sections on: personality, current energies, love, career, and spiritual guidance.`
}