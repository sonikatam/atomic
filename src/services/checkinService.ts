import { hasSupabaseEnv, supabase } from '../lib/supabase';
import type { CheckinPayload, DailyCheckin } from '../types';
import { upsertMockCheckin } from './mockStore';

export async function upsertCheckin(payload: CheckinPayload): Promise<DailyCheckin> {
  if (!hasSupabaseEnv || !supabase) return upsertMockCheckin(payload);
  validateProof(payload);
  const { data: existing, error: existingError } = await supabase
    .from('daily_checkins')
    .select('completed')
    .eq('goal_id', payload.goal.id)
    .eq('user_id', payload.userId)
    .eq('checkin_date', payload.checkinDate)
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    challenge_id: payload.challengeId,
    goal_id: payload.goal.id,
    user_id: payload.userId,
    checkin_date: payload.checkinDate,
    completed: payload.completed,
    proof_image_url: payload.proofImageUrl || null,
    text_response: payload.textResponse || null,
    numeric_value: payload.numericValue ?? null,
  };
  const { data, error } = await supabase.from('daily_checkins').upsert(row, { onConflict: 'goal_id,user_id,checkin_date' }).select('*').single();
  if (error) throw error;
  if (payload.completed && !existing?.completed) {
    const { error: feedError } = await supabase.from('activity_feed').insert({
      challenge_id: payload.challengeId,
      user_id: payload.userId,
      goal_id: payload.goal.id,
      activity_type: payload.goal.proof_type === 'none' ? 'goal_completed' : 'proof_uploaded',
      message: payload.goal.proof_type === 'none' ? `completed ${payload.goal.title}` : `uploaded proof for ${payload.goal.title}`,
      proof_image_url: payload.proofImageUrl || null,
    });
    if (feedError) throw feedError;
  }
  return data as DailyCheckin;
}

export async function uploadProof(file: File, userId: string, challengeId: string, goalId: string, checkinDate: string) {
  if (!hasSupabaseEnv || !supabase) return URL.createObjectURL(file);
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${challengeId}/${goalId}/${checkinDate}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('proofs').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('proofs').getPublicUrl(path);
  return data.publicUrl;
}

function validateProof(payload: CheckinPayload) {
  if (!payload.completed) return;
  if (payload.goal.proof_type === 'photo' && !payload.proofImageUrl) throw new Error('Add a photo proof before completing this goal.');
  if (payload.goal.proof_type === 'text' && !payload.textResponse?.trim()) throw new Error('Add a text response before completing this goal.');
  if (payload.goal.proof_type === 'number' && (payload.numericValue === undefined || payload.numericValue === null)) throw new Error('Add a number before completing this goal.');
}
