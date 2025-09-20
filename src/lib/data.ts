

import { User, Habit, HabitLog, HabitStatus, HabitCategory, Reminder, MoodLog, Mood, JournalEntry } from './types';
import { format, subDays, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns';
import { auth, db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp, runTransaction, writeBatch, arrayUnion } from 'firebase/firestore';
import { encrypt, decrypt } from './encryption';

export const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated. This function should only be called from the client-side.");
    return user.uid;
}

const checkAndResetStreaks = async (): Promise<void> => {
    const uid = getUserId();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as User | undefined;
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');

    // Only run once per day
    if (userData?.lastStreakCheck === todayStr) {
        return;
    }

    const habitsCol = collection(db, 'users', uid, 'habits');
    const habitsSnapshot = await getDocs(habitsCol);
    const batch = writeBatch(db);

    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    habitsSnapshot.forEach(docSnap => {
        const habit = { id: docSnap.id, ...docSnap.data() } as Habit;

        if (habit.frequency === 'daily' && habit.streak > 0) {
            const todayLog = habit.logs.find(log => log.date === todayStr);
            const yesterdayLog = habit.logs.find(log => log.date === yesterdayStr);

            // If user has already completed the habit today, don't reset the streak yet.
            if (todayLog && todayLog.status === 'completed') {
                return;
            }
            
            // If there's no completed log for yesterday, the streak is broken.
            if (!yesterdayLog || yesterdayLog.status !== 'completed') {
                const habitRef = doc(db, 'users', uid, 'habits', habit.id);
                batch.update(habitRef, { streak: 0 });
            }
        }
    });

    await batch.commit();

    // Update the last check date on the user document
    await updateDoc(userRef, { lastStreakCheck: todayStr });
};


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
    await checkAndResetStreaks(); // Check streaks before getting habits

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

export const updateUser = async (updatedData: Partial<User>, uid?: string) => {
    const userId = uid || getUserId();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updatedData);
};

export const updateUserFCMToken = async (token: string) => {
    const uid = getUserId();
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        fcmTokens: arrayUnion(token)
    });
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
    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    const oldLog = habit.logs.find((l) => l.date === todayStr);
    const wasCompletedToday = oldLog?.status === 'completed';
    
    // Check if the habit was completed yesterday
    const yesterdayLog = habit.logs.find(l => l.date === yesterdayStr);
    const wasCompletedYesterday = yesterdayLog?.status === 'completed';

    const newLogs = habit.logs.filter((log) => log.date !== todayStr);
    if (status !== 'pending') {
      newLogs.push({ date: todayStr, status });
    }
    
    let newStreak = habit.streak;
    const isNowCompleted = status === 'completed';

    if (habit.frequency === 'daily') {
      if (isNowCompleted && !wasCompletedToday) {
        // If completed yesterday, increment streak. Otherwise, start a new streak.
        newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;
      } else if (!isNowCompleted && wasCompletedToday) {
        // If it was completed today and we are un-completing it
        // The streak should be what it was at the start of the day.
        newStreak = wasCompletedYesterday ? habit.streak -1 : 0;
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
        const entry = { id: journalSnap.id, ...journalSnap.data() } as JournalEntry;
        entry.reflection = decrypt(entry.reflection);
        entry.gratitude = decrypt(entry.gratitude);
        return entry;
    }
    return null;
};

export const getAllJournalEntries = async (): Promise<JournalEntry[]> => {
    const uid = getUserId();
    const journalCol = collection(db, 'users', uid, 'journal_entries');
    const journalSnapshot = await getDocs(journalCol);
    return journalSnapshot.docs.map(doc => {
        const entry = { id: doc.id, ...doc.data() } as JournalEntry;
        entry.reflection = decrypt(entry.reflection);
        entry.gratitude = decrypt(entry.gratitude);
        return entry;
    });
};

export const saveJournalEntry = async (date: Date, reflection: string, gratitude: string): Promise<void> => {
    const uid = getUserId();
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const journalRef = doc(db, 'users', uid, 'journal_entries', dateStr);
    
    const encryptedReflection = encrypt(reflection);
    const encryptedGratitude = encrypt(gratitude);

    await setDoc(journalRef, { date: dateStr, reflection: encryptedReflection, gratitude: encryptedGratitude });
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
          lastStreakCheck: '',
      };
      await setDoc(userRef, newUser);
    }
}
