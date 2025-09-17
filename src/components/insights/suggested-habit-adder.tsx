
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { SuggestedHabit } from '@/ai/flows/receive-personalized-habit-suggestions';
import { Habit } from '@/lib/types';


export function SuggestedHabitAdder({ habit, onHabitAdded }: { habit: SuggestedHabit, onHabitAdded: () => void }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFinish = () => {
    setIsFormOpen(false);
    onHabitAdded();
  }
  
  const handleCancel = () => {
    setIsFormOpen(false);
  }

  const habitToAdd = {
    name: habit.habitName,
    category: habit.category,
  } as Habit;

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add to My Habits
        </Button>
      <DialogContent>
          <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
              <DialogDescription>
                Review and save the suggested habit. You can customize it below.
              </DialogDescription>
          </DialogHeader>
          <HabitForm habit={habitToAdd} onFinished={handleFinish} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
