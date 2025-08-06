import { useState } from 'react';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { SimpleChartContainer } from '@/components/ui/simple-chart';
import { useHabitStore } from '@/store/habitStore';
import { formatDuration } from '@/utils/timeUtils';

export const ProfilePanel = () => {
  const { habits } = useHabitStore();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Calculate stats
  const totalTimeSpent = habits.reduce((sum, habit) => sum + habit.timeSpent, 0);
  const averageImportance = habits.length > 0 
    ? habits.reduce((sum, habit) => sum + habit.importance, 0) / habits.length 
    : 0;
  const activeHabits = habits.length;

  // Prepare radar chart data
  const radarData = habits.map(habit => {
    const goalHours = parseFloat(habit.goal.match(/(\d+)/)?.[1] || '1');
    const actualHours = habit.timeSpent / (1000 * 60 * 60);
    const completionRate = Math.min(100, (actualHours / goalHours) * 100);
    const weightedScore = (completionRate * habit.importance) / 10;

    return {
      habit: habit.name.length > 8 ? habit.name.substring(0, 8) + '...' : habit.name,
      score: Math.round(weightedScore),
      fullName: habit.name
    };
  });

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation with realistic suggestions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = [
      "Focus on your highest-importance habits during peak energy hours (usually morning)",
      "Consider breaking down larger goals into smaller, more achievable daily targets",
      "Try habit stacking: link new habits to existing ones for better consistency",
      "Schedule weekly reviews to assess progress and adjust goals if needed",
      "Use the 2-minute rule: if a habit takes less than 2 minutes, do it immediately"
    ];
    
    // Select 3 random suggestions
    const selectedSuggestions = suggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setAiSuggestions(selectedSuggestions);
    setIsGeneratingAI(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="panel-title mb-6">PROFILE</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="habit-card text-center">
          <Target className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold">{activeHabits}</div>
          <div className="text-xs text-muted-foreground">Active Habits</div>
        </Card>
        
        <Card className="habit-card text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold">{formatDuration(totalTimeSpent)}</div>
          <div className="text-xs text-muted-foreground">Total Time</div>
        </Card>
        
        <Card className="habit-card text-center">
          <Zap className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold">{averageImportance.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Priority</div>
        </Card>
      </div>

      {/* Radar Chart */}
      {habits.length > 0 ? (
        <Card className="habit-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Habit Performance Overview
          </h3>
          <SimpleChartContainer className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid strokeWidth={1} stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="habit" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar
                  name="Performance"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </SimpleChartContainer>
          <p className="text-xs text-muted-foreground mt-2">
            Performance score = (Progress % × Importance) ÷ 10
          </p>
        </Card>
      ) : (
        <Card className="habit-card text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Add some habits and start tracking to see your performance chart.
          </p>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="habit-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Suggestions
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateAISuggestions}
            disabled={isGeneratingAI || habits.length === 0}
          >
            {isGeneratingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                Thinking...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Tips
              </>
            )}
          </Button>
        </div>

        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add some habits first to get personalized AI suggestions.
          </p>
        ) : aiSuggestions.length > 0 ? (
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click "Get AI Tips" to receive personalized suggestions based on your habit data.
          </p>
        )}
      </Card>

      {/* Detailed Stats */}
      <Card className="habit-card">
        <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
        {habits.length > 0 ? (
          <div className="space-y-3">
            {habits
              .sort((a, b) => b.timeSpent - a.timeSpent)
              .map(habit => {
                const goalHours = parseFloat(habit.goal.match(/(\d+)/)?.[1] || '1');
                const actualHours = habit.timeSpent / (1000 * 60 * 60);
                const percentage = Math.min(100, (actualHours / goalHours) * 100);
                
                return (
                  <div key={habit.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{habit.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{Math.round(percentage)}%</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(habit.timeSpent)} / {habit.goal}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No habits to analyze yet.
          </p>
        )}
      </Card>
    </div>
  );
};