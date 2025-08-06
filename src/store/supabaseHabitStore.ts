import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Habit, HabitSession, TimerState } from '@/types/habit';
import { useToast } from '@/hooks/use-toast';

interface SupabaseHabitStore {
  habits: Habit[];
  sessions: HabitSession[];
  timer: TimerState;
  loading: boolean;
  
  // Habit actions
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  
  // Timer actions
  startTimer: (habitId: string) => void;
  pauseTimer: () => void;
  stopTimer: () => Promise<void>;
  updateElapsedTime: () => void;
  
  // Session actions
  saveSession: (session: Omit<HabitSession, 'id'>) => Promise<void>;
  fetchSessions: () => Promise<void>;
  getHabitSessions: (habitId: string) => HabitSession[];
}

export const useSupabaseHabitStore = create<SupabaseHabitStore>((set, get) => ({
  habits: [],
  sessions: [],
  timer: {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    selectedHabitId: null
  },
  loading: false,

  fetchHabits: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const habits: Habit[] = data.map(habit => ({
        id: habit.id,
        name: habit.name,
        description: habit.description || '',
        importance: habit.importance,
        goal: habit.goal,
        resources: habit.resources || [],
        timeSpent: habit.time_spent || 0,
        color: habit.color || '#2563eb',
        createdAt: new Date(habit.created_at),
        updatedAt: new Date(habit.updated_at)
      }));

      set({ habits });
    } catch (error: any) {
      console.error('Error fetching habits:', error);
    } finally {
      set({ loading: false });
    }
  },

  addHabit: async (habitData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitData.name,
          description: habitData.description,
          importance: habitData.importance,
          goal: habitData.goal,
          resources: habitData.resources || [],
          color: habitData.color || '#2563eb'
        })
        .select()
        .single();

      if (error) throw error;

      const newHabit: Habit = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        importance: data.importance,
        goal: data.goal,
        resources: data.resources || [],
        timeSpent: data.time_spent || 0,
        color: data.color || '#2563eb',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      set(state => ({ habits: [newHabit, ...state.habits] }));
    } catch (error: any) {
      console.error('Error adding habit:', error);
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.importance !== undefined) dbUpdates.importance = updates.importance;
      if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
      if (updates.resources !== undefined) dbUpdates.resources = updates.resources;
      if (updates.timeSpent !== undefined) dbUpdates.time_spent = updates.timeSpent;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      const { error } = await supabase
        .from('habits')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        habits: state.habits.map(habit =>
          habit.id === id 
            ? { ...habit, ...updates, updatedAt: new Date() }
            : habit
        )
      }));
    } catch (error: any) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        habits: state.habits.filter(habit => habit.id !== id),
        sessions: state.sessions.filter(session => session.habitId !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting habit:', error);
      throw error;
    }
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

  stopTimer: async () => {
    const { timer, habits } = get();
    if (timer.selectedHabitId) {
      const totalTime = timer.isRunning && timer.startTime 
        ? timer.elapsedTime + (Date.now() - timer.startTime)
        : timer.elapsedTime;
        
      if (totalTime > 0) {
        await get().saveSession({
          habitId: timer.selectedHabitId,
          startTime: new Date(Date.now() - totalTime),
          endTime: new Date(),
          duration: totalTime,
          isActive: false
        });
        
        const habit = habits.find(h => h.id === timer.selectedHabitId);
        if (habit) {
          await get().updateHabit(habit.id, {
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

  saveSession: async (sessionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('habit_sessions')
        .insert({
          user_id: user.id,
          habit_id: sessionData.habitId,
          start_time: sessionData.startTime.toISOString(),
          end_time: sessionData.endTime.toISOString(),
          duration: sessionData.duration,
          is_active: sessionData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: HabitSession = {
        id: data.id,
        habitId: data.habit_id,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        duration: data.duration,
        isActive: data.is_active
      };

      set(state => ({ sessions: [...state.sessions, newSession] }));
    } catch (error: any) {
      console.error('Error saving session:', error);
      throw error;
    }
  },

  fetchSessions: async () => {
    try {
      const { data, error } = await supabase
        .from('habit_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions: HabitSession[] = data.map(session => ({
        id: session.id,
        habitId: session.habit_id,
        startTime: new Date(session.start_time),
        endTime: new Date(session.end_time),
        duration: session.duration,
        isActive: session.is_active
      }));

      set({ sessions });
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    }
  },

  getHabitSessions: (habitId) => {
    return get().sessions.filter(session => session.habitId === habitId);
  }
}));