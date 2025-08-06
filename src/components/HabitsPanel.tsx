import { useState } from 'react';
import { Plus, Edit, Trash2, Target, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useHabitStore } from '@/store/habitStore';
import { Habit } from '@/types/habit';
import { formatTime, formatDuration } from '@/utils/timeUtils';

interface HabitFormData {
  name: string;
  importance: number;
  resources: string;
  description: string;
  goal: string;
}

export const HabitsPanel = () => {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    importance: 5,
    resources: '',
    description: '',
    goal: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      importance: 5,
      resources: '',
      description: '',
      goal: ''
    });
    setEditingHabit(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (habit: Habit) => {
    setFormData({
      name: habit.name,
      importance: habit.importance,
      resources: habit.resources.join(', '),
      description: habit.description,
      goal: habit.goal
    });
    setEditingHabit(habit);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitData = {
      name: formData.name,
      importance: formData.importance,
      resources: formData.resources.split(',').map(r => r.trim()).filter(Boolean),
      description: formData.description,
      goal: formData.goal
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
    }
  };

  const getProgressPercentage = (habit: Habit): number => {
    // Simple calculation based on goal
    const goalHours = parseFloat(habit.goal.match(/(\d+)/)?.[1] || '1');
    const actualHours = habit.timeSpent / (1000 * 60 * 60);
    return Math.min(100, (actualHours / goalHours) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="panel-title">HABITS</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Reading, Exercise, Meditation"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="importance">Importance: {formData.importance}/10</Label>
                <Slider
                  value={[formData.importance]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, importance: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="e.g., 1 hour/day, 30 mins/day"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why is this habit important to you?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resources">Resources (comma-separated)</Label>
                <Textarea
                  id="resources"
                  value={formData.resources}
                  onChange={(e) => setFormData(prev => ({ ...prev, resources: e.target.value }))}
                  placeholder="Books, apps, websites, tools..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingHabit ? 'Update' : 'Add'} Habit
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Card className="habit-card text-center py-12">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building great habits by adding your first one.
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Habit
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits
            .sort((a, b) => b.importance - a.importance)
            .map(habit => (
              <Card key={habit.id} className="habit-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{habit.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {habit.description}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(habit)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(habit.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Importance:</span>
                    <span className="font-semibold">{habit.importance}/10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Goal:</span>
                    <span className="font-semibold">{habit.goal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{formatDuration(habit.timeSpent)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getProgressPercentage(habit))}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(habit)}%` }}
                    />
                  </div>
                </div>

                {/* Resources */}
                {habit.resources.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Resources: </span>
                    <span className="text-foreground">
                      {habit.resources.slice(0, 2).join(', ')}
                      {habit.resources.length > 2 && ` +${habit.resources.length - 2} more`}
                    </span>
                  </div>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};