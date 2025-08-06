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
    let model = "gpt-4o-mini"
    
    // Simple prompt for now
    prompt = `Create a ${type} reading for ${userData.name}, born on ${userData.birth_date}.`
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are Zodia, a mystical fortune teller."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
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