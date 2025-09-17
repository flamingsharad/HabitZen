
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Telescope, Wand2 } from 'lucide-react';
import { getHabits } from '@/lib/data';
import { Habit } from '@/lib/types';
import { forecastHabitFormation, ForecastHabitFormationOutput } from '@/ai/flows/forecast-habit-formation';

export function HabitForecast() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForecastHabitFormationOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const userHabits = await getHabits();
        // We can only forecast for habits with some data, preferably daily
        setHabits(userHabits.filter(h => h.frequency === 'daily' && h.logs.length > 0));
      } catch (error) {
        toast({ title: 'Error', description: 'Could not load habits for forecasting.', variant: 'destructive' });
      }
    };
    fetchHabits();
  }, [toast]);

  const handleForecast = async () => {
    if (!selectedHabitId) {
      toast({ title: 'Please select a habit', variant: 'destructive' });
      return;
    }
    const habit = habits.find(h => h.id === selectedHabitId);
    if (!habit) {
      toast({ title: 'Habit not found', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const totalDays = habit.logs.length;
      const completedDays = habit.logs.filter(l => l.status === 'completed').length;
      const consistency = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      const habitHistory = {
        logs: habit.logs,
        streak: habit.streak,
        frequency: habit.frequency,
      }

      const forecast = await forecastHabitFormation({
        habitName: habit.name,
        habitHistory: JSON.stringify(habitHistory),
        consistency: Math.round(consistency),
      });
      setResult(forecast);
    } catch (error) {
      console.error('Failed to get forecast', error);
      toast({ title: 'Error', description: 'Could not generate forecast. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Telescope className="h-6 w-6 text-primary" /> AI Habit Forecast</CardTitle>
        <CardDescription>
          Predict how many days it will take to make a habit automatic based on your consistency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
            <Select onValueChange={setSelectedHabitId} value={selectedHabitId || ''}>
                <SelectTrigger className="sm:col-span-2">
                    <SelectValue placeholder="Select a habit to forecast..." />
                </SelectTrigger>
                <SelectContent>
                    {habits.length > 0 ? (
                        habits.map(habit => (
                            <SelectItem key={habit.id} value={habit.id}>
                                {habit.name}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground">No daily habits with history available to forecast.</div>
                    )}
                </SelectContent>
            </Select>
             <Button onClick={handleForecast} disabled={loading || !selectedHabitId} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Forecast
            </Button>
        </div>
        {result && (
            <Card className="bg-muted/50 p-6 text-center">
                <p className="text-5xl font-bold text-primary">{result.daysRemaining}</p>
                <p className="text-lg font-medium">more days to go!</p>
                <p className="mt-4 text-muted-foreground">{result.message}</p>
                 <p className="mt-2 text-xs text-muted-foreground/80">Confidence: {result.confidence}</p>
            </Card>
        )}
      </CardContent>
    </Card>
  );
}
