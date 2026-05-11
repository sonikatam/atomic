import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { generateInviteCode, todayISO } from '../lib/utils';
import type {
  Challenge,
  ChallengeDetail,
  ChallengeMember,
  ChallengeSummary,
  DailyCheckin,
  Goal,
  NewChallengeInput,
  Profile,
} from '../types';
import { calculateChallengeStreaks, getRequiredCompleted, isDayComplete } from './streakService';
import { createMockChallenge, getMockChallengeDetail, getMockChallenges, getMockDashboard, joinMockChallenge } from './mockStore';

export async function getDashboardData(userId: string) {
  if (!hasSupabaseEnv || !supabase) return getMockDashboard(userId);
  const profile = await getProfile(userId);
  const groupChallenges = await getChallenges(userId, 'group');
  const selfChallenges = await getChallenges(userId, 'self');
  const all = [...groupChallenges, ...selfChallenges];
  const today = todayISO();
  const { data: todayCheckins, error } = await supabase.from('daily_checkins').select('*').eq('user_id', userId).eq('checkin_date', today);
  if (error) throw error;
  const pendingGoals = all.flatMap((challenge) =>
    challenge.goals
      .filter((goal) => goal.required)
      .map((goal) => ({ challenge, goal, checkin: (todayCheckins as DailyCheckin[]).find((checkin) => checkin.goal_id === goal.id) }))
      .filter((item) => !item.checkin?.completed),
  );
  return {
    profile,
    groupChallenges,
    selfChallenges,
    pendingGoals,
    overallCurrentStreak: all.reduce((sum, challenge) => sum + challenge.current_streak, 0),
    overallLongestStreak: Math.max(0, ...all.map((challenge) => challenge.longest_streak)),
  };
}

export async function getChallenges(userId: string, type?: 'group' | 'self'): Promise<ChallengeSummary[]> {
  if (!hasSupabaseEnv || !supabase) return getMockChallenges(userId, type);
  const { data: memberships, error: membershipError } = await supabase.from('challenge_members').select('challenge_id').eq('user_id', userId);
  if (membershipError) throw membershipError;
  const ids = (memberships ?? []).map((membership) => membership.challenge_id);
  if (ids.length === 0) return [];
  let query = supabase.from('challenges').select('*').in('id', ids).order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data: challenges, error } = await query;
  if (error) throw error;
  return Promise.all((challenges as Challenge[]).map((challenge) => buildSupabaseSummary(challenge, userId)));
}

export async function getChallengeDetail(challengeId: string, userId: string): Promise<ChallengeDetail | null> {
  if (!hasSupabaseEnv || !supabase) return getMockChallengeDetail(challengeId, userId);
  const { data: challenge, error } = await supabase.from('challenges').select('*').eq('id', challengeId).single();
  if (error) throw error;
  if (!challenge) return null;
  const summary = await buildSupabaseSummary(challenge as Challenge, userId);
  const [{ data: members, error: membersError }, { data: checkins, error: checkinsError }, { data: feed, error: feedError }] = await Promise.all([
    supabase.from('challenge_members').select('*, profile:profiles(*)').eq('challenge_id', challengeId),
    supabase.from('daily_checkins').select('*').eq('challenge_id', challengeId),
    supabase.from('activity_feed').select('*, profile:profiles(*), goal:goals(*), reactions(*)').eq('challenge_id', challengeId).order('created_at', { ascending: false }),
  ]);
  if (membersError) throw membersError;
  if (checkinsError) throw checkinsError;
  if (feedError) throw feedError;
  const memberRows = (members ?? []) as ChallengeMember[];
  const requiredGoals = summary.goals.filter((goal) => goal.required);
  const today = todayISO();
  const memberProgress = memberRows.map((member) => {
    const streaks = calculateChallengeStreaks(summary, summary.goals, checkins as DailyCheckin[], member.user_id);
    return {
      member,
      requiredCompleted: getRequiredCompleted(requiredGoals, checkins as DailyCheckin[], member.user_id, today),
      totalRequired: requiredGoals.length,
      dayComplete: isDayComplete(requiredGoals, checkins as DailyCheckin[], member.user_id, today),
      currentStreak: streaks.currentStreak,
    };
  });
  const leaderboard = memberRows
    .map((member) => {
      const profile = member.profile as Profile;
      const streaks = calculateChallengeStreaks(summary, summary.goals, checkins as DailyCheckin[], member.user_id);
      return { profile, currentStreak: streaks.currentStreak, longestStreak: streaks.longestStreak, completedDays: streaks.completedDays };
    })
    .sort((a, b) => b.currentStreak - a.currentStreak || b.completedDays - a.completedDays);
  return {
    ...summary,
    members: memberRows,
    checkins: checkins as DailyCheckin[],
    feed: feed as never,
    memberProgress,
    leaderboard,
  };
}

export async function createChallenge(input: NewChallengeInput, userId: string) {
  if (!hasSupabaseEnv || !supabase) return createMockChallenge(input, userId);
  const inviteCode = input.type === 'group' ? generateInviteCode() : null;
  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      name: input.name,
      description: input.description || null,
      type: input.type,
      start_date: input.start_date,
      end_date: input.end_date,
      reminder_time: input.reminder_time || null,
      invite_code: inviteCode,
      created_by: userId,
    })
    .select('*')
    .single();
  if (error) throw error;
  const { error: memberError } = await supabase.from('challenge_members').insert({ challenge_id: challenge.id, user_id: userId, role: 'owner' });
  if (memberError) throw memberError;

  const goals = input.goals.map((goal) => ({
    challenge_id: challenge.id,
    title: goal.title,
    description: goal.description || null,
    required: goal.required,
    proof_type: goal.proof_type,
    target_value: goal.target_value ?? null,
    target_unit: goal.target_unit ?? null,
  }));
  const { error: goalsError } = await supabase.from('goals').insert(goals);
  if (goalsError) throw goalsError;
  return buildSupabaseSummary(challenge as Challenge, userId);
}

export async function joinChallengeByInviteCode(inviteCode: string, userId: string) {
  if (!hasSupabaseEnv || !supabase) return joinMockChallenge(inviteCode, userId);
  const { data: challenge, error } = await supabase.from('challenges').select('*').eq('invite_code', inviteCode.trim().toUpperCase()).eq('type', 'group').single();
  if (error || !challenge) throw new Error('Invalid invite code. Double-check the code and try again.');
  const { data: existing } = await supabase.from('challenge_members').select('id').eq('challenge_id', challenge.id).eq('user_id', userId).maybeSingle();
  if (existing) throw new Error('You are already in this challenge.');
  const { error: memberError } = await supabase.from('challenge_members').insert({ challenge_id: challenge.id, user_id: userId, role: 'member' });
  if (memberError) throw memberError;
  return buildSupabaseSummary(challenge as Challenge, userId);
}

async function buildSupabaseSummary(challenge: Challenge, userId: string): Promise<ChallengeSummary> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const [{ data: goals, error: goalsError }, { data: members, error: membersError }, { data: checkins, error: checkinsError }] = await Promise.all([
    supabase.from('goals').select('*').eq('challenge_id', challenge.id),
    supabase.from('challenge_members').select('id').eq('challenge_id', challenge.id),
    supabase.from('daily_checkins').select('*').eq('challenge_id', challenge.id).eq('user_id', userId),
  ]);
  if (goalsError) throw goalsError;
  if (membersError) throw membersError;
  if (checkinsError) throw checkinsError;
  const challengeGoals = goals as Goal[];
  const requiredGoals = challengeGoals.filter((goal) => goal.required);
  const today = todayISO();
  const streaks = calculateChallengeStreaks(challenge, challengeGoals, checkins as DailyCheckin[], userId);
  return {
    ...challenge,
    goals: challengeGoals,
    member_count: members?.length ?? 0,
    today_required_completed: getRequiredCompleted(requiredGoals, checkins as DailyCheckin[], userId, today),
    total_required_goals: requiredGoals.length,
    day_complete: isDayComplete(requiredGoals, checkins as DailyCheckin[], userId, today),
    current_streak: streaks.currentStreak,
    longest_streak: streaks.longestStreak,
  };
}

async function getProfile(userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data as Profile;
}
