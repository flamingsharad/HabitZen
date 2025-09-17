
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { subDays, format } from "date-fns"
import type { Habit } from "@/lib/types"

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ConsistencyChart({ habits }: { habits: Habit[] }) {

  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const totalHabitsForDay = habits.filter(h => h.frequency === 'daily').length; // Simplified for demo
    const completedCount = habits.reduce((acc, habit) => {
      if (habit.logs.some(log => log.date === dateStr && log.status === 'completed')) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const percentage = totalHabitsForDay > 0 ? (completedCount / totalHabitsForDay) * 100 : 0;
    
    return {
      date: format(date, 'eee'),
      completed: Math.round(percentage),
    };
  });

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickFormatter={(value) => `${value}%`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
