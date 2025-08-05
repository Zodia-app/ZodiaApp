// supabase/functions/generate-palm-reading/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  systemPrompt: string;
  userPrompt: string;
  imageUrl?: string;
  imageAnalysisPrompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { systemPrompt, userPrompt, imageUrl, imageAnalysisPrompt } = await req.json() as RequestBody;

    // Validate required fields
    if (!systemPrompt || !userPrompt) {
      throw new Error('Missing required prompts');
    }

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // If we have an image, add vision analysis
    if (imageUrl && imageAnalysisPrompt) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: imageAnalysisPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      });
    }

    // Add the main reading prompt
    messages.push({
      role: 'user',
      content: userPrompt
    });

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageUrl ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
        messages,
        temperature: 0.8,
        max_tokens: 2500,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    const reading = data.choices[0]?.message?.content;

    if (!reading) {
      throw new Error('No reading generated');
    }

    return new Response(
      JSON.stringify({ 
        reading,
        model: data.model,
        usage: data.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating palm reading:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        reading: getFallbackReading()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});

/**
 * Fallback reading when AI service fails
 */
function getFallbackReading(): string {
  return `**Your Palm Reading**

The ancient art of palmistry reveals unique insights about your journey. While we couldn't perform a detailed analysis at this moment, your palm holds these universal truths:

**Life Path**
Your Life Line suggests a path of continuous growth and learning. You possess natural resilience that helps you navigate life's challenges with grace.

**Emotional Nature**
Your Heart Line indicates a balanced approach to emotions - you feel deeply but maintain wisdom in your connections with others.

**Mental Gifts**
Your Head Line reveals a sharp, curious mind that seeks understanding and meaning in all experiences.

**Unique Talents**
The mounts of your palm suggest hidden talents waiting to be discovered. Trust your intuition as it guides you toward your true calling.

**Guidance**
Remember that your palm is a map, not a fixed destiny. You have the power to shape your journey through your choices and actions.

*This reading provides general insights. For a personalized analysis, please try again when our advanced reading service is available.*`;
}