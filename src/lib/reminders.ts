
'use server';

import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from './firebase-admin';
import { Habit, User } from './types';
import { sendReminderNotification } from '@/ai/flows/send-reminder-notification';

export async function triggerReminders() {
    console.log("Cron job started: triggerReminders");
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    // Convert current time to "HH:mm" format, assuming server is in UTC
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    try {
        const usersSnapshot = await db.collection('users').get();
        
        for (const userDoc of usersSnapshot.docs) {
            const user = { id: userDoc.id, ...userDoc.data() } as User;
            if (!user.fcmTokens || user.fcmTokens.length === 0) {
                continue;
            }

            const habitsSnapshot = await db.collection('users').doc(user.id).collection('habits').get();
            
            for (const habitDoc of habitsSnapshot.docs) {
                const habit = { id: habitDoc.id, ...habitDoc.data() } as Habit;

                if (!habit.reminder || habit.status === 'completed') {
                    continue;
                }

                let shouldRemind = false;
                if (habit.reminder.type === 'specific_time') {
                    if (habit.reminder.value === currentTime) {
                        shouldRemind = true;
                    }
                } else if (habit.reminder.type === 'interval') {
                    const intervalHours = parseInt(habit.reminder.value.replace('h', ''));
                    // Remind on the hour, if it's a multiple of the interval
                    if (currentMinute === 0 && currentHour > 0 && currentHour % intervalHours === 0) {
                        shouldRemind = true;
                    }
                }
                
                if (shouldRemind) {
                    console.log(`Sending reminder for habit "${habit.name}" to user ${user.id}`);
                    // Send a notification to all devices for the user
                    for (const token of user.fcmTokens) {
                         await sendReminderNotification({ fcmToken: token, habitName: habit.name });
                    }
                }
            }
        }
        console.log("Cron job finished: triggerReminders");
        return { success: true };
    } catch (error) {
        console.error("Error in triggerReminders cron job: ", error);
        return { success: false, error: "Failed to trigger reminders" };
    }
}
