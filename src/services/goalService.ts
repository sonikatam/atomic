import { hasSupabaseEnv, supabase } from '../lib/supabase';
import type { Goal, NewGoalInput } from '../types';
import { uid } from '../lib/utils';

export async function addGoal(challengeId: string, input: NewGoalInput): Promise<Goal> {
  if (!hasSupabaseEnv || !supabase) {
    return {
      id: uid('goal'),
      challenge_id: challengeId,
      title: input.title,
      description: input.description || null,
      required: input.required,
      proof_type: input.proof_type,
      target_value: input.target_value ?? null,
      target_unit: input.target_unit ?? null,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from('goals')
    .insert({
      challenge_id: challengeId,
      title: input.title,
      description: input.description || null,
      required: input.required,
      proof_type: input.proof_type,
      target_value: input.target_value ?? null,
      target_unit: input.target_unit ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Goal;
}
