// AI Prompt Templates for Horoscope Generation

export const PROMPT_TEMPLATES = {
  dailyHoroscope: {
    system: `You are Celeste, a warm and insightful astrologer with 20 years of experience. 
    You blend traditional astrological wisdom with modern life guidance. 
    Your readings are positive, specific, and actionable. 
    Never use vague statements - always provide concrete suggestions.`,
    
    buildPrompt: (data) => `Create today's personalized horoscope for a ${data.sign} born on ${data.birthDate}.

Current cosmic context:
- Date: ${data.currentDate}
- Their age: ${data.age} years
- ${data.sign} element: ${data.element}
- Key traits: ${data.traits.join(', ')}

Craft a reading that includes:
1. Today's Overall Energy (2-3 sentences, mention specific ${data.element} element influences)
2. Love & Relationships (2 sentences with specific advice)
3. Career & Money (2 sentences with actionable steps)
4. Health & Wellness (1-2 sentences)
5. Lucky Color: ${data.colors[0]} (explain why today)
6. Lucky Number: ${data.luckyNumbers[0]}
7. Power Hour: [specific time range and why]

Make it personal and reference their ${data.sign} traits naturally.`
  },

  weeklyForecast: {
    system: `You are an expert astrologer creating weekly forecasts. 
    Focus on major themes, opportunities, and gentle warnings. 
    Be optimistic but realistic.`,
    
    buildPrompt: (data) => `Create a weekly forecast for ${data.sign} 
Week: ${data.weekStart} to ${data.weekEnd}

Include:
- Week's Major Theme (related to ${data.element} element)
- Best Days for Love: [specific days and why]
- Best Days for Work/Money: [specific days and why]
- Challenge to Watch: [specific day and how to handle it]
- Weekend Outlook
- Weekly Affirmation (incorporating ${data.sign} strengths)`
  },

  compatibility: {
    system: `You are a relationship astrologer specializing in compatibility. 
    Provide balanced, honest insights that help couples understand each other better. 
    Focus on growth and mutual understanding.`,
    
    buildPrompt: (data) => `Analyze the romantic compatibility between:
- Partner 1: ${data.sign1} (${data.element1} element, traits: ${data.traits1})
- Partner 2: ${data.sign2} (${data.element2} element, traits: ${data.traits2})

Element Interaction: ${data.element1} meets ${data.element2}

Provide:
1. Chemistry Overview (how these elements interact)
2. Communication Style Match
3. Emotional Compatibility 
4. Shared Values & Goals
5. Potential Friction Points (be gentle but honest)
6. Keys to Success (3 specific tips)
7. Date Ideas that Honor Both Signs
8. Long-term Potential Summary

Keep it balanced - every pairing has unique gifts.`
  },

  birthChart: {
    system: `You are creating a natal chart interpretation. 
    Even with just the sun sign, provide deep insights about life purpose and potential.`,
    
    buildPrompt: (data) => `Create a birth chart essence reading for:
Born: ${data.birthDate} (${data.sign})

With just their sun sign, reveal:
1. Core Life Purpose (based on ${data.sign} and ${data.element})
2. Natural Talents (3 specific ${data.sign} gifts)
3. Soul's Journey (what they're here to learn)
4. Career Paths that Align with ${data.sign} Energy
5. Relationship Patterns to Understand
6. Shadow Work (${data.sign} challenges to transform)
7. This Year's Focus (age ${data.age} considerations)

Make it profound yet practical.`
  }
};

/**
 * Get formatted prompt for AI generation
 */
export function getAIPrompt(type, data) {
  const template = PROMPT_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown prompt type: ${type}`);
  }
  
  return {
    system: template.system,
    user: template.buildPrompt(data)
  };
}

/**
 * Format AI response into structured data
 */
export function parseAIResponse(type, response) {
  // This will parse the AI response into structured format
  // For now, return as-is, but later we can add parsing logic
  return {
    type,
    content: response,
    generatedAt: new Date().toISOString()
  };
}