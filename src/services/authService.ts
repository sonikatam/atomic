import type { User } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { getCurrentMockProfile, signInMock, signOutMock } from './mockStore';

export async function getCurrentUserProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv || !supabase) return getCurrentMockProfile();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (data) return data as Profile;
  return ensureProfile(user);
}

export async function signUp(email: string, password: string, fullName: string): Promise<Profile | null> {
  if (!hasSupabaseEnv || !supabase) return signInMock(email, fullName);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  if (!data.user) return null;
  if (!data.session) return null;
  return ensureProfile(data.user, fullName);
}

export async function signIn(email: string, password: string): Promise<Profile | null> {
  if (!hasSupabaseEnv || !supabase) return signInMock(email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) return null;
  return ensureProfile(data.user);
}

export async function signOut() {
  if (!hasSupabaseEnv || !supabase) {
    signOutMock();
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) {
  if (!hasSupabaseEnv || !supabase) {
    const profile = getCurrentMockProfile();
    return { ...profile, ...updates };
  }
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select('*').single();
  if (error) throw error;
  return data as Profile;
}

async function ensureProfile(user: User, fullName?: string): Promise<Profile> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const profile: Profile = {
    id: user.id,
    full_name: fullName || (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || null,
    email: user.email || null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) || null,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data as Profile;
}
