
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsistencyChart } from "@/components/charts/consistency-chart";
import { StreaksOverviewChart } from "@/components/charts/streaks-overview-chart";
import { getHabits } from "@/lib/data";
import { HabitHeatmap } from "@/components/charts/habit-heatmap";
import { useEffect, useState } from "react";
import { Habit } from "@/lib/types";
import { Loader2, Milestone } from "lucide-react";
import { ProgressTimeline } from "@/components/progress/progress-timeline";

export default function ProgressPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const userHabits = await getHabits();
                setHabits(userHabits);
            } catch (error) {
                console.error("Failed to fetch habits", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, []);
    
    const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const longestStreak = Math.max(...habits.map(h => h.streak), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <div className="grid gap-4 sm:grid-cols-2">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Streak Days</CardDescription>
                        <CardTitle className="text-4xl">{totalStreaks}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Sum of all current habit streaks
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Longest Overall Streak</CardDescription>
                        <CardTitle className="text-4xl">{longestStreak}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                           The best streak you've ever had
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Habit Heatmap</CardTitle>
                    <CardDescription>
                        Your habit completion history for the current month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HabitHeatmap habits={habits} />
                </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Consistency</CardTitle>
                        <CardDescription>
                            Your habit completion rate over the last 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ConsistencyChart habits={habits} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Streaks Overview</CardTitle>
                        <CardDescription>
                            A look at the current streaks for your habits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StreaksOverviewChart habits={habits} />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Milestone className="h-6 w-6 text-primary" />
                        Your Progress Journey
                    </CardTitle>
                    <CardDescription>
                        A timeline of your achievements and milestones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProgressTimeline habits={habits} />
                </CardContent>
            </Card>
        </div>
    );
}
