
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Route, Sparkles } from 'lucide-react';
import { generateGoalRoadmap, GenerateGoalRoadmapOutput, MicroHabit } from '@/ai/flows/generate-goal-roadmap';
import { Badge } from '../ui/badge';
import { SuggestedHabitAdder } from '../insights/suggested-habit-adder';
import { useRouter } from 'next/navigation';

function SuggestedMicroHabitCard({ habit, onHabitAdded }: { habit: MicroHabit; onHabitAdded: () => void }) {
  return (
    <div className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{habit.habitName}</h4>
          <Badge variant="secondary">{habit.category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{habit.reasoning}</p>
      </div>
      <SuggestedHabitAdder
        habit={{
          habitName: habit.habitName,
          category: habit.category,
          reasoning: habit.reasoning,
        }}
        onHabitAdded={onHabitAdded}
      />
    </div>
  );
}

export function GoalRoadmapGenerator() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<GenerateGoalRoadmapOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateRoadmap = async () => {
    if (!goal) {
      toast({
        title: 'Please enter a goal',
        description: 'You need to provide a goal to generate a roadmap.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setRoadmap(null);
    try {
      const result = await generateGoalRoadmap({ goal });
      setRoadmap(result);
    } catch (error) {
      console.error('Failed to generate roadmap', error);
      toast({
        title: 'Error',
        description: 'Could not generate a roadmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onHabitAdded = () => {
    toast({
        title: 'Habit Added!',
        description: 'The new habit has been added to your dashboard.',
    })
    router.push('/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Route className="h-6 w-6 text-primary" /> AI Goal Roadmap</CardTitle>
        <CardDescription>Break down your big goals into small, manageable micro-habits automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Run a 5k marathon, write a book, or learn a new language."
            className="min-h-[100px]"
          />
        </div>
        {roadmap && (
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Your AI-Generated Roadmap to "{goal}"</h3>
            {roadmap.roadmap.map((habit) => (
              <SuggestedMicroHabitCard key={habit.habitName} habit={habit} onHabitAdded={onHabitAdded} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateRoadmap} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Roadmap
        </Button>
      </CardFooter>
    </Card>
  );
}
