
'use client';

import { Habit } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Award, CheckCircle, Flag, Milestone } from "lucide-react";

type TimelineEvent = {
    date: string;
    title: string;
    description: string;
    icon: React.ReactNode;
};

export function ProgressTimeline({ habits }: { habits: Habit[] }) {
    const events: TimelineEvent[] = [];

    habits.forEach(habit => {
        // Habit creation event
        if (habit.logs.length > 0) {
            const firstLog = habit.logs.reduce((oldest, current) => 
                new Date(current.date) < new Date(oldest.date) ? current : oldest
            );
            events.push({
                date: firstLog.date,
                title: "Habit Started",
                description: `You began your journey with "${habit.name}".`,
                icon: <Flag className="h-5 w-5 text-primary" />
            });
        }
        
        // Streak milestone events
        const streakMilestones = [7, 30, 60];
        streakMilestones.forEach(milestone => {
            if (habit.streak >= milestone) {
                // Find the approximate date the milestone was hit
                const completedLogs = habit.logs.filter(l => l.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                if(completedLogs.length >= milestone) {
                    const milestoneDate = completedLogs[completedLogs.length - milestone].date;
                    events.push({
                        date: milestoneDate,
                        title: `Streak Milestone!`,
                        description: `You hit a ${milestone}-day streak for "${habit.name}".`,
                        icon: <Award className="h-5 w-5 text-yellow-500" />
                    });
                }
            }
        });
    });

    // Sort events chronologically
    const sortedEvents = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Deduplicate events to avoid clutter (e.g., multiple streak milestones on same day)
    const uniqueEvents = sortedEvents.filter((event, index, self) =>
        index === self.findIndex((e) => (
            e.date === event.date && e.title === event.title && e.description === event.description
        ))
    );

    if (uniqueEvents.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>Your progress journey will appear here as you complete habits.</p>
                <p className="text-sm">Keep going!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {uniqueEvents.map((event, index) => (
                <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                            {event.icon}
                        </div>
                        {index < uniqueEvents.length -1 && <div className="w-px h-full bg-border" />}
                    </div>
                    <div className="pb-8">
                        <p className="text-sm text-muted-foreground">{format(parseISO(event.date), 'MMMM d, yyyy')}</p>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-muted-foreground">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
