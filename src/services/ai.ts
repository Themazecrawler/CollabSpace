// AI Service for idea generation and insights
// Using OpenAI API or similar service

interface AIResponse {
  ideas: string[];
  insights: string[];
  suggestions: string[];
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Using mock data.');
    } else {
      console.log('OpenAI API key loaded successfully');
    }
  }

  async generateIdeas(context: string, projectType: string): Promise<string[]> {
    if (!this.apiKey) {
      console.error('OpenAI API key is missing! Please add VITE_OPENAI_API_KEY to your .env.local file');
      throw new Error('OpenAI API key is required');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a creative project consultant specializing in software development, design, and business strategy. Generate 5 specific, actionable, and innovative ideas for the given project context. Each idea should be concise but detailed enough to be immediately actionable.'
            },
            {
              role: 'user',
              content: `Generate 5 creative and practical ideas for a ${projectType} project. Context: ${context}. Focus on modern best practices, user experience, and technical feasibility.`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the response into individual ideas
      const ideas = content
        .split('\n')
        .filter(line => line.trim() && (line.match(/^\d+\./) || line.match(/^[-*]/) || line.match(/^[A-Z]/)))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(idea => idea.length > 10);

      return ideas.length > 0 ? ideas : [content];
    } catch (error) {
      console.error('AI API error:', error);
      throw error;
    }
  }

  async generateInsights(projectData: any): Promise<string[]> {
    if (!this.apiKey) {
      console.error('OpenAI API key is missing! Please add VITE_OPENAI_API_KEY to your .env.local file');
      throw new Error('OpenAI API key is required');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a project analytics expert specializing in software development and team productivity. Analyze the project data and provide 3 specific, actionable insights that can help improve project performance and team efficiency.'
            },
            {
              role: 'user',
              content: `Analyze this project data and provide 3 key insights with specific recommendations: ${JSON.stringify(projectData)}`
            }
          ],
          max_tokens: 400,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the response into individual insights
      const insights = content
        .split('\n')
        .filter(line => line.trim() && (line.match(/^\d+\./) || line.match(/^[-*]/) || line.match(/^[A-Z]/)))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(insight => insight.length > 10);

      return insights.length > 0 ? insights : [content];
    } catch (error) {
      console.error('AI API error:', error);
      throw error;
    }
  }


}

export const aiService = new AIService();

