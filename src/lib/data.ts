

import { User, Habit, HabitLog, HabitStatus, HabitCategory, Reminder, MoodLog, Mood, JournalEntry } from './types';
import { format, subDays, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { auth, db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, runTransaction } from 'firebase/firestore';

export const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
}

const updateHabitProgress = (habit: Habit): Habit => {
    if (habit.frequency === 'daily') {
        habit.progress = habit.status === 'completed' ? 100 : (habit.status === 'partially-done' ? 50 : 0);
        return habit;
    }

    let dateRange;
    const goal = 1; // Simplified for now
    if (habit.frequency === 'weekly') {
        dateRange = eachDayOfInterval({
            start: startOfWeek(new Date(), { weekStartsOn: 1 }),
            end: endOfWeek(new Date(), { weekStartsOn: 1 })
        });
    } else { // monthly
        dateRange = eachDayOfInterval({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
        });
    }

    const completedCount = habit.logs.filter(log => {
        const logDate = new Date(log.date);
        return log.status === 'completed' && dateRange.some(d => format(d, 'yyyy-MM-dd') === format(logDate, 'yyyy-MM-dd'));
    }).length;

    habit.progress = (completedCount / goal) * 100;
    return habit;
}


// --- Data Access Functions ---

export const getUser = async (): Promise<User | null> => {
    const uid = getUserId();
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return {id: uid, ...userDoc.data()} as User;
    }
    return null;
};

export const getHabits = async (): Promise<Habit[]> => {
    const uid = getUserId();
    const habitsCol = collection(db, 'users', uid, 'habits');
    const habitsSnapshot = await getDocs(habitsCol);
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    
    const habits = habitsSnapshot.docs.map(doc => {
        const data = doc.data();
        const habit: Habit = {
            id: doc.id,
            ...data
        } as Habit;
        const todayLog = habit.logs.find(log => log.date === todayStr);
        habit.status = todayLog ? todayLog.status : 'pending';
        return updateHabitProgress(habit);
    });

    return habits;
};

export const getTodaysHabits = async (): Promise<Habit[]> => {
  const allHabits = await getHabits();
  return allHabits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly') return true;
    if (habit.frequency === 'monthly') return true;
    return false;
  }).map(updateHabitProgress);
};

export const getHabitById = async (id: string): Promise<Habit | undefined> => {
  const uid = getUserId();
  const habitDoc = await getDoc(doc(db, 'users', uid, 'habits', id));
  if (habitDoc.exists()) {
      const habit = { id: habitDoc.id, ...habitDoc.data() } as Habit;
       const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
       const todayLog = habit.logs.find(log => log.date === todayStr);
       habit.status = todayLog ? todayLog.status : 'pending';
      return updateHabitProgress(habit);
  }
  return undefined;
}

export const updateUser = async (updatedData: Partial<User>) => {
    const uid = getUserId();
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updatedData);
};

export const addHabit = async (habitData: { name: string; category: HabitCategory; frequency: 'daily' | 'weekly' | 'monthly'; reminder?: Reminder; }) => {
    const uid = getUserId();
    const habitsCol = collection(db, 'users', uid, 'habits');

    // Check for duplicates
    const q = query(habitsCol, where("name", "==", habitData.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error(`A habit with the name "${habitData.name}" already exists.`);
    }

    const newHabit: Omit<Habit, 'id'> = {
        ...habitData,
        streak: 0,
        logs: [],
    };
    const docRef = await addDoc(habitsCol, newHabit);
    return { ...newHabit, id: docRef.id };
}

export const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const uid = getUserId();
    const habitRef = doc(db, 'users', uid, 'habits', id);
    await updateDoc(habitRef, updates);
}

export const deleteHabit = async (id: string) => {
    const uid = getUserId();
    const habitRef = doc(db, 'users', uid, 'habits', id);
    await deleteDoc(habitRef);
}

export const updateHabitStatus = async (id: string, status: HabitStatus): Promise<{ habit: Habit, leveledUp: boolean }> => {
  const uid = getUserId();
  const habitDocRef = doc(db, 'users', uid, 'habits', id);
  let finalHabit: Habit | null = null;
  
  await runTransaction(db, async (transaction) => {
    const habitSnap = await transaction.get(habitDocRef);
    if (!habitSnap.exists()) {
      throw 'Habit not found';
    }

    const habit = { id: habitSnap.id, ...habitSnap.data() } as Habit;
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const oldLog = habit.logs.find((l) => l.date === todayStr);
    const wasCompletedToday = oldLog?.status === 'completed';
    const wasCompletedYesterday = habit.logs.some(
      (l) => l.date === yesterdayStr && l.status === 'completed'
    );

    const newLogs = habit.logs.filter((log) => log.date !== todayStr);
    if (status !== 'pending') {
      newLogs.push({ date: todayStr, status });
    }
    
    let newStreak = habit.streak;
    const isNowCompleted = status === 'completed';

    if (habit.frequency === 'daily') {
      if (isNowCompleted && !wasCompletedToday) {
        newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;
      } else if (!isNowCompleted && wasCompletedToday) {
        newStreak = wasCompletedYesterday ? habit.streak - 1 : 0;
      }
    }
    
    transaction.update(habitDocRef, {
      logs: newLogs,
      streak: Math.max(0, newStreak),
    });

    const updatedHabitOnServer = { ...habit, logs: newLogs, streak: newStreak, status };
    finalHabit = updateHabitProgress(updatedHabitOnServer);
  });

  if (finalHabit === null) {
      throw new Error("Transaction failed to complete.");
  }

  return { habit: finalHabit, leveledUp: false };
};


export const getTodaysMood = async (): Promise<MoodLog | null> => {
    const uid = getUserId();
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const moodLogRef = doc(db, 'users', uid, 'mood_logs', todayStr);
    const moodLogSnap = await getDoc(moodLogRef);
    if(moodLogSnap.exists()) {
        return { id: moodLogSnap.id, ...moodLogSnap.data() } as MoodLog;
    }
    return null;
}

export const getAllMoods = async (): Promise<MoodLog[]> => {
    const uid = getUserId();
    const moodsCol = collection(db, 'users', uid, 'mood_logs');
    const moodsSnapshot = await getDocs(moodsCol);
    return moodsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodLog));
}

export const saveMood = async (mood: Mood, notes?: string): Promise<void> => {
    const uid = getUserId();
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const moodLogRef = doc(db, 'users', uid, 'mood_logs', todayStr);
    await setDoc(moodLogRef, { date: todayStr, mood, notes: notes || '' });
}

export const getJournalEntry = async (date: Date): Promise<JournalEntry | null> => {
    const uid = getUserId();
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const journalRef = doc(db, 'users', uid, 'journal_entries', dateStr);
    const journalSnap = await getDoc(journalRef);
    if(journalSnap.exists()) {
        return { id: journalSnap.id, ...journalSnap.data() } as JournalEntry;
    }
    return null;
};

export const saveJournalEntry = async (date: Date, reflection: string, gratitude: string): Promise<void> => {
    const uid = getUserId();
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const journalRef = doc(db, 'users', uid, 'journal_entries', dateStr);
    await setDoc(journalRef, { date: dateStr, reflection, gratitude });
};

export const createFirestoreUser = async (firebaseUser: any, name?: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const newUser: Omit<User, 'id'> = {
          name: name || firebaseUser.displayName || 'New User',
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || undefined,
          goals: 'Set your goals!',
          dailyRoutine: 'morning',
      };
      await setDoc(userRef, newUser);
    }
}
