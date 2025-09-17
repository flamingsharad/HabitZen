
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  dailyRoutine: z.enum(['morning', 'night']).optional(),
});

export function ProfileForm() {
  const { user, userData, refreshUserData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      dailyRoutine: 'morning',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name,
        email: userData.email,
        dailyRoutine: userData.dailyRoutine,
      });
    }
  }, [userData, form]);

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;
    await updateUser(values);
    await refreshUserData();
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved.',
    });
    router.refresh();
  }

  if (!userData) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  const avatarSrc = userData.avatarUrl || user?.photoURL;
  const userName = userData.name || user?.displayName || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={userName} />}
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              User avatar from Google or initials.
            </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  readOnly={!!user?.email}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dailyRoutine"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Daily Routine Style</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center gap-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="morning" />
                    </FormControl>
                    <FormLabel className="font-normal">Morning Person</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="night" />
                    </FormControl>
                    <FormLabel className="font-normal">Night Person</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
