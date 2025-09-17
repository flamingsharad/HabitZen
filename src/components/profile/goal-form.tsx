
'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { updateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

const goalFormSchema = z.object({
  goals: z.string().min(10, { message: 'Please describe your goals in at least 10 characters.' }),
});

export function GoalForm() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goals: '',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({ goals: userData.goals });
    }
  }, [userData, form]);

  async function onSubmit(values: z.infer<typeof goalFormSchema>) {
    await updateUser(values);
    toast({
      title: 'Goals updated!',
      description: 'Your new goals have been saved.',
    });
    router.refresh();
  }
  
  if (!userData) {
      return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>My Goals</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your goals..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Goals</Button>
      </form>
    </Form>
  );
}
