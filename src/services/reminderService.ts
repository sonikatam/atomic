import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { todayISO } from '../lib/utils';

export async function sendReminderEmails() {
  if (!hasSupabaseEnv || !supabase) {
    console.info('Reminder scan skipped: Supabase env vars are not configured.');
    return [];
  }

  const today = todayISO();
  const { data, error } = await supabase
    .from('daily_user_status')
    .select('*, challenge:challenges(*), profile:profiles(*)')
    .eq('status_date', today)
    .eq('day_complete', false)
    .eq('reminder_sent', false);

  if (error) throw error;

  // TODO: Filter by reminder_time in a scheduled Edge Function or cron job.
  // TODO: Connect Resend, Postmark, or another email provider.
  // Future email copy: "You still have goals left today. Don't lose your streak."
  return data ?? [];
}
