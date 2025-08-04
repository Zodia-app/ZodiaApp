interface Section {
  title: string;
  content: string | string[];
  type: 'paragraph' | 'list' | 'highlight' | 'quote';
  icon?: string;
}

export const formatAIResponse = (
  response: string, 
  readingType: 'astrology' | 'palm' | 'clairvoyance'
): Section[] => {
  // Parse AI response into structured sections
  const sections: Section[] = [];
  
  // Split response by common AI section markers
  const rawSections = response.split(/\n\n(?=[A-Z])/);
  
  rawSections.forEach((section) => {
    const lines = section.trim().split('\n');
    if (lines.length === 0) return;
    
    // Extract title (usually first line)
    const title = lines[0].replace(/[*#]/g, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Skip empty sections
    if (!title || !content) return;
    
    // Determine section type and icon based on content
    let type: Section['type'] = 'paragraph';
    let icon: string | undefined;
    
    // Check for list indicators
    if (content.includes('•') || content.includes('-') || content.includes('1.')) {
      type = 'list';
      const listItems = content
        .split(/\n/)
        .filter(line => line.trim())
        .map(line => line.replace(/^[-•\d.]\s*/, '').trim());
      
      sections.push({
        title,
        content: listItems,
        type,
        icon: getIconForSection(title, readingType),
      });
      return;
    }
    
    // Check for special sections
    if (title.toLowerCase().includes('overview') || 
        title.toLowerCase().includes('summary')) {
      type = 'highlight';
      icon = '📋';
    } else if (title.toLowerCase().includes('advice') || 
               title.toLowerCase().includes('guidance')) {
      type = 'highlight';
      icon = '💡';
    } else if (title.toLowerCase().includes('warning') || 
               title.toLowerCase().includes('caution')) {
      type = 'highlight';
      icon = '⚠️';
    } else if (content.startsWith('"') && content.endsWith('"')) {
      type = 'quote';
      icon = '💭';
    }
    
    sections.push({
      title,
      content: content,
      type,
      icon: icon || getIconForSection(title, readingType),
    });
  });
  
  // Add default sections if none parsed
  if (sections.length === 0) {
    sections.push({
      title: 'Your Reading',
      content: response,
      type: 'paragraph',
      icon: getDefaultIcon(readingType),
    });
  }
  
  return sections;
};

const getIconForSection = (title: string, readingType: string): string => {
  const lowerTitle = title.toLowerCase();
  
  // Common section icons
  if (lowerTitle.includes('love') || lowerTitle.includes('romance')) return '❤️';
  if (lowerTitle.includes('career') || lowerTitle.includes('work')) return '💼';
  if (lowerTitle.includes('health')) return '🏥';
  if (lowerTitle.includes('money') || lowerTitle.includes('finance')) return '💰';
  if (lowerTitle.includes('lucky')) return '🍀';
  if (lowerTitle.includes('warning') || lowerTitle.includes('caution')) return '⚠️';
  if (lowerTitle.includes('advice') || lowerTitle.includes('tip')) return '💡';
  if (lowerTitle.includes('strength')) return '💪';
  if (lowerTitle.includes('challenge')) return '🎯';
  if (lowerTitle.includes('opportunity')) return '✨';
  if (lowerTitle.includes('relationship')) return '👥';
  if (lowerTitle.includes('spiritual')) return '🙏';
  if (lowerTitle.includes('energy')) return '⚡';
  
  // Reading type specific
  if (readingType === 'palm') {
    if (lowerTitle.includes('life')) return '🌱';
    if (lowerTitle.includes('heart')) return '💗';
    if (lowerTitle.includes('head')) return '🧠';
    if (lowerTitle.includes('fate')) return '🔮';
  }
  
  return getDefaultIcon(readingType);
};

const getDefaultIcon = (readingType: string): string => {
  switch (readingType) {
    case 'astrology': return '⭐';
    case 'palm': return '🤚';
    case 'clairvoyance': return '🔮';
    default: return '✨';
  }
};

// Format date for display
export const formatReadingDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

// Extract key insights for preview
export const extractKeyInsights = (response: string): string[] => {
  const insights: string[] = [];
  const lines = response.split('\n');
  
  lines.forEach(line => {
    // Look for lines that seem like key points
    if (line.includes('will') || 
        line.includes('should') || 
        line.includes('expect') ||
        line.includes('important') ||
        line.includes('key')) {
      const cleaned = line.replace(/^[-•*]\s*/, '').trim();
      if (cleaned.length > 20 && cleaned.length < 150) {
        insights.push(cleaned);
      }
    }
  });
  
  return insights.slice(0, 3); // Return top 3 insights
};