import { Archive, CalendarDays, Flame, Lock, Pencil, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { GoalChecklist } from '../components/GoalChecklist';
import { GroupFeed } from '../components/GroupFeed';
import { Leaderboard } from '../components/Leaderboard';
import { LoadingState } from '../components/LoadingState';
import { MemberProgressCard } from '../components/MemberProgressCard';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { daysRemaining, formatDateLong, isAfterToday, isBeforeToday, todayISO } from '../lib/utils';
import { getChallengeDetail } from '../services/challengeService';
import { upsertCheckin } from '../services/checkinService';
import { toggleFireReaction } from '../services/feedService';
import type { ChallengeDetail, Goal } from '../types';

export function ChallengeDetailPage({ selfOnly = false }: { selfOnly?: boolean }) {
  const { id } = useParams();
  const { profile } = useAuth();
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id || !profile) return;
    setLoading(true);
    const result = await getChallengeDetail(id, profile.id);
    setDetail(result);
    setLoading(false);
  }, [id, profile]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState />;
  if (!detail) return <Navigate to="/dashboard" replace />;
  if (selfOnly && detail.type !== 'self') return <Navigate to={`/challenges/${detail.id}`} replace />;

  const isSelf = detail.type === 'self';
  const canEdit = detail.created_by === profile?.id;
  const todayCheckins = detail.checkins.filter((checkin) => checkin.checkin_date === todayISO());
  const status = isBeforeToday(detail.start_date) ? (isBeforeToday(detail.end_date) ? 'Ended' : 'Active') : isAfterToday(detail.start_date) ? 'Not started' : 'Active';

  async function handleToggle(goal: Goal, payload: { proofImageUrl?: string | null; textResponse?: string | null; numericValue?: number | null; completed: boolean }) {
    if (!profile || !detail) return;
    await upsertCheckin({
      challengeId: detail.id,
      goal,
      userId: profile.id,
      completed: payload.completed,
      proofImageUrl: payload.proofImageUrl,
      textResponse: payload.textResponse,
      numericValue: payload.numericValue,
    });
    await load();
  }

  async function handleReact(activityId: string) {
    if (!profile) return;
    await toggleFireReaction(activityId, profile.id);
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ember/15 px-3 py-1 text-xs font-bold text-ember">{status}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/55">{isSelf ? 'Private self challenge' : 'Group challenge'}</span>
              {isSelf ? <Lock className="h-4 w-4 text-white/35" /> : null}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">{detail.name}</h1>
            <p className="mt-3 text-sm leading-7 text-white/60">{detail.description || 'No description yet.'}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/55">
              <span className="inline-flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-skyglass" />
                {formatDateLong(detail.start_date)} to {formatDateLong(detail.end_date)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2">
                <Flame className="h-4 w-4 text-ember" />
                {detail.current_streak}-day streak
              </span>
              {!isSelf ? (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2">
                  <UsersRound className="h-4 w-4 text-lime" />
                  Code {detail.invite_code}
                </span>
              ) : null}
              {canEdit ? (
                <Link to={isSelf ? `/self/${detail.id}/edit` : `/challenges/${detail.id}/edit`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 font-semibold text-white transition hover:border-ember/40">
                  <Pencil className="h-4 w-4 text-ember" />
                  Edit
                </Link>
              ) : null}
            </div>
          </div>
          <div className="min-w-56 rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/50">{daysRemaining(detail.end_date)} days remaining</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-black text-white">{detail.today_required_completed}</span>
              <span className="pb-1 text-sm text-white/50">/ {detail.total_required_goals} today</span>
            </div>
            <ProgressBar className="mt-4" value={detail.today_required_completed} total={detail.total_required_goals} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Today’s goals</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/50">{todayISO()}</span>
          </div>
          <GoalChecklist goals={detail.goals} checkins={todayCheckins} userId={profile!.id} onToggle={handleToggle} />
          {isSelf ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Progress calendar</h2>
                <Archive className="h-5 w-5 text-white/35" />
              </div>
              <CalendarDots completedDays={detail.longest_streak + detail.current_streak} />
              <button className="btn-secondary mt-5 w-full" type="button">Archive when complete</button>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          {isSelf ? null : <Leaderboard entries={detail.leaderboard} />}
          {!isSelf ? (
            <section>
              <h2 className="mb-4 text-xl font-bold text-white">Member progress</h2>
              <div className="space-y-3">
                {detail.memberProgress.map((progress) => (
                  <MemberProgressCard key={progress.member.id} progress={progress} />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      {!isSelf ? <GroupFeed items={detail.feed} onReact={handleReact} /> : null}
    </div>
  );
}

function CalendarDots({ completedDays }: { completedDays: number }) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 28 }).map((_, index) => (
        <div key={index} className={`aspect-square rounded-xl border ${index < completedDays ? 'border-ember/40 bg-ember/70' : 'border-white/10 bg-black/30'}`} />
      ))}
    </div>
  );
}
