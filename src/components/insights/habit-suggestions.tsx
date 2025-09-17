
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Sparkles, BrainCircuit, Layers } from "lucide-react";
import {
  receivePersonalizedHabitSuggestions,
  PersonalizedHabitSuggestionsOutput,
} from "@/ai/flows/receive-personalized-habit-suggestions";
import {
    getHabitStackingSuggestions,
    HabitStackingSuggestionsOutput,
    SuggestedHabitStack,
} from "@/ai/flows/get-habit-stacking-suggestions";
import { getHabits } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { SuggestedHabitAdder } from "./suggested-habit-adder";
import { useRouter } from "next/navigation";
import { SuggestedHabit } from "@/ai/flows/receive-personalized-habit-suggestions";

function SuggestedHabitCard({ habit, onHabitAdded }: { habit: SuggestedHabit, onHabitAdded: () => void }) {
    return (
        <div className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{habit.habitName}</h4>
                    <Badge variant="secondary">{habit.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{habit.reasoning}</p>
            </div>
            <SuggestedHabitAdder habit={habit} onHabitAdded={onHabitAdded} />
        </div>
    )
}

function SuggestedStackCard({ stack, onHabitAdded }: { stack: SuggestedHabitStack, onHabitAdded: () => void }) {
    const newHabit = {
        habitName: stack.newHabitName,
        category: stack.category,
        reasoning: stack.reasoning,
    }
    return (
        <div className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold">After <span className="text-primary">{stack.baseHabitName}</span>, do <span className="text-primary">{stack.newHabitName}</span></h4>
                    <Badge variant="secondary">{stack.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stack.reasoning}</p>
            </div>
            <SuggestedHabitAdder habit={newHabit} onHabitAdded={onHabitAdded} />
        </div>
    )
}


export function HabitSuggestions() {
  const [loading, setLoading] = useState<'general' | 'stacking' | false>(false);
  const [suggestions, setSuggestions] = useState<PersonalizedHabitSuggestionsOutput | null>(null);
  const [stackSuggestions, setStackSuggestions] = useState<HabitStackingSuggestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("I want to improve my sleep quality and reduce stress.");
  const { userData } = useAuth();
  const router = useRouter();

  const handleGetSuggestions = async () => {
    if (!userData) {
        setError("Please log in to get suggestions.");
        return;
    }

    setLoading('general');
    setError(null);
    setSuggestions(null);
    try {
      const habits = await getHabits();
      const progressSummary = `Current habits: ${habits.map(h => h.name).join(', ')}. Longest streak is ${Math.max(0, ...habits.map(h => h.streak))} days.`;
      
      const result = await receivePersonalizedHabitSuggestions({
        userGoals: userData.goals,
        userProgress: progressSummary,
        userPrompt: prompt,
      });
      setSuggestions(result);
    } catch (e) {
      setError("Failed to get suggestions. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };
  
  const handleGetStackingSuggestions = async () => {
     if (!userData) {
        setError("Please log in to get suggestions.");
        return;
    }

    setLoading('stacking');
    setError(null);
    setStackSuggestions(null);
    try {
      const habits = await getHabits();
      const result = await getHabitStackingSuggestions({
        habits: JSON.stringify(habits),
        dailyRoutine: userData.dailyRoutine
      });
      setStackSuggestions(result);
    } catch (e) {
      setError("Failed to get stacking suggestions. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  const onHabitAdded = () => {
    // Refresh the main dashboard page after a habit is added
    router.push('/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Suggestions</CardTitle>
        <CardDescription>
          Get AI-driven habit recommendations tailored to your goals and progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="space-y-2">
            <Label htmlFor="prompt">What are you trying to achieve?</Label>
            <Textarea 
                id="prompt"
                placeholder="e.g., I want to be more productive in the mornings."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
            />
        </div>

        {suggestions && (
          <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> AI Suggestions</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                  {suggestions.suggestions.map((habit) => (
                      <SuggestedHabitCard key={habit.habitName} habit={habit} onHabitAdded={onHabitAdded} />
                  ))}
              </CardContent>
          </Card>
        )}

        {stackSuggestions && (
          <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary"/> Habit Stacking Ideas</CardTitle>
                  </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                  {stackSuggestions.stacks.map((stack) => (
                      <SuggestedStackCard key={stack.newHabitName} stack={stack} onHabitAdded={onHabitAdded} />
                  ))}
              </CardContent>
          </Card>
        )}
        
        {!suggestions && !stackSuggestions && (
             <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">Describe what you want to achieve, and the AI will suggest some habits.</p>
            </div>
        )}

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <Button onClick={handleGetSuggestions} disabled={loading !== false || !prompt}>
          {loading === 'general' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Get New Habits
        </Button>
        <Button onClick={handleGetStackingSuggestions} variant="secondary" disabled={loading !== false}>
          {loading === 'stacking' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
          Suggest Habit Stacks
        </Button>
      </CardFooter>
    </Card>
  );
}
