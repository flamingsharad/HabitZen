
'use client';

import { useState } from "react";
import { Habit, HabitStatus } from "@/lib/types";
import { CheckCircle2, Flame, MinusCircle, XCircle, CircleDashed, Award, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HabitActions } from "@/components/habits/habit-actions";
import { updateHabitStatus } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export function HabitItem({ habit: initialHabit, onStatusChange: onGlobalStatusChange }: { habit: Habit, onStatusChange: () => void }) {
  const [habit, setHabit] = useState(initialHabit);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (habitId: string, newStatus: HabitStatus) => {
    if (isUpdating) return; // Prevent multiple updates

    const originalHabit = { ...habit };
    setIsUpdating(true);
    
    // Optimistic update
    const optimisticHabit = { ...habit, status: newStatus };
    setHabit(optimisticHabit);

    try {
        const { habit: updatedHabit, leveledUp } = await updateHabitStatus(habitId, newStatus);
        
        setHabit(updatedHabit); // Update with actual data from server
        
        // Handle streak toast
        if (newStatus === 'completed') {
            const newStreak = updatedHabit.streak || 0;
            const originalStreak = originalHabit.streak || 0;

            if (newStreak > originalStreak && newStreak > 1) { // Only show for streaks > 1
                toast({
                title: `Streak extended to ${newStreak} days!`,
                description: "You're on fire! Keep up the great work. 🔥",
                action: <Rocket className="h-5 w-5 text-primary" />,
                });
            }
        }
        onGlobalStatusChange(); // Notify parent to refetch all habits for global stats
        
    } catch (error) {
        // Revert on error
        setHabit(originalHabit);
        console.error(error);
        toast({
            title: 'Error',
            description: 'Failed to update habit. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const statusIcon = {
    completed: <CheckCircle2 className="h-5 w-5 text-success" />,
    skipped: <XCircle className="h-5 w-5 text-destructive" />,
    pending: <MinusCircle className="h-5 w-5 text-muted-foreground" />,
    'partially-done': <CircleDashed className="h-5 w-5 text-yellow-500" />,
  }[habit.status || 'pending'];

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isUpdating && "opacity-50 pointer-events-none")}>
        <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted relative">
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : statusIcon}
            </div>
            <div className="flex-1">
                <p className="font-medium">{habit.name}</p>
                {habit.frequency === 'daily' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Flame className="h-4 w-4 text-amber-400" />
                        <span>{habit.streak} day streak</span>
                    </div>
                )}
            </div>
            <HabitActions habit={habit} onStatusChange={handleStatusChange} disabled={isUpdating} />
        </div>
        {habit.frequency !== 'daily' && (
            <div className="flex items-center gap-2">
                 <div className="flex-1">
                    <Progress value={habit.progress || 0} className="h-2 w-full" />
                 </div>
                 <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(habit.progress || 0)}%</span>
            </div>
        )}
    </div>
  );
}
