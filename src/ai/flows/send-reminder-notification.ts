
'use server';
/**
 * @fileOverview A flow to send a push notification to a specific device.
 *
 * - sendReminderNotification - A function that sends a push notification.
 * - SendReminderNotificationInput - The input type for the sendReminderNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import { auth, db } from '@/lib/firebase-admin';

const SendReminderNotificationInputSchema = z.object({
  fcmToken: z.string().describe('The FCM token of the device to send the notification to.'),
  habitName: z.string().describe('The name of the habit for the reminder.'),
});
export type SendReminderNotificationInput = z.infer<typeof SendReminderNotificationInputSchema>;

export async function sendReminderNotification(
  input: SendReminderNotificationInput
): Promise<void> {
  return sendReminderNotificationFlow(input);
}

const sendReminderNotificationFlow = ai.defineFlow(
  {
    name: 'sendReminderNotificationFlow',
    inputSchema: SendReminderNotificationInputSchema,
    outputSchema: z.void(),
  },
  async ({ fcmToken, habitName }) => {
    if (!admin.apps.length) {
        // This should not happen if firebase-admin is initialized correctly
        console.error("Firebase Admin SDK is not initialized.");
        return;
    }
    
    const message = {
        token: fcmToken,
        notification: {
            title: 'Habit Reminder',
            body: `It's time for your habit: "${habitName}"`,
        },
        webpush: {
            notification: {
                icon: '/favicon.svg',
            },
            fcm_options: {
                link: '/',
            }
        }
    };

    try {
        await admin.messaging().send(message);
        console.log('Successfully sent message to token:', fcmToken);
    } catch (error) {
        console.error('Error sending message:', error);
        // If the token is no longer valid, we should remove it from the user's document
        if ((error as any).code === 'messaging/registration-token-not-registered') {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('fcmTokens', 'array-contains', fcmToken).get();
            if (!snapshot.empty) {
                snapshot.forEach(async (userDoc) => {
                    console.log(`Removing invalid token for user ${userDoc.id}`);
                    const tokens = userDoc.data().fcmTokens || [];
                    const updatedTokens = tokens.filter((t: string) => t !== fcmToken);
                    await userDoc.ref.update({ fcmTokens: updatedTokens });
                });
            }
        }
    }
  }
);
