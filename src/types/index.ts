export type ChallengeType = 'group' | 'self';
export type ProofType = 'none' | 'photo' | 'text' | 'number';
export type MemberRole = 'owner' | 'member';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  type: ChallengeType;
  start_date: string;
  end_date: string;
  reminder_time: string | null;
  invite_code: string | null;
  created_by: string;
  created_at: string;
}

export interface ChallengeMember {
  id: string;
  challenge_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: Profile;
}

export interface Goal {
  id: string;
  challenge_id: string;
  title: string;
  description: string | null;
  required: boolean;
  proof_type: ProofType;
  target_value: number | null;
  target_unit: string | null;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  challenge_id: string;
  goal_id: string;
  user_id: string;
  checkin_date: string;
  completed: boolean;
  proof_image_url: string | null;
  text_response: string | null;
  numeric_value: number | null;
  created_at: string;
}

export interface DailyUserStatus {
  id: string;
  challenge_id: string;
  user_id: string;
  status_date: string;
  required_goals_completed: number;
  total_required_goals: number;
  day_complete: boolean;
  reminder_sent: boolean;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  challenge_id: string;
  user_id: string;
  goal_id: string | null;
  activity_type: string;
  message: string;
  proof_image_url: string | null;
  created_at: string;
  profile?: Profile;
  goal?: Goal | null;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  activity_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ChallengeSummary extends Challenge {
  goals: Goal[];
  member_count: number;
  today_required_completed: number;
  total_required_goals: number;
  day_complete: boolean;
  current_streak: number;
  longest_streak: number;
}

export interface MemberProgress {
  member: ChallengeMember;
  requiredCompleted: number;
  totalRequired: number;
  dayComplete: boolean;
  currentStreak: number;
}

export interface LeaderboardEntry {
  profile: Profile;
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
}

export interface ChallengeDetail extends ChallengeSummary {
  members: ChallengeMember[];
  checkins: DailyCheckin[];
  feed: ActivityFeedItem[];
  memberProgress: MemberProgress[];
  leaderboard: LeaderboardEntry[];
}

export interface NewGoalInput {
  id?: string;
  title: string;
  description?: string;
  required: boolean;
  proof_type: ProofType;
  target_value?: number | null;
  target_unit?: string | null;
}

export interface NewChallengeInput {
  type: ChallengeType;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  reminder_time?: string | null;
  goals: NewGoalInput[];
}

export interface UpdateChallengeInput extends NewChallengeInput {
  id: string;
}

export interface CheckinPayload {
  challengeId: string;
  goal: Goal;
  userId: string;
  completed: boolean;
  proofImageUrl?: string | null;
  textResponse?: string | null;
  numericValue?: number | null;
}

export interface DashboardData {
  profile: Profile;
  groupChallenges: ChallengeSummary[];
  selfChallenges: ChallengeSummary[];
  pendingGoals: Array<{ challenge: ChallengeSummary; goal: Goal; checkin?: DailyCheckin }>;
  overallCurrentStreak: number;
  overallLongestStreak: number;
}
