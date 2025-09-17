

export type HabitStatus = 'completed' | 'skipped' | 'pending' | 'partially-done';

export type HabitCategory = 'Health' | 'Study' | 'Work' | 'Personal' | 'Fitness' | 'Productivity' | 'Other';

export type Reminder = {
  type: 'specific_time' | 'interval';
  value: string; // "09:00" for specific_time, "1h", "3h" for interval
};

export type Habit = {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  status?: HabitStatus; // Today's status for daily habits
  logs: HabitLog[];
  progress?: number; // for weekly/monthly goals
  reminder?: Reminder;
};

export type HabitLog = {
  date: string; // YYYY-MM-DD
  status: HabitStatus;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  goals: string;
  dailyRoutine?: 'morning' | 'night';
};

export type Mood = 1 | 2 | 3 | 4 | 5;

export type MoodLog = {
    id: string;
    date: string; // YYYY-MM-DD
    mood: Mood;
    notes?: string;
}

export type JournalEntry = {
    id: string;
    date: string; // YYYY-MM-DD
    reflection: string;
    gratitude: string;
}
