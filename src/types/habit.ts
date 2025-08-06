export interface Habit {
  id: string;
  name: string;
  importance: number; // 1-10 scale
  resources: string[]; // URLs or resource descriptions
  description: string;
  goal: string; // e.g., "10 hrs/week", "30 mins/day"
  timeSpent: number; // total time in milliseconds
  createdAt: Date;
  updatedAt: Date;
  color?: string; // for chart visualization
}

export interface HabitSession {
  id: string;
  habitId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in milliseconds
  isActive: boolean;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsedTime: number;
  selectedHabitId: string | null;
}