import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHabitStore } from '@/store/habitStore';
import { formatTime } from '@/utils/timeUtils';

export const TimerPanel = () => {
  const { habits, timer, startTimer, pauseTimer, stopTimer } = useHabitStore();
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning && timer.startTime) {
      interval = setInterval(() => {
        const currentTime = timer.elapsedTime + (Date.now() - timer.startTime);
        setDisplayTime(currentTime);
      }, 100);
    } else {
      setDisplayTime(timer.elapsedTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.startTime, timer.elapsedTime]);

  const selectedHabit = habits.find(h => h.id === timer.selectedHabitId);
  const progress = selectedHabit ? (displayTime / (60 * 60 * 1000)) : 0; // Progress in hours
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress % 1) * circumference;

  const handleStart = () => {
    if (timer.selectedHabitId) {
      startTimer(timer.selectedHabitId);
    }
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleStop = () => {
    stopTimer();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="panel-title mb-6">TIMER</h2>
        
        {/* Habit Selection */}
        <div className="mb-8">
          <Select
            value={timer.selectedHabitId || ''}
            onValueChange={(value) => {
              if (!timer.isRunning) {
                startTimer(value);
                pauseTimer(); // Start paused so user can click play when ready
              }
            }}
            disabled={timer.isRunning}
          >
            <SelectTrigger className="w-full max-w-xs mx-auto">
              <SelectValue placeholder="Select a habit" />
            </SelectTrigger>
            <SelectContent>
              {habits.map(habit => (
                <SelectItem key={habit.id} value={habit.id}>
                  {habit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timer Display */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="timer-ring"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold font-mono">
              {formatTime(displayTime)}
            </div>
            {selectedHabit && (
              <div className="text-sm text-muted-foreground mt-1">
                {selectedHabit.name}
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {!timer.isRunning ? (
            <Button 
              variant="default"
              size="lg"
              onClick={handleStart}
              disabled={!timer.selectedHabitId}
              className="rounded-full w-16 h-16 p-0"
            >
              <Play className="w-6 h-6" fill="currentColor" />
            </Button>
          ) : (
            <Button 
              variant="secondary"
              size="lg"
              onClick={handlePause}
              className="rounded-full w-16 h-16 p-0"
            >
              <Pause className="w-6 h-6" fill="currentColor" />
            </Button>
          )}
          
          <Button 
            variant="outline"
            size="lg"
            onClick={handleStop}
            disabled={!timer.selectedHabitId}
            className="rounded-full w-16 h-16 p-0"
          >
            <Square className="w-5 h-5" fill="currentColor" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {selectedHabit && (
        <Card className="habit-card">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Today's Progress</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Current Session</div>
              <div className="font-semibold">{formatTime(displayTime)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Time</div>
              <div className="font-semibold">{formatTime(selectedHabit.timeSpent)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};