
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Target, Trophy } from "lucide-react";
import { Logo } from "../icons/logo";
import { format } from "date-fns";

type ShareProgressCardProps = {
    progress: number;
    longestStreak: number;
    completedHabits: number;
    totalHabits: number;
}

export function ShareProgressCard({ progress, longestStreak, completedHabits, totalHabits }: ShareProgressCardProps) {
    const { userData } = useAuth();
    
    return (
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/10 to-background">
            <CardHeader className="flex flex-row items-center gap-4">
                 <Logo className="h-10 w-10 text-primary" />
                 <div>
                    <CardTitle className="text-2xl">My HabitZen Progress</CardTitle>
                    <CardDescription>{format(new Date(), 'MMMM d, yyyy')}</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                    <div>
                        <p className="text-sm text-muted-foreground">Today's Progress</p>
                        <p className="text-3xl font-bold">{Math.round(progress)}%</p>
                    </div>
                    <div className="relative h-20 w-20">
                        <svg className="h-full w-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted/20" strokeWidth="2"></circle>
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray={`${progress}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"></circle>
                        </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Target className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/50">
                        <Trophy className="h-8 w-8 text-amber-400 mb-2"/>
                        <p className="text-2xl font-bold">{longestStreak}</p>
                        <p className="text-sm text-muted-foreground">Longest Streak</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/50">
                        <Flame className="h-8 w-8 text-red-500 mb-2"/>
                        <p className="text-2xl font-bold">{completedHabits}/{totalHabits}</p>
                        <p className="text-sm text-muted-foreground">Habits Done</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-center">
                <p className="text-lg font-semibold">Keep Going, {userData?.name || 'You'}!</p>
                <p className="text-xs text-muted-foreground">Powered by HabitZen</p>
            </CardFooter>
        </Card>
    );
}
