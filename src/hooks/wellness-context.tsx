import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// TypeScript declaration for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      opts?: IdleRequestOptions
    ) => number;
  }
}

export type StressLevel = "very-low" | "low" | "moderate" | "high" | "very-high" | "";

export interface StressEntry {
  date: string; // ISO date string
  stressLevel: Exclude<StressLevel, "">;
  note?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  category: "mindfulness" | "health" | "reflection" | "exercise" | "learning";
  dateCompleted?: string; // ISO date string when habit was completed
  dailyCompletions: string[]; // Array of ISO date strings for daily completions
}

export interface DailyHabitCompletion {
  date: string; // ISO date string (YYYY-MM-DD)
  habitIds: string[]; // Array of habit IDs completed on this date
  totalHabits: number; // Total habits available on this date
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  category: HabitItem["category"];
}

export type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string; // ISO string
};

export interface SleepEntry {
  id: string;
  date: string; // ISO date (YYYY-MM-DD) representing the wake-up day
  bedtime: string; // HH:MM (24h)
  wakeup: string; // HH:MM (24h)
  durationMinutes: number;
  quality: "excellent" | "good" | "fair" | "poor";
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  stressLevel?: Exclude<StressLevel, "">;
}

interface WellnessContextValue {
  // Stress
  todayStressLevel: StressLevel;
  setTodayStressLevel: (stressLevel: Exclude<StressLevel, "">) => void;
  stressHistory: StressEntry[];
  addStressEntry: (stressLevel: Exclude<StressLevel, "">, note?: string) => void;

  // Habits
  habits: HabitItem[];
  addHabit: (name: string, category?: HabitItem["category"]) => boolean;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  getDailyHabitCompletions: (days?: number) => DailyHabitCompletion[];

  // Todos (lightweight - also mirror into habits)
  todos: TodoItem[];
  addTodos: (todos: Omit<TodoItem, "id" | "completed">[]) => string[];

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;

  // Sleep
  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: Omit<SleepEntry, "id">) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  updateJournalEntry: (id: string, entry: Partial<Omit<JournalEntry, "id">>) => void;
  deleteJournalEntry: (id: string) => void;
}

const WellnessContext = createContext<WellnessContextValue | undefined>(undefined);

const initialHabits: HabitItem[] = [
  {
    id: "1",
    name: "Morning Meditation",
    completed: false,
    streak: 5,
    category: "mindfulness",
    dailyCompletions: [
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    ]
  },
  {
    id: "2",
    name: "Daily Exercise",
    completed: false,
    streak: 3,
    category: "exercise",
    dailyCompletions: [
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    ]
  },
  {
    id: "3",
    name: "Journal Writing",
    completed: false,
    streak: 7,
    category: "reflection",
    dailyCompletions: [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    ]
  }
];

const initialStressHistory: StressEntry[] = [
  { date: new Date().toISOString().slice(0, 10), stressLevel: "moderate", note: "Had a productive day at work" },
];

export function WellnessProvider({ children }: { children: React.ReactNode }) {
  const [todayStressLevel, setTodayStressLevelState] = useState<StressLevel>("");
  const [stressHistory, setStressHistory] = useState<StressEntry[]>(initialStressHistory);
  const [habits, setHabits] = useState<HabitItem[]>(initialHabits);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm here to support you on your wellness journey. How are you feeling today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Hydrate chat from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pp_chat_messages");
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages(parsed);
        }
      }
    } catch {}
  }, []);

  // Hydrate sleep from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pp_sleep_entries");
      if (raw) {
        const parsed = JSON.parse(raw) as SleepEntry[];
        if (Array.isArray(parsed)) setSleepEntries(parsed);
      }
    } catch {}
  }, []);

  // Hydrate journal entries from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pp_journal_entries");
      if (raw) {
        const parsed = JSON.parse(raw) as JournalEntry[];
        if (Array.isArray(parsed)) setJournalEntries(parsed);
      }
    } catch {}
  }, []);

  // Hydrate stress data from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pp_stress_history");
      if (raw) {
        const parsed = JSON.parse(raw) as StressEntry[];
        if (Array.isArray(parsed)) setStressHistory(parsed);
      }
      const todayStress = localStorage.getItem("pp_today_stress_level");
      if (todayStress) {
        setTodayStressLevelState(todayStress as StressLevel);
      }
    } catch {}
  }, []);

  const setTodayStressLevel = (stressLevel: Exclude<StressLevel, "">) => {
    setTodayStressLevelState(stressLevel);
  };

  const addStressEntry = (stressLevel: Exclude<StressLevel, "">, note?: string) => {
    const entry: StressEntry = {
      date: new Date().toISOString(),
      stressLevel,
      note,
    };
    setStressHistory((prev) => [entry, ...prev]);
    setTodayStressLevelState(stressLevel);
  };

  const addHabit = (name: string, category: HabitItem["category"] = "health"): boolean => {
    // Enhanced deduplication logic
    const normalizedName = name.toLowerCase().trim();
    
    // Check for exact matches first
    const exactExists = habits.some((h) => h.name.toLowerCase().trim() === normalizedName);
    if (exactExists) return false;
    
    // Check for similar habits using improved similarity detection
    const similarExists = habits.some((h) => {
      const habitName = h.name.toLowerCase().trim();
      
      // Direct similarity checks
      if (habitName === normalizedName) return true;
      
      // Check for common variations and synonyms
      const variations = [
        // Reading variations
        { from: /^read(ing)?\s+(a\s+)?book/, to: /^read(ing)?\s+(a\s+)?book/ },
        { from: /^walk(ing)?/, to: /^walk(ing)?/ },
        { from: /^meditat(ion|ing)?/, to: /^meditat(ion|ing)?/ },
        { from: /^journal(ing)?/, to: /^journal(ing)?/ },
        { from: /^breath(ing)?/, to: /^breath(ing)?/ },
        { from: /^hydrat(e|ing)?/, to: /^hydrat(e|ing)?/ },
        { from: /^exercis(e|ing)?/, to: /^exercis(e|ing)?/ },
        { from: /^learn(ing)?/, to: /^learn(ing)?/ },
      ];
      
      // Check if both names match the same variation pattern
      for (const variation of variations) {
        if (variation.from.test(normalizedName) && variation.to.test(habitName)) {
          return true;
        }
      }
      
      // Check for word overlap (if more than 70% of words match)
      const nameWords = normalizedName.split(/\s+/).filter(w => w.length > 2);
      const habitWords = habitName.split(/\s+/).filter(w => w.length > 2);
      
      if (nameWords.length > 0 && habitWords.length > 0) {
        const commonWords = nameWords.filter(word => 
          habitWords.some(habitWord => 
            habitWord.includes(word) || word.includes(habitWord)
          )
        );
        const similarity = commonWords.length / Math.max(nameWords.length, habitWords.length);
        if (similarity > 0.7) return true;
      }
      
      return false;
    });
    
    if (similarExists) return false;
    
    const newHabit: HabitItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name,
      completed: false,
      streak: 0,
      category,
      dailyCompletions: [],
    };
    setHabits((prev) => [...prev, newHabit]);
    return true;
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completed: !habit.completed,
              streak: habit.completed ? habit.streak : habit.streak + 1,
              dateCompleted: !habit.completed ? new Date().toISOString().slice(0, 10) : undefined,
              dailyCompletions: habit.completed ? habit.dailyCompletions : [...habit.dailyCompletions, new Date().toISOString().slice(0, 10)],
            }
          : habit
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Get daily habit completion data for streak bar
  const getDailyHabitCompletions = (days: number = 30): DailyHabitCompletion[] => {
    const today = new Date();
    const completions: DailyHabitCompletion[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().slice(0, 10);
      
      const completedHabits = habits.filter(h => 
        h.dailyCompletions.includes(dateString)
      );
      
      completions.push({
        date: dateString,
        habitIds: completedHabits.map(h => h.id),
        totalHabits: habits.length
      });
    }
    
    return completions;
  };

  const addTodos = (items: Omit<TodoItem, "id" | "completed">[]) => {
    const withIds: TodoItem[] = items.map((t) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title: t.title,
      category: t.category,
      completed: false,
    }));
    setTodos((prev) => [...withIds, ...prev]);

    // Mirror todos into habits list automatically, but only add new ones
    const newHabitsAdded: string[] = [];
    withIds.forEach((t) => {
      const wasAdded = addHabit(t.title, t.category);
      if (wasAdded) {
        newHabitsAdded.push(t.title);
      }
    });
    
    return newHabitsAdded; // Return list of actually added habits
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };



  const addSleepEntry = (entry: Omit<SleepEntry, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const item: SleepEntry = { id, ...entry };
    setSleepEntries((prev) => {
      // Replace existing entry for same date (wake day)
      const withoutSameDate = prev.filter((e) => e.date !== entry.date);
      return [item, ...withoutSameDate];
    });
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const item: JournalEntry = { id, ...entry };
    setJournalEntries((prev) => [item, ...prev]);
  };

  const updateJournalEntry = (id: string, updatedEntry: Partial<Omit<JournalEntry, "id">>) => {
    setJournalEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  // Optimized localStorage persistence with batching and error handling
  useEffect(() => {
    const persistData = () => {
      try {
        // Batch localStorage operations
        const dataToPersist = {
          pp_chat_messages: chatMessages,
          pp_sleep_entries: sleepEntries,
          pp_journal_entries: journalEntries,
          pp_habits: habits,
          pp_todos: todos,
          pp_stress_history: stressHistory,
          pp_today_stress_level: todayStressLevel
        };
        
        // Use requestIdleCallback for non-blocking persistence
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            Object.entries(dataToPersist).forEach(([key, value]) => {
              try {
                localStorage.setItem(key, JSON.stringify(value));
              } catch (err) {
                console.warn(`Failed to persist ${key}:`, err);
              }
            });
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          Object.entries(dataToPersist).forEach(([key, value]) => {
            try {
              localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
              console.warn(`Failed to persist ${key}:`, err);
            }
          });
        }
      } catch (err) {
        console.warn('Failed to persist wellness data:', err);
      }
    };
    
    // Debounce persistence to avoid excessive writes
    const timeoutId = setTimeout(persistData, 100);
    return () => clearTimeout(timeoutId);
          }, [chatMessages, sleepEntries, journalEntries, habits, todos, stressHistory, todayStressLevel]);

  const value = useMemo<WellnessContextValue>(() => ({
    todayStressLevel,
    setTodayStressLevel,
    stressHistory,
    addStressEntry,
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
    getDailyHabitCompletions,
    todos,
    addTodos,
    chatMessages,
    addChatMessage,
    sleepEntries,
    addSleepEntry,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  }), [todayStressLevel, stressHistory, habits, todos, chatMessages, sleepEntries, journalEntries]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness(): WellnessContextValue {
  const ctx = useContext(WellnessContext);
  if (!ctx) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return ctx;
}


