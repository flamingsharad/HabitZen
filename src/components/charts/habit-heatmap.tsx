
"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Habit } from "@/lib/types"

export function HabitHeatmap({ habits }: { habits: Habit[] }) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate completion status for each day
    const dayData = daysInMonth.map(day => {
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
            tooltip: `${format(day, 'MMMM d')}: ${completedCount} completed, ${partialCount} partial, ${skippedCount} skipped.`,
        };
    });

    const firstDayOfMonth = getDay(monthStart); // 0 for Sunday, 1 for Monday...

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'completed': return 'bg-green-500';
            case 'skipped': return 'bg-red-500';
            case 'partial': return 'bg-yellow-500';
            case 'mixed': return 'bg-purple-500';
            default: return 'bg-muted';
        }
    }
    
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <TooltipProvider>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {weekDays.map(day => <div key={day} className="font-semibold text-muted-foreground">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {dayData.map(({ date, status, tooltip }) => (
                     <Tooltip key={format(date, 'yyyy-MM-dd')}>
                        <TooltipTrigger asChild>
                            <div className={cn(
                                "h-8 w-full rounded-md", 
                                getStatusColor(status),
                                isSameDay(date, today) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                !isSameMonth(date, today) && "opacity-50"
                            )} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
             <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-muted" /> None</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-green-500" /> Completed</div>
                 <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-yellow-500" /> Partial</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-red-500" /> Skipped</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-sm bg-purple-500" /> Mixed</div>
            </div>
        </TooltipProvider>
    );
}
