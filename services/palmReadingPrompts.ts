// src/services/palmReadingPrompts.ts

export interface PalmReadingContext {
  userName: string;
  dateOfBirth?: string;
  gender?: string;
  handedness: 'left' | 'right';
  relationshipStatus?: string;
  imageAnalysis?: {
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
    handType: 'earth' | 'air' | 'water' | 'fire' | 'mixed';
    palmSize: 'large' | 'medium' | 'small';
  };
}

export class PalmReadingPrompts {
  /**
   * System prompt that sets up the AI as a palm reading expert
   */
  static getSystemPrompt(): string {
    return `You are Zodia, an expert palm reader with decades of experience in chiromancy (palm reading). 
You combine traditional palmistry knowledge with intuitive insights to provide meaningful, personalized readings.

Your expertise includes:
- Major lines: Life Line, Heart Line, Head Line, Fate Line
- Minor lines: Sun Line, Mercury Line, Marriage Lines, Children Lines, Travel Lines
- Mounts: Venus, Jupiter, Saturn, Apollo, Mercury, Mars, Luna
- Hand shapes: Earth, Air, Water, Fire hands
- Finger analysis: Length, shape, flexibility
- Special markings: Stars, crosses, triangles, squares, islands, chains

Your reading style is:
- Warm, mystical, and engaging
- Specific and detailed, avoiding generic statements
- Balanced between positive insights and areas for growth
- Respectful of the querent's journey
- Encouraging and empowering

Always structure your readings with clear sections and use rich, evocative language that captures the mystical nature of palmistry while remaining accessible.`;
  }

  /**
   * Generate the main palm reading prompt
   */
  static getReadingPrompt(context: PalmReadingContext): string {
    const pronouns = context.gender === 'female' ? 'her' : context.gender === 'male' ? 'his' : 'their';
    
    return `Provide a comprehensive palm reading for ${context.userName} based on ${pronouns} ${context.handedness} hand.

Context:
- Name: ${context.userName}
- Birth Date: ${context.dateOfBirth || 'Not provided'}
- Relationship Status: ${context.relationshipStatus || 'Not specified'}
- Hand Being Read: ${context.handedness} (${context.handedness === 'right' ? 'dominant/conscious self' : 'non-dominant/subconscious self'})

Please provide a detailed reading covering:

1. **Opening & Overall Impression** (2-3 sentences)
   - Mystical greeting using their name
   - Overall energy/first impression of the palm

2. **The Major Lines** (4-5 paragraphs)
   - Life Line: Vitality, life path, major changes
   - Heart Line: Emotional nature, love style, relationships
   - Head Line: Thinking patterns, decision-making, intellectual approach
   - Fate Line (if visible): Career, life purpose, destiny

3. **The Mounts** (3-4 paragraphs)
   - Most prominent mounts and their meanings
   - How the mounts interact with the lines
   - What this reveals about personality and talents

4. **Special Markings & Patterns** (2-3 paragraphs)
   - Any significant marks (stars, crosses, triangles)
   - Unique patterns or rare lines
   - Their specific meanings for this person

5. **Love & Relationships** (2-3 paragraphs)
   - Relationship patterns and tendencies
   - Compatibility insights
   - Future romantic potential
   ${context.relationshipStatus ? `- Specific insights for someone who is ${context.relationshipStatus}` : ''}

6. **Career & Success** (2-3 paragraphs)
   - Natural talents and abilities
   - Career path indicators
   - Financial potential
   - Best paths for success

7. **Health & Vitality** (2 paragraphs)
   - Energy levels and constitution
   - Areas to pay attention to
   - Wellness recommendations based on palm indicators

8. **Hidden Talents & Spiritual Gifts** (2 paragraphs)
   - Undiscovered abilities
   - Spiritual inclinations
   - Psychic or intuitive abilities

9. **Future Insights** (2-3 paragraphs)
   - Upcoming opportunities
   - Potential challenges and how to navigate them
   - Time periods of significance

10. **Personalized Guidance** (2-3 paragraphs)
   - Specific advice based on the reading
   - Crystals, colors, or practices that would benefit them
   - Affirmations or mantras aligned with their palm energy

Close with a mystical blessing or empowering message that uses their name.

Make the reading feel deeply personal, as if you're truly seeing into ${context.userName}'s unique essence through ${pronouns} palm. Use specific details and avoid generic statements. Include unexpected insights that feel revelatory.`;
  }

  /**
   * Generate a prompt for analyzing palm features from an image
   */
  static getImageAnalysisPrompt(): string {
    return `Analyze this palm image and identify the following features:

1. **Hand Shape Type**:
   - Earth (square palm, short fingers): Practical, grounded
   - Air (square palm, long fingers): Intellectual, communicative  
   - Water (long palm, long fingers): Emotional, intuitive
   - Fire (long palm, short fingers): Energetic, creative

2. **Major Lines Visibility & Characteristics**:
   - Life Line: Starting point, curve, depth, length, breaks
   - Heart Line: Starting point, curve/straight, depth, endings
   - Head Line: Separation from life line, slope, length, depth
   - Fate Line: Presence, starting point, clarity, breaks

3. **Prominent Mounts** (raised areas):
   - Mount of Venus (thumb base)
   - Mount of Jupiter (index finger base)
   - Mount of Saturn (middle finger base)
   - Mount of Apollo (ring finger base)
   - Mount of Mercury (pinky base)
   - Mount of Mars (center palm)
   - Mount of Luna (opposite thumb)

4. **Special Markings**:
   - Stars (success, luck)
   - Crosses (challenges, spiritual markers)
   - Triangles (talent, ability)
   - Squares (protection)
   - Islands (difficulties)
   - Chains (obstacles)
   - Grilles (confusion, stress)

5. **Finger Characteristics**:
   - Length relationships
   - Flexibility
   - Shape of fingertips
   - Spacing between fingers

6. **Overall Palm Qualities**:
   - Color tone
   - Flexibility
   - Texture
   - Moisture level
   - General proportions

Provide specific observations for each category that can be used to generate a personalized reading.`;
  }

  /**
   * Generate a brief palm reading for quick insights
   */
  static getQuickReadingPrompt(context: PalmReadingContext): string {
    return `Provide a brief but insightful palm reading for ${context.userName} (300-400 words).

Focus on:
1. One major revelation from their life line
2. Their love nature from the heart line
3. Their thinking style from the head line
4. One special talent shown in the mounts
5. A surprising insight about their future
6. One piece of powerful guidance

Make it personal, mystical, and memorable. End with an empowering message.`;
  }

  /**
   * Generate a compatibility reading based on palm features
   */
  static getCompatibilityPrompt(context: PalmReadingContext, partnerName?: string): string {
    return `Based on ${context.userName}'s palm reading, provide relationship compatibility insights.

Analyze:
1. **Love Style**: How they express and receive love based on their heart line
2. **Emotional Needs**: What they need in a relationship (from heart line and mount of Venus)
3. **Communication Style**: How they communicate in relationships (from head line and Mercury)
4. **Ideal Partner Traits**: What type of person complements their energy
5. **Relationship Challenges**: Patterns to be aware of
6. **Best Compatibility**: Which palm types/personalities match best
${partnerName ? `7. **Specific Compatibility with ${partnerName}**: Potential dynamics and advice` : ''}

Provide specific, actionable insights that help them understand their relationship patterns and improve their romantic life.`;
  }

  /**
   * Format the AI response into structured reading sections
   */
  static formatReading(rawReading: string): {
    title: string;
    sections: Array<{
      heading: string;
      content: string;
      icon?: string;
    }>;
    summary: string;
  } {
    // Parse the reading into sections
    const sections = [];
    const lines = rawReading.split('\n');
    let currentSection = { heading: '', content: '', icon: '' };
    
    for (const line of lines) {
      if (line.startsWith('**') && line.endsWith('**')) {
        if (currentSection.heading) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          heading: line.replace(/\*\*/g, '').trim(),
          content: '',
          icon: this.getIconForSection(line)
        };
      } else if (line.trim()) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.heading) {
      sections.push(currentSection);
    }

    return {
      title: 'Your Personal Palm Reading',
      sections,
      summary: sections[0]?.content || 'Your palm reveals a unique and fascinating journey ahead.'
    };
  }

  /**
   * Get appropriate icon for each section
   */
  private static getIconForSection(heading: string): string {
    const headingLower = heading.toLowerCase();
    
    if (headingLower.includes('love') || headingLower.includes('relationship')) return '❤️';
    if (headingLower.includes('career') || headingLower.includes('success')) return '💼';
    if (headingLower.includes('health') || headingLower.includes('vitality')) return '🌟';
    if (headingLower.includes('future')) return '🔮';
    if (headingLower.includes('talent') || headingLower.includes('spiritual')) return '✨';
    if (headingLower.includes('line')) return '〰️';
    if (headingLower.includes('mount')) return '⛰️';
    if (headingLower.includes('guidance')) return '🌙';
    
    return '🤚';
  }
}