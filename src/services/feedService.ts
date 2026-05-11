import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { reactToMockFeed } from './mockStore';

export async function toggleFireReaction(activityId: string, userId: string) {
  if (!hasSupabaseEnv || !supabase) {
    reactToMockFeed(activityId, userId);
    return;
  }
  const { data: existing } = await supabase.from('reactions').select('id').eq('activity_id', activityId).eq('user_id', userId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('reactions').insert({ activity_id: activityId, user_id: userId, emoji: '🔥' });
    if (error) throw error;
  }
}
