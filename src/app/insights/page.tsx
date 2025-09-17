import { HabitAnalysis } from "@/components/insights/habit-analysis";
import { HabitForecast } from "@/components/insights/habit-forecast";
import { HabitSuggestions } from "@/components/insights/habit-suggestions";

export default function InsightsPage() {
    return (
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <HabitAnalysis />
            <HabitSuggestions />
            <HabitForecast />
        </div>
    );
}
