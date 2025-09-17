
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical, SkipForward, X, CheckCircle, Rocket, CircleDashed } from 'lucide-react';
import { Habit, HabitStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type HabitActionsProps = {
  habit: Habit;
  onStatusChange: (habitId: string, newStatus: HabitStatus, newStreak?: number, newProgress?: number) => Promise<void>;
  disabled?: boolean;
};

export function HabitActions({ habit, onStatusChange, disabled }: HabitActionsProps) {
  const { toast } = useToast();

  const handleUpdate = async (newStatus: HabitStatus) => {
    try {
        await onStatusChange(habit.id, newStatus);

        if (newStatus === 'completed') {
            toast({
              title: 'Habit Completed!',
              description: 'Nice one! Every step counts.',
            });
        }
    } catch (error) {
       toast({
          title: 'Update Failed',
          description: 'Could not update habit status. Please try again.',
          variant: 'destructive',
       });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleUpdate('completed')} disabled={disabled}>
          <Check className="mr-2 h-4 w-4" />
          <span>Mark as Complete</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleUpdate('partially-done')} disabled={disabled}>
          <CircleDashed className="mr-2 h-4 w-4" />
          <span>Mark as Partially Done</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleUpdate('skipped')} disabled={disabled}>
          <SkipForward className="mr-2 h-4 w-4" />
          <span>Mark as Skipped</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleUpdate('pending')} disabled={disabled}>
          <X className="mr-2 h-4 w-4" />
          <span>Reset to Pending</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
