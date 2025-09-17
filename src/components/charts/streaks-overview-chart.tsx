
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import type { Habit } from "@/lib/types"


const chartConfig = {
  streak: {
    label: "Streak",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function StreaksOverviewChart({ habits }: { habits: Habit[] }) {
    const chartData = habits
        .filter(h => h.streak > 0)
        .sort((a,b) => b.streak - a.streak)
        .slice(0, 5)
        .map(h => ({
            name: h.name,
            streak: h.streak
        }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 10,
        }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
          width={120}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="streak" fill="var(--color-streak)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
