
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { GoalForm } from "@/components/profile/goal-form";
import { HabitManager } from "@/components/profile/habit-manager";
import { GoalRoadmapGenerator } from "@/components/profile/goal-roadmap-generator";

export default function ProfilePage() {
    return (
        <div className="flex w-full flex-col items-start gap-4 md:gap-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your personal information and notification settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
             <Card className="w-full">
                <CardHeader>
                    <CardTitle>Your Goals</CardTitle>
                    <CardDescription>Set your main objectives to tailor your habit journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoalForm />
                </CardContent>
            </Card>
            <GoalRoadmapGenerator />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Habit Management</CardTitle>
                    <CardDescription>Add, edit, or remove your habits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HabitManager />
                </CardContent>
            </Card>
        </div>
    );
}
