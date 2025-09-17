
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
import { Loader2, Zap, Trophy, TrendingDown, Lightbulb, BrainCircuit } from "lucide-react";
import { analyzeHabitDataForInsights, AnalyzeHabitDataOutput } from "@/ai/flows/analyze-habit-data-for-insights";
import { getAllMoods, getHabits } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";

export function HabitAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeHabitDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  const handleAnalysis = async () => {
    if (!userData) {
        setError("User not found. Please log in.");
        return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const [habits, moods] = await Promise.all([getHabits(), getAllMoods()]);
      const result = await analyzeHabitDataForInsights({
        habitData: JSON.stringify(habits),
        moodData: JSON.stringify(moods),
        userGoals: userData.goals,
      });
      setAnalysis(result);
    } catch (e) {
      setError("Failed to get analysis. Please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Insights</CardTitle>
        <CardDescription>
          Analyze your habit data to identify patterns and get personalized advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.consistencyPercentage}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Performing Days</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.bestPerformingDays}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{analysis.weakAreas}</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cross-Analysis</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{analysis.crossAnalysis}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Advice</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.advice}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Click the button to generate your personalized analysis.</p>
          </div>
        )}
         {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalysis} disabled={loading || !userData}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {analysis ? 'Re-analyze Habits' : 'Analyze My Habits'}
        </Button>
      </CardFooter>
    </Card>
  );
}
