
'use client';

import { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Smile, Frown, Meh, Laugh, Angry, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getTodaysMood, saveMood } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const moods: { mood: Mood, icon: React.ReactNode, label: string }[] = [
    { mood: 1, icon: <Angry />, label: "Angry" },
    { mood: 2, icon: <Frown />, label: "Sad" },
    { mood: 3, icon: <Meh />, label: "Neutral" },
    { mood: 4, icon: <Smile />, label: "Happy" },
    { mood: 5, icon: <Laugh />, label: "Excited" },
];

const moodColors: Record<Mood, string> = {
    1: "bg-red-500/20 text-red-500",
    2: "bg-blue-500/20 text-blue-500",
    3: "bg-gray-500/20 text-gray-500",
    4: "bg-green-500/20 text-green-500",
    5: "bg-yellow-500/20 text-yellow-500",
};

export function MoodTracker() {
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchMood = async () => {
            try {
                const todaysMood = await getTodaysMood();
                if (todaysMood) {
                    setSelectedMood(todaysMood.mood);
                }
            } catch (error) {
                console.error("Failed to fetch today's mood", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMood();
    }, []);

    const handleMoodSelect = async (mood: Mood) => {
        const previousMood = selectedMood;
        setSelectedMood(mood); // Optimistic update
        try {
            await saveMood(mood);
            toast({
                title: "Mood logged!",
                description: `You've logged your mood as ${moods.find(m => m.mood === mood)?.label}.`
            })
        } catch (error) {
            setSelectedMood(previousMood); // Revert on failure
            toast({
                title: "Error",
                description: "Could not save your mood. Please try again.",
                variant: "destructive"
            });
            console.error("Failed to save mood", error);
        }
    }
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-around rounded-full bg-background/50 border p-2">
            {moods.map(({ mood, icon, label }) => (
                <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110",
                        selectedMood === mood ? moodColors[mood] : "text-muted-foreground/50 hover:bg-muted"
                    )}
                    aria-label={`Select mood: ${label}`}
                    title={label}
                >
                    <div className={cn("transition-transform", selectedMood === mood ? "scale-125" : "")}>
                         {icon}
                    </div>
                </button>
            ))}
        </div>
    );
}
