
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  IdTokenResult,
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, Unsubscribe, query } from 'firebase/firestore';
import type { User, Habit } from '@/lib/types';
import { useToast } from './use-toast';

// This function will check for a user document and create it if it doesn't exist.
// It's the single source of truth for user data creation.
const getOrCreateUserDocument = async (firebaseUser: FirebaseUser, name?: string): Promise<User> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
    } else {
        const newUser: Omit<User, 'id'> = {
            name: name || firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            avatarUrl: firebaseUser.photoURL || undefined,
            goals: 'Set your goals!',
            dailyRoutine: 'morning',
            lastStreakCheck: '',
        };
        await setDoc(userDocRef, newUser);
        return { id: firebaseUser.uid, ...newUser };
    }
}

// --- Real-time Habit Sync Logic ---
const useHabitSync = (user: FirebaseUser | null) => {
    const { toast } = useToast();
    const habitsRef = useRef<Map<string, Habit>>(new Map());
    // Use a ref to track if the initial data load is complete.
    const isInitialLoadComplete = useRef(false);

    useEffect(() => {
        if (!user) {
            isInitialLoadComplete.current = false;
            return;
        }

        const habitsQuery = query(collection(db, 'users', user.uid, 'habits'));
        const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
            const currentHabits = habitsRef.current;
            const newHabits = new Map<string, Habit>();

            snapshot.docs.forEach(docSnap => {
                newHabits.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Habit);
            });

            // Only run notification logic after the initial data has been loaded.
            if (isInitialLoadComplete.current) {
                 newHabits.forEach((newHabit, id) => {
                    const oldHabit = currentHabits.get(id);
                    if (oldHabit) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const oldLog = oldHabit.logs.find(l => l.date === todayStr);
                        const newLog = newHabit.logs.find(l => l.date === todayStr);

                        const wasCompleted = oldLog?.status === 'completed';
                        const isNowCompleted = newLog?.status === 'completed';

                        // If the habit was just completed, show a notification.
                        if (!wasCompleted && isNowCompleted) {
                            // This is a simple way to avoid notifying the device that made the change.
                            // A more robust solution would use a unique device ID.
                            if (!document.hasFocus()) {
                                toast({
                                    title: 'Habit Completed!',
                                    description: `You've completed "${newHabit.name}" on another device.`,
                                });
                            }
                        }
                    }
                });
            } else {
                // The first time the snapshot runs, just populate the data.
                isInitialLoadComplete.current = true;
            }

            // Update the reference with the latest data for the next comparison.
            habitsRef.current = newHabits;
        }, (error) => {
            console.error("Error listening to habit changes:", error);
        });

        // Cleanup on unmount or user change
        return () => {
            unsubscribe();
            isInitialLoadComplete.current = false;
        };
    }, [user, toast]);
}


// --- Interceptor to add Auth token to server actions ---
// This is a critical piece for making server actions work with authentication.
// It intercepts fetch requests to add the Firebase auth token.
const useAuthInterceptor = () => {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const isServerAction = typeof input === 'string' && (input.includes('?_rsc') || input.includes('?_sc_action'));

      if (isServerAction && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          const headers = new Headers(init?.headers);
          headers.set('Authorization', `Bearer ${token}`);
          
          const newInit = { ...init, headers };
          return originalFetch(input, newInit);
        } catch (error) {
          console.error('Failed to get auth token for server action:', error);
          // Proceed without the token if it fails, server will handle unauthenticated request
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch; // Restore original fetch on cleanup
    };
  }, []);
};


interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Activate our real-time sync and auth interceptor hooks
  useHabitSync(user);
  useAuthInterceptor();
  
  const refreshUserData = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } catch (error) {
        console.error("Error refreshing user data: ", error);
      }
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDocData = await getOrCreateUserDocument(firebaseUser);
        setUser(firebaseUser);
        setUserData(userDocData);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // onAuthStateChanged will handle creating the user doc
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
     // onAuthStateChanged will handle fetching the user doc
  };
  
  const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
        // Silently ignore popup closed by user, re-throw other errors.
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userData,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
