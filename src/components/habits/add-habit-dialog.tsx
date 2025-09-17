
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';

export function AddHabitDialog({ onHabitAdded }: { onHabitAdded: () => void }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFinish = () => {
    setIsFormOpen(false);
    onHabitAdded();
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Habit</Button>
      </DialogTrigger>
      <DialogContent>
          <DialogHeader>
              <DialogTitle>Add New Habit</DialogTitle>
              <DialogDescription>
                Fill in the details for your new habit.
              </DialogDescription>
          </DialogHeader>
          <HabitForm onFinished={handleFinish} />
      </DialogContent>
    </Dialog>
  );
}
