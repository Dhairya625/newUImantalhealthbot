import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MoodId = "excellent" | "good" | "okay" | "poor" | "awful" | "";

export interface MoodEntry {
  date: string; // ISO date string
  mood: Exclude<MoodId, "">;
  note?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  category: "mindfulness" | "health" | "reflection" | "exercise" | "learning";
  dateCompleted?: string; // ISO date string when habit was completed
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
  mood?: Exclude<MoodId, "">;
}

interface WellnessContextValue {
  // Mood
  todayMood: MoodId;
  setTodayMood: (mood: Exclude<MoodId, "">) => void;
  moodHistory: MoodEntry[];
  addMoodEntry: (mood: Exclude<MoodId, "">, note?: string) => void;

  // Habits
  habits: HabitItem[];
  addHabit: (name: string, category?: HabitItem["category"]) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Todos (lightweight - also mirror into habits)
  todos: TodoItem[];
  addTodos: (todos: Omit<TodoItem, "id" | "completed">[]) => void;

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

const initialHabits: HabitItem[] = [];

const initialMoodHistory: MoodEntry[] = [
  { date: new Date().toISOString().slice(0, 10), mood: "good", note: "Had a productive day at work" },
];

export function WellnessProvider({ children }: { children: React.ReactNode }) {
  const [todayMood, setTodayMoodState] = useState<MoodId>("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(initialMoodHistory);
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

  const setTodayMood = (mood: Exclude<MoodId, "">) => {
    setTodayMoodState(mood);
  };

  const addMoodEntry = (mood: Exclude<MoodId, "">, note?: string) => {
    const entry: MoodEntry = {
      date: new Date().toISOString(),
      mood,
      note,
    };
    setMoodHistory((prev) => [entry, ...prev]);
    setTodayMoodState(mood);
  };

  const addHabit = (name: string, category: HabitItem["category"] = "health") => {
    const exists = habits.some((h) => h.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    const newHabit: HabitItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name,
      completed: false,
      streak: 0,
      category,
    };
    setHabits((prev) => [...prev, newHabit]);
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
            }
          : habit
      )
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const addTodos = (items: Omit<TodoItem, "id" | "completed">[]) => {
    const withIds: TodoItem[] = items.map((t) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      title: t.title,
      category: t.category,
      completed: false,
    }));
    setTodos((prev) => [...withIds, ...prev]);

    // Mirror todos into habits list automatically
    withIds.forEach((t) => addHabit(t.title, t.category));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  // Persist chat to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("pp_chat_messages", JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  // Persist sleep to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("pp_sleep_entries", JSON.stringify(sleepEntries));
    } catch {}
  }, [sleepEntries]);

  // Persist journal to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("pp_journal_entries", JSON.stringify(journalEntries));
    } catch {}
  }, [journalEntries]);

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

  const value = useMemo<WellnessContextValue>(() => ({
    todayMood,
    setTodayMood,
    moodHistory,
    addMoodEntry,
    habits,
    addHabit,
    toggleHabit,
    deleteHabit,
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
  }), [todayMood, moodHistory, habits, todos, chatMessages, sleepEntries, journalEntries]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
}

export function useWellness(): WellnessContextValue {
  const ctx = useContext(WellnessContext);
  if (!ctx) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return ctx;
}


