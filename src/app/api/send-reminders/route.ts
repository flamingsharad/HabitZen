
import { triggerReminders } from '@/lib/reminders';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.CRON_SECRET && request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await triggerReminders();
    return NextResponse.json({ success: true, message: 'Reminders triggered successfully.' });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    return NextResponse.json({ success: false, message: 'Failed to trigger reminders.' }, { status: 500 });
  }
}
