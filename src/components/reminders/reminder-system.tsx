
'use client';

import { useEffect, useState } from 'react';
import { getTodaysHabits } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function ReminderSystem() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check for notification support and permission on mount
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    // Only run the reminder logic if we have a user and permission is granted
    if (!user || permission !== 'granted') return;

    const checkReminders = async () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      try {
        const habits = await getTodaysHabits();

        habits.forEach(habit => {
          if (!habit.reminder || habit.status !== 'pending') return;

          const reminderId = `reminder-${habit.id}-${todayStr}`;
          
          let shouldRemind = false;
          
          if (habit.reminder.type === 'specific_time') {
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (currentTime === habit.reminder.value) {
                shouldRemind = true;
            }
          } else if (habit.reminder.type === 'interval') {
             const intervalHours = parseInt(habit.reminder.value.replace('h',''));
             // Remind on the hour, if it's a multiple of the interval
             if (now.getMinutes() === 0 && now.getHours() > 0 && now.getHours() % intervalHours === 0) {
                 shouldRemind = true;
             }
          }
          
          // Check if reminder was already shown today for this specific time/interval
          const lastShownKey = `${reminderId}-${now.getHours()}`;
          const lastShown = sessionStorage.getItem(lastShownKey);

          if(shouldRemind && !lastShown) {
             toast({
                id: reminderId,
                title: 'Habit Reminder',
                description: `It's time for your habit: "${habit.name}"`,
                action: <Bell className="h-5 w-5 text-primary" />,
            });
            sessionStorage.setItem(lastShownKey, 'true');
          }
        });
      } catch (error) {
        console.error("Failed to fetch habits for reminders", error);
      }
    };

    // Check every minute
    const intervalId = setInterval(checkReminders, 60000); 

    // Initial check
    checkReminders();

    return () => clearInterval(intervalId);
  }, [toast, user, permission]);

  return null; // This component doesn't render anything visible
}
