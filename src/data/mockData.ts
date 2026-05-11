import type { ActivityFeedItem, Challenge, ChallengeMember, DailyCheckin, Goal, Profile, Reaction } from '../types';

export const mockProfiles: Profile[] = [
  {
    id: 'demo-user',
    full_name: 'Maya Chen',
    email: 'maya@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ava-user',
    full_name: 'Ava Patel',
    email: 'ava@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'riya-user',
    full_name: 'Riya Shah',
    email: 'riya@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    created_at: new Date().toISOString(),
  },
];

export const mockChallenges: Challenge[] = [];
export const mockMembers: ChallengeMember[] = [];
export const mockGoals: Goal[] = [];
export const mockCheckins: DailyCheckin[] = [];
export const mockFeed: ActivityFeedItem[] = [];
export const mockReactions: Reaction[] = [];
