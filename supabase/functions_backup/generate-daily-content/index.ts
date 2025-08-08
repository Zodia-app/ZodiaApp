import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://deno.land/x/openai@v4.20.1/mod.ts"

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

serve(async (req) => {
  try {
    const { zodiacSign, date } = await req.json()
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Zodia. Generate mystical daily guidance."
        },
        {
          role: "user",
          content: `Generate daily horoscope for ${zodiacSign} on ${date}. Keep it brief and mystical.`
        }
      ],
      temperature: 0.9,
      max_tokens: 200,
    })
    
    const content = completion.choices[0].message.content
    
    return new Response(JSON.stringify({ horoscope: content }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})