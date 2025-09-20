
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHabits, getTodaysHabits } from "@/lib/data";
import { Habit } from "@/lib/types";
import { Loader2, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { HabitItem } from "@/components/habits/habit-item";
import { ShareProgressDialog } from "@/components/sharing/share-progress-dialog";
import { MoodTracker } from "@/components/mood/mood-tracker";
import { DashboardSkeleton } from "@/components/layout/dashboard-skeleton";

export default function DashboardPage() {
  const [todaysHabits, setTodaysHabits] = useState<Habit[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refetchHabits = async () => {
    try {
      setLoading(true);
      const [today, all] = await Promise.all([getTodaysHabits(), getHabits()]);
      setTodaysHabits(today);
      setAllHabits(all);
    } catch (error) {
      console.error("Failed to fetch habits", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchHabits();
  }, []);

  const habitsByCategory: Record<string, Habit[]> = todaysHabits.reduce((acc, habit) => {
    const category = habit.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  const totalHabits = todaysHabits.filter(h => h.frequency === 'daily').length;
  const completedHabits = todaysHabits.filter(h => h.status === 'completed' && h.frequency === 'daily').length;
  const progress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  const longestStreak = allHabits.length > 0 ? Math.max(0, ...allHabits.map(h => h.streak)) : 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Progress</CardDescription>
            <CardTitle className="text-4xl">{Math.round(progress)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {completedHabits} of {totalHabits} daily habits completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Longest Streak</CardDescription>
            <CardTitle className="text-4xl">
              {longestStreak} Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Across all habits
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2">
            <CardHeader>
                <CardTitle>How are you feeling today?</CardTitle>
                <CardDescription>Log your mood to see how it correlates with your habits.</CardDescription>
            </CardHeader>
            <CardContent>
                <MoodTracker />
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Today's Habits</h2>
            <div className="flex items-center gap-2">
              <ShareProgressDialog 
                progress={progress}
                longestStreak={longestStreak}
                completedHabits={completedHabits}
                totalHabits={totalHabits}
              />
              <AddHabitDialog onHabitAdded={refetchHabits} />
            </div>
        </div>
        {Object.entries(habitsByCategory).length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(habitsByCategory).map(([category, habits]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {habits.map((habit) => (
                    <HabitItem key={habit.id} habit={habit} onStatusChange={refetchHabits} />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>No habits for today.</p>
                <p className="text-sm">Click the button above to add a new habit!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
