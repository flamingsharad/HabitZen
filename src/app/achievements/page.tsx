
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHabits } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Flame, Star, Zap, Crown, Shield, Loader2 } from "lucide-react";
import { Habit } from "@/lib/types";
import { useEffect, useState } from "react";
import { AchievementsSkeleton } from "@/components/layout/achievements-skeleton";

type Achievement = {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    isUnlocked: (habits: any[]) => boolean;
};

const achievements: Achievement[] = [
    {
        id: 'streak-7',
        name: 'Weekly Warrior',
        description: 'Maintain a 7-day streak on any habit.',
        icon: <Flame className="h-8 w-8" />,
        isUnlocked: (habits) => habits.some(h => h.streak >= 7),
    },
    {
        id: 'streak-30',
        name: 'Month of Mastery',
        description: 'Maintain a 30-day streak on any habit.',
        icon: <Star className="h-8 w-8" />,
        isUnlocked: (habits) => habits.some(h => h.streak >= 30),
    },
    {
        id: 'completed-100',
        name: 'Habit Centurion',
        description: 'Complete 100 habit entries in total.',
        icon: <Zap className="h-8 w-8" />,
        isUnlocked: (habits) => habits.reduce((sum, h) => sum + h.logs.filter(l => l.status === 'completed').length, 0) >= 100,
    },
    {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Achieve a 60-day streak.',
        icon: <Crown className="h-8 w-8" />,
        isUnlocked: (habits) => habits.some(h => h.streak >= 60),
    },
    {
        id: 'perfect-week',
        name: 'Perfect Week',
        description: 'Complete all daily habits for 7 consecutive days.',
        icon: <Shield className="h-8 w-8" />,
        isUnlocked: (habits) => {
            const dailyHabits = habits.filter(h => h.frequency === 'daily');
            if (dailyHabits.length === 0) return false;
            // This is a simplified check. A real implementation would need more detailed log analysis.
            return dailyHabits.every(h => h.streak >= 7);
        }
    },
    {
        id: 'polymath',
        name: 'Polymath',
        description: 'Have active habits in 4 different categories.',
        icon: <Zap className="h-8 w-8" />,
        isUnlocked: (habits) => {
            const activeCategories = new Set(habits.filter(h => h.streak > 0).map(h => h.category));
            return activeCategories.size >= 4;
        }
    }
];

function AchievementCard({ achievement, unlocked }: { achievement: Achievement, unlocked: boolean }) {
    return (
        <Card className={cn("flex flex-col items-center justify-center p-6 text-center transition-all", unlocked ? "border-primary-foreground/20 bg-primary/10" : "bg-muted/50")}>
            <div className={cn("mb-4", unlocked ? "text-primary" : "text-muted-foreground")}>
                {achievement.icon}
            </div>
            <h3 className="text-lg font-semibold">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {unlocked && <div className="mt-2 text-xs font-bold text-primary">UNLOCKED</div>}
        </Card>
    )
}

export default function AchievementsPage() {
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

    if (loading) {
        return <AchievementsSkeleton />;
    }

    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Achievements</CardTitle>
                    <CardDescription>
                        Unlock badges by completing milestones and staying consistent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {achievements.map((ach) => (
                            <AchievementCard
                                key={ach.id}
                                achievement={ach}
                                unlocked={ach.isUnlocked(habits)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
