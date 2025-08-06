import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitSession, TimerState } from '@/types/habit';

interface HabitStore {
  habits: Habit[];
  sessions: HabitSession[];
  timer: TimerState;
  
  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  
  // Timer actions
  startTimer: (habitId: string) => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  updateElapsedTime: () => void;
  
  // Session actions
  saveSession: (session: Omit<HabitSession, 'id'>) => void;
  getHabitSessions: (habitId: string) => HabitSession[];
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [
        {
          id: '1',
          name: 'Reading',
          importance: 8,
          resources: ['https://goodreads.com', 'Local library'],
          description: 'Daily reading to expand knowledge and vocabulary',
          goal: '1 hour/day',
          timeSpent: 3600000, // 1 hour in ms
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#2563eb'
        },
        {
          id: '2', 
          name: 'Exercise',
          importance: 9,
          resources: ['Gym membership', 'YouTube fitness channels'],
          description: 'Regular physical activity for health and wellness',
          goal: '45 mins/day',
          timeSpent: 2700000, // 45 mins in ms
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#dc2626'
        },
        {
          id: '3',
          name: 'Meditation',
          importance: 7,
          resources: ['Headspace app', 'Calm app'],
          description: 'Mindfulness practice for mental clarity',
          goal: '20 mins/day',
          timeSpent: 1200000, // 20 mins in ms
          createdAt: new Date(),
          updatedAt: new Date(),
          color: '#059669'
        }
      ],
      sessions: [],
      timer: {
        isRunning: false,
        startTime: null,
        elapsedTime: 0,
        selectedHabitId: null
      },

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          timeSpent: 0
        };
        set((state) => ({
          habits: [...state.habits, newHabit]
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map(habit =>
            habit.id === id 
              ? { ...habit, ...updates, updatedAt: new Date() }
              : habit
          )
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter(habit => habit.id !== id),
          sessions: state.sessions.filter(session => session.habitId !== id)
        }));
      },

      startTimer: (habitId) => {
        set({
          timer: {
            isRunning: true,
            startTime: Date.now(),
            elapsedTime: 0,
            selectedHabitId: habitId
          }
        });
      },

      pauseTimer: () => {
        const { timer } = get();
        if (timer.isRunning && timer.startTime) {
          const additionalTime = Date.now() - timer.startTime;
          set({
            timer: {
              ...timer,
              isRunning: false,
              elapsedTime: timer.elapsedTime + additionalTime,
              startTime: null
            }
          });
        }
      },

      stopTimer: () => {
        const { timer, habits } = get();
        if (timer.selectedHabitId) {
          // Save session
          const totalTime = timer.isRunning && timer.startTime 
            ? timer.elapsedTime + (Date.now() - timer.startTime)
            : timer.elapsedTime;
            
          if (totalTime > 0) {
            get().saveSession({
              habitId: timer.selectedHabitId,
              startTime: new Date(Date.now() - totalTime),
              endTime: new Date(),
              duration: totalTime,
              isActive: false
            });
            
            // Update habit's total time
            const habit = habits.find(h => h.id === timer.selectedHabitId);
            if (habit) {
              get().updateHabit(habit.id, {
                timeSpent: habit.timeSpent + totalTime
              });
            }
          }
        }
        
        set({
          timer: {
            isRunning: false,
            startTime: null,
            elapsedTime: 0,
            selectedHabitId: null
          }
        });
      },

      updateElapsedTime: () => {
        const { timer } = get();
        if (timer.isRunning && timer.startTime) {
          set({
            timer: {
              ...timer,
              elapsedTime: timer.elapsedTime + (Date.now() - timer.startTime),
              startTime: Date.now()
            }
          });
        }
      },

      saveSession: (sessionData) => {
        const newSession: HabitSession = {
          ...sessionData,
          id: crypto.randomUUID()
        };
        set((state) => ({
          sessions: [...state.sessions, newSession]
        }));
      },

      getHabitSessions: (habitId) => {
        return get().sessions.filter(session => session.habitId === habitId);
      }
    }),
    {
      name: 'habit-storage'
    }
  )
);