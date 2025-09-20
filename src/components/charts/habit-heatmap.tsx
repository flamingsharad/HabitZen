
"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths, isAfter, startOfDay } from 'date-fns';
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types"
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const futureDateJokes = [
    "Planning to time travel? You can't log habits for the future!",
    "Are you a psychic? Because you're trying to predict your future habits.",
    "Hold your horses! You can't complete habits in a time machine.",
    "Wow, so productive you're already in tomorrow! Or... maybe just a mis-click?",
    "Future-logging is not a feature... yet. Check back yesterday."
];

export function HabitHeatmap({ habits }: { habits: Habit[] }) {
    const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(new Date()));
    const { user } = useAuth();
    const today = startOfDay(new Date());

    const creationDate = user?.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
    const firstMonth = creationDate ? startOfMonth(creationDate) : null;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate completion status for each day
    const dayData = daysInMonth.map(day => {
        if (isAfter(day, today)) {
            const joke = futureDateJokes[Math.floor(Math.random() * futureDateJokes.length)];
            return {
                date: day,
                status: 'none',
                tooltip: joke,
                isFuture: true,
            };
        }

        const dateStr = format(day, 'yyyy-MM-dd');
        const dailyHabits = habits.filter(h => h.frequency === 'daily');
        const logsForDay = dailyHabits.map(h => h.logs.find(l => l.date === dateStr)).filter(Boolean);
        
        const completedCount = logsForDay.filter(l => l?.status === 'completed').length;
        const skippedCount = logsForDay.filter(l => l?.status === 'skipped').length;
        const partialCount = logsForDay.filter(l => l?.status === 'partially-done').length;

        let status: 'completed' | 'skipped' | 'mixed' | 'none' | 'partial' = 'none';
        
        if (completedCount > 0 && skippedCount === 0 && partialCount === 0) {
            status = 'completed';
        } else if (skippedCount > 0 && completedCount === 0 && partialCount === 0) {
            status = 'skipped';
        } else if (partialCount > 0 && completedCount === 0 && skippedCount === 0) {
            status = 'partial';
        }
        else if (logsForDay.length > 0) {
            status = 'mixed';
        }
        
        return {
            date: day,
            status,
            tooltip: logsForDay.length > 0
                ? `${format(day, 'MMMM d')}: ${completedCount} completed, ${partialCount} partial, ${skippedCount} skipped.`
                : `${format(day, 'MMMM d')}: No daily habits logged.`,
            isFuture: false,
        };
    });

    const firstDayOfMonth = getDay(monthStart); // 0 for Sunday, 1 for Monday...

    const getStatusColor = (status: string, isFuture: boolean) => {
        if (isFuture) return 'bg-muted/30';
        switch(status) {
            case 'completed': return 'bg-green-500';
            case 'skipped': return 'bg-red-500';
            case 'partial': return 'bg-yellow-500';
            case 'mixed': return 'bg-purple-500';
            default: return 'bg-muted';
        }
    }
    
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };
    
    const isCurrentCalendarMonth = isSameMonth(currentMonth, today);
    const isFirstMonth = firstMonth ? isSameMonth(currentMonth, firstMonth) : false;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                {isFirstMonth ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <span tabIndex={0} className="animate-pulse-sm rounded-full">
                                <Button variant="outline" size="icon" disabled={true}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </span>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="start" className="w-auto p-2">
                            <p className="text-sm">You cannot view data from before you joined.</p>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
                <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button variant="outline" size="icon" onClick={goToNextMonth} disabled={isCurrentCalendarMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {weekDays.map(day => <div key={day} className="font-semibold text-muted-foreground">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {dayData.map(({ date, status, tooltip, isFuture }) => (
                    <Popover key={format(date, 'yyyy-MM-dd')}>
                        <PopoverTrigger>
                            <div
                                className={cn(
                                    "h-8 w-full rounded-md", 
                                    getStatusColor(status, isFuture),
                                    isSameDay(date, today) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                    !isSameMonth(date, currentMonth) && "opacity-50"
                                )} />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                            <p className="text-sm">{tooltip}</p>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
             <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-muted" /> None</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-green-500" /> Completed</div>
                 <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-yellow-500" /> Partial</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-red-500" /> Skipped</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-purple-500" /> Mixed</div>
            </div>
        </div>
    );
}
