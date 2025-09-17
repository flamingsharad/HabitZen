
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Habit } from '@/lib/types';
import { addHabit, updateHabit } from '@/lib/data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const habitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['Health', 'Study', 'Work', 'Personal', 'Fitness', 'Productivity', 'Other']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  reminderType: z.enum(['none', 'specific_time', 'interval']),
  reminderValue: z.string().optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

export function HabitForm({ habit, onFinished, onCancel }: { habit?: Habit, onFinished: () => void, onCancel?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name ?? '',
      category: habit?.category ?? 'Personal',
      frequency: habit?.frequency ?? 'daily',
      reminderType: habit?.reminder?.type ?? 'none',
      reminderValue: habit?.reminder?.type === 'specific_time' ? habit.reminder.value : 
                     habit?.reminder?.type === 'interval' ? habit.reminder.value : '',
    },
  });

  const reminderType = form.watch('reminderType');

  async function onSubmit(values: HabitFormData) {
    try {
      const habitPayload: any = {
        name: values.name,
        category: values.category,
        frequency: values.frequency,
      };

      if (values.reminderType !== 'none' && values.reminderValue) {
        habitPayload.reminder = {
          type: values.reminderType,
          value: values.reminderValue,
        };
      } else {
        habitPayload.reminder = null;
      }

      if (habit && habit.id) {
        await updateHabit(habit.id, habitPayload);
        toast({ title: 'Habit updated!' });
      } else {
        await addHabit(habitPayload);
        toast({ title: 'Habit added!' });
      }
      router.refresh();
      onFinished();
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast({
          title: 'Error adding habit',
          description: `A habit with the name "${values.name}" already exists.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'An error occurred',
          description: 'Could not save the habit. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reminderType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Reminder</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('reminderValue', ''); // Reset value on type change
                  }}
                  defaultValue={field.value}
                  className="flex items-center gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="none" /></FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="specific_time" /></FormControl>
                    <FormLabel className="font-normal">Specific Time</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="interval" /></FormControl>
                    <FormLabel className="font-normal">Interval</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {reminderType === 'specific_time' && (
          <FormField
            control={form.control}
            name="reminderValue"
            rules={{ required: 'Please select a time' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Time</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {reminderType === 'interval' && (
          <FormField
            control={form.control}
            name="reminderValue"
            rules={{ required: 'Please select an interval' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Interval</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an interval" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="1h">Every 1 hour</SelectItem>
                        <SelectItem value="2h">Every 2 hours</SelectItem>
                        <SelectItem value="3h">Every 3 hours</SelectItem>
                        <SelectItem value="4h">Every 4 hours</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <DialogFooter>
            {onCancel ? (
                 <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
            ) : (
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
            )}
            <Button type="submit">Save Habit</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
