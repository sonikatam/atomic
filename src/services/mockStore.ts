import { mockChallenges, mockCheckins, mockFeed, mockGoals, mockMembers, mockProfiles, mockReactions } from '../data/mockData';
import { generateInviteCode, todayISO, uid } from '../lib/utils';
import type {
  ActivityFeedItem,
  Challenge,
  ChallengeDetail,
  ChallengeMember,
  ChallengeSummary,
  CheckinPayload,
  DailyCheckin,
  DashboardData,
  Goal,
  NewChallengeInput,
  Profile,
  Reaction,
} from '../types';
import { calculateChallengeStreaks, getRequiredCompleted, isDayComplete } from './streakService';

interface MockState {
  profiles: Profile[];
  challenges: Challenge[];
  members: ChallengeMember[];
  goals: Goal[];
  checkins: DailyCheckin[];
  feed: ActivityFeedItem[];
  reactions: Reaction[];
  currentUserId: string;
}

const STORAGE_KEY = 'one-percent-club-state-v2';

function seed(): MockState {
  return {
    profiles: mockProfiles,
    challenges: mockChallenges,
    members: mockMembers,
    goals: mockGoals,
    checkins: mockCheckins,
    feed: mockFeed,
    reactions: mockReactions,
    currentUserId: 'demo-user',
  };
}

export function getMockState(): MockState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    saveMockState(initial);
    return initial;
  }
  return JSON.parse(raw) as MockState;
}

export function saveMockState(state: MockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetMockState() {
  const initial = seed();
  saveMockState(initial);
  return initial;
}

export function getCurrentMockProfile() {
  const state = getMockState();
  return state.profiles.find((profile) => profile.id === state.currentUserId) ?? state.profiles[0];
}

export function signInMock(email: string, fullName?: string) {
  const state = getMockState();
  let profile = state.profiles.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  if (!profile) {
    profile = {
      id: uid('profile'),
      full_name: fullName || email.split('@')[0],
      email,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    state.profiles.push(profile);
  }
  state.currentUserId = profile.id;
  saveMockState(state);
  return profile;
}

export function signOutMock() {
  const state = getMockState();
  state.currentUserId = 'demo-user';
  saveMockState(state);
}

export function buildSummary(challenge: Challenge, userId: string, state = getMockState()): ChallengeSummary {
  const goals = state.goals.filter((goal) => goal.challenge_id === challenge.id);
  const requiredGoals = goals.filter((goal) => goal.required);
  const checkins = state.checkins.filter((checkin) => checkin.challenge_id === challenge.id);
  const streaks = calculateChallengeStreaks(challenge, goals, checkins, userId);
  const today = todayISO();
  return {
    ...challenge,
    goals,
    member_count: state.members.filter((member) => member.challenge_id === challenge.id).length,
    today_required_completed: getRequiredCompleted(requiredGoals, checkins, userId, today),
    total_required_goals: requiredGoals.length,
    day_complete: isDayComplete(requiredGoals, checkins, userId, today),
    current_streak: streaks.currentStreak,
    longest_streak: streaks.longestStreak,
  };
}

export function getMockDashboard(userId: string): DashboardData {
  const state = getMockState();
  const profile = state.profiles.find((item) => item.id === userId) ?? getCurrentMockProfile();
  const memberChallengeIds = new Set(state.members.filter((member) => member.user_id === userId).map((member) => member.challenge_id));
  const summaries = state.challenges
    .filter((challenge) => memberChallengeIds.has(challenge.id) || challenge.created_by === userId)
    .map((challenge) => buildSummary(challenge, userId, state));
  const groupChallenges = summaries.filter((challenge) => challenge.type === 'group');
  const selfChallenges = summaries.filter((challenge) => challenge.type === 'self');
  const today = todayISO();
  const pendingGoals = summaries.flatMap((challenge) =>
    challenge.goals
      .filter((goal) => goal.required)
      .map((goal) => ({ challenge, goal, checkin: state.checkins.find((checkin) => checkin.goal_id === goal.id && checkin.user_id === userId && checkin.checkin_date === today) }))
      .filter((item) => !item.checkin?.completed),
  );
  const overallCurrentStreak = summaries.reduce((sum, challenge) => sum + challenge.current_streak, 0);
  const overallLongestStreak = Math.max(0, ...summaries.map((challenge) => challenge.longest_streak));
  return { profile, groupChallenges, selfChallenges, pendingGoals, overallCurrentStreak, overallLongestStreak };
}

export function getMockChallenges(userId: string, type?: 'group' | 'self') {
  const state = getMockState();
  const memberChallengeIds = new Set(state.members.filter((member) => member.user_id === userId).map((member) => member.challenge_id));
  return state.challenges
    .filter((challenge) => (memberChallengeIds.has(challenge.id) || challenge.created_by === userId) && (!type || challenge.type === type))
    .map((challenge) => buildSummary(challenge, userId, state));
}

export function getMockChallengeDetail(challengeId: string, userId: string): ChallengeDetail | null {
  const state = getMockState();
  const challenge = state.challenges.find((item) => item.id === challengeId);
  if (!challenge) return null;
  const summary = buildSummary(challenge, userId, state);
  const members = state.members
    .filter((member) => member.challenge_id === challengeId)
    .map((member) => ({ ...member, profile: state.profiles.find((profile) => profile.id === member.user_id) }));
  const checkins = state.checkins.filter((checkin) => checkin.challenge_id === challengeId);
  const requiredGoals = summary.goals.filter((goal) => goal.required);
  const today = todayISO();
  const memberProgress = members.map((member) => {
    const streaks = calculateChallengeStreaks(challenge, summary.goals, checkins, member.user_id);
    return {
      member,
      requiredCompleted: getRequiredCompleted(requiredGoals, checkins, member.user_id, today),
      totalRequired: requiredGoals.length,
      dayComplete: isDayComplete(requiredGoals, checkins, member.user_id, today),
      currentStreak: streaks.currentStreak,
    };
  });
  const leaderboard = members
    .map((member) => {
      const profile = member.profile ?? state.profiles[0];
      const streaks = calculateChallengeStreaks(challenge, summary.goals, checkins, member.user_id);
      return { profile, currentStreak: streaks.currentStreak, longestStreak: streaks.longestStreak, completedDays: streaks.completedDays };
    })
    .sort((a, b) => b.currentStreak - a.currentStreak || b.completedDays - a.completedDays);
  const feed = state.feed
    .filter((item) => item.challenge_id === challengeId)
    .map((item) => ({
      ...item,
      profile: state.profiles.find((profile) => profile.id === item.user_id),
      goal: item.goal_id ? state.goals.find((goal) => goal.id === item.goal_id) ?? null : null,
      reactions: state.reactions.filter((reaction) => reaction.activity_id === item.id),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { ...summary, members, checkins, feed, memberProgress, leaderboard };
}

export function createMockChallenge(input: NewChallengeInput, userId: string) {
  const state = getMockState();
  const challenge: Challenge = {
    id: uid('challenge'),
    name: input.name,
    description: input.description || null,
    type: input.type,
    start_date: input.start_date,
    end_date: input.end_date,
    reminder_time: input.reminder_time || null,
    invite_code: input.type === 'group' ? generateInviteCode() : null,
    created_by: userId,
    created_at: new Date().toISOString(),
  };
  const goals: Goal[] = input.goals.map((goal) => ({
    id: uid('goal'),
    challenge_id: challenge.id,
    title: goal.title,
    description: goal.description || null,
    required: goal.required,
    proof_type: goal.proof_type,
    target_value: goal.target_value ?? null,
    target_unit: goal.target_unit ?? null,
    created_at: new Date().toISOString(),
  }));
  const member: ChallengeMember = {
    id: uid('member'),
    challenge_id: challenge.id,
    user_id: userId,
    role: 'owner',
    joined_at: new Date().toISOString(),
  };
  state.challenges.unshift(challenge);
  state.goals.push(...goals);
  state.members.push(member);
  saveMockState(state);
  return buildSummary(challenge, userId, state);
}

export function joinMockChallenge(inviteCode: string, userId: string) {
  const state = getMockState();
  const challenge = state.challenges.find((item) => item.invite_code?.toLowerCase() === inviteCode.trim().toLowerCase());
  if (!challenge) throw new Error('Invalid invite code. Double-check the code and try again.');
  const alreadyJoined = state.members.some((member) => member.challenge_id === challenge.id && member.user_id === userId);
  if (alreadyJoined) throw new Error('You are already in this challenge.');
  state.members.push({ id: uid('member'), challenge_id: challenge.id, user_id: userId, role: 'member', joined_at: new Date().toISOString() });
  saveMockState(state);
  return buildSummary(challenge, userId, state);
}

export function upsertMockCheckin(payload: CheckinPayload) {
  const state = getMockState();
  const today = todayISO();
  const existingIndex = state.checkins.findIndex((checkin) => checkin.goal_id === payload.goal.id && checkin.user_id === payload.userId && checkin.checkin_date === today);
  const completed = payload.completed;
  if (completed && payload.goal.proof_type === 'photo' && !payload.proofImageUrl) throw new Error('Add a photo proof before completing this goal.');
  if (completed && payload.goal.proof_type === 'text' && !payload.textResponse?.trim()) throw new Error('Add a text response before completing this goal.');
  if (completed && payload.goal.proof_type === 'number' && (payload.numericValue === undefined || payload.numericValue === null)) throw new Error('Add a number before completing this goal.');

  const checkin: DailyCheckin = {
    id: existingIndex >= 0 ? state.checkins[existingIndex].id : uid('checkin'),
    challenge_id: payload.challengeId,
    goal_id: payload.goal.id,
    user_id: payload.userId,
    checkin_date: today,
    completed,
    proof_image_url: payload.proofImageUrl || null,
    text_response: payload.textResponse || null,
    numeric_value: payload.numericValue ?? null,
    created_at: existingIndex >= 0 ? state.checkins[existingIndex].created_at : new Date().toISOString(),
  };
  if (existingIndex >= 0) state.checkins[existingIndex] = checkin;
  else state.checkins.push(checkin);

  const challenge = state.challenges.find((item) => item.id === payload.challengeId);
  const profile = state.profiles.find((item) => item.id === payload.userId);
  if (challenge?.type === 'group' && completed) {
    state.feed.unshift({
      id: uid('feed'),
      challenge_id: payload.challengeId,
      user_id: payload.userId,
      goal_id: payload.goal.id,
      activity_type: payload.goal.proof_type === 'none' ? 'goal_completed' : 'proof_uploaded',
      message: `${profile?.full_name || 'Someone'} ${payload.goal.proof_type === 'none' ? 'completed' : 'uploaded proof for'} ${payload.goal.title}`,
      proof_image_url: payload.proofImageUrl || null,
      created_at: new Date().toISOString(),
    });
  }
  saveMockState(state);
  return checkin;
}

export function reactToMockFeed(activityId: string, userId: string) {
  const state = getMockState();
  const existing = state.reactions.find((reaction) => reaction.activity_id === activityId && reaction.user_id === userId);
  if (existing) {
    state.reactions = state.reactions.filter((reaction) => reaction.id !== existing.id);
  } else {
    state.reactions.push({ id: uid('reaction'), activity_id: activityId, user_id: userId, emoji: '🔥', created_at: new Date().toISOString() });
  }
  saveMockState(state);
}
