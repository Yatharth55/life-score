import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habits } = await req.json();

    // Create context about user's habits
    const habitContext = habits.map((habit: any) => {
      const goalHours = parseFloat(habit.goal.match(/(\d+)/)?.[1] || '1');
      const actualHours = habit.time_spent / (1000 * 60 * 60);
      const completion = (actualHours / goalHours) * 100;
      
      return `${habit.name} (Importance: ${habit.importance}/10, Goal: ${habit.goal}, Progress: ${completion.toFixed(1)}%)`;
    }).join(', ');

    const prompt = `Based on these habits: ${habitContext}. 
    Provide 3 specific, actionable suggestions to improve habit consistency and achievement. 
    Focus on practical tips that consider their current progress and importance levels.
    Format as a JSON array of strings.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { 
            role: 'system', 
            content: 'You are a habit coach that provides specific, actionable advice. Always respond with a JSON array of exactly 3 suggestion strings.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to generic suggestions if parsing fails
    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch {
      suggestions = [
        "Focus on your highest-importance habits during peak energy hours",
        "Consider breaking down larger goals into smaller, more achievable daily targets",
        "Try habit stacking: link new habits to existing ones for better consistency"
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-suggestions function:', error);
    
    // Return fallback suggestions on error
    const fallbackSuggestions = [
      "Start with small, consistent actions to build momentum",
      "Track your progress daily to stay motivated and accountable",
      "Schedule your habits at the same time each day to create routine"
    ];
    
    return new Response(JSON.stringify({ suggestions: fallbackSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});