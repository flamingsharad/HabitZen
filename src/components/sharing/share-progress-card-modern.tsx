
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Target, Trophy, CheckCircle, TrendingUp } from "lucide-react";
import { Logo } from "../icons/logo";
import { format } from "date-fns";
import { Progress } from "../ui/progress";

type ShareProgressCardProps = {
    progress: number;
    longestStreak: number;
    completedHabits: number;
    totalHabits: number;
}

export function ShareProgressCardModern({ progress, longestStreak, completedHabits, totalHabits }: ShareProgressCardProps) {
    const { userData } = useAuth();
    
    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-primary/20 shadow-xl bg-background">
            <div className="p-6 bg-primary/10">
                <div className="flex items-center gap-4">
                    <Logo className="h-10 w-10 text-primary" />
                    <div>
                        <p className="font-bold text-xl text-primary-foreground">HabitZen</p>
                        <p className="text-sm text-primary-foreground/80">Progress Report</p>
                    </div>
                    <div className="ml-auto text-right">
                         <p className="font-semibold text-lg">{userData?.name || 'You'}</p>
                         <p className="text-xs text-muted-foreground">{format(new Date(), 'MMMM d, yyyy')}</p>
                    </div>
                </div>
            </div>
            <CardContent className="p-6 grid gap-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                         <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingUp /> Today's Progress</h3>
                         <p className="font-bold text-2xl">{Math.round(progress)}%</p>
                    </div>
                    <Progress value={progress} className="h-3"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <Trophy className="h-8 w-8 text-amber-400"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Longest Streak</p>
                            <p className="text-2xl font-bold">{longestStreak} <span className="text-base font-normal">days</span></p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <CheckCircle className="h-8 w-8 text-green-500"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Habits Done</p>
                            <p className="text-2xl font-bold">{completedHabits}/{totalHabits}</p>
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-3">
                 <p className="text-xs text-muted-foreground text-center w-full">Consistency is the key to success. Keep going!</p>
            </CardFooter>
        </Card>
    );
}
