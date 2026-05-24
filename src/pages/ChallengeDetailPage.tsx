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
  const [selectedDate, setSelectedDate] = useState(todayISO());

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

  useEffect(() => {
    if (!detail) return;
    const maxEditableDate = detail.end_date < todayISO() ? detail.end_date : todayISO();
    if (detail.start_date > todayISO()) return;
    if (selectedDate < detail.start_date) setSelectedDate(detail.start_date);
    if (selectedDate > maxEditableDate) setSelectedDate(maxEditableDate);
  }, [detail, selectedDate]);

  if (loading) return <LoadingState />;
  if (!detail) return <Navigate to="/dashboard" replace />;
  if (selfOnly && detail.type !== 'self') return <Navigate to={`/challenges/${detail.id}`} replace />;

  const isSelf = detail.type === 'self';
  const canEdit = detail.created_by === profile?.id;
  const selectedDateCheckins = detail.checkins.filter((checkin) => checkin.checkin_date === selectedDate);
  const status = isBeforeToday(detail.start_date) ? (isBeforeToday(detail.end_date) ? 'Ended' : 'Active') : isAfterToday(detail.start_date) ? 'Not started' : 'Active';
  const maxEditableDate = detail.end_date < todayISO() ? detail.end_date : todayISO();
  const canEditDays = detail.start_date <= todayISO();

  async function handleToggle(goal: Goal, payload: { proofImageUrl?: string | null; textResponse?: string | null; numericValue?: number | null; completed: boolean }) {
    if (!profile || !detail) return;
    await upsertCheckin({
      challengeId: detail.id,
      goal,
      userId: profile.id,
      checkinDate: selectedDate,
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
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">{status}</span>
              <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">{isSelf ? 'Private self challenge' : 'Group challenge'}</span>
              {isSelf ? <Lock className="h-4 w-4 text-zinc-400" /> : null}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{detail.name}</h1>
            <p className="mt-3 text-sm leading-7 text-zinc-500">{detail.description || 'No description yet.'}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                {formatDateLong(detail.start_date)} to {formatDateLong(detail.end_date)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                <Flame className="h-4 w-4 text-zinc-600" />
                {detail.current_streak}-day streak
              </span>
              {!isSelf ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <UsersRound className="h-4 w-4 text-zinc-500" />
                  Code {detail.invite_code}
                </span>
              ) : null}
              {canEdit ? (
                <Link to={isSelf ? `/self/${detail.id}/edit` : `/challenges/${detail.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 font-semibold text-zinc-950 transition hover:border-zinc-300">
                  <Pencil className="h-4 w-4 text-zinc-600" />
                  Edit
                </Link>
              ) : null}
            </div>
          </div>
          <div className="min-w-56 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">{daysRemaining(detail.end_date)} days remaining</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold text-zinc-950">{detail.today_required_completed}</span>
              <span className="pb-1 text-sm text-zinc-500">/ {detail.total_required_goals} today</span>
            </div>
            <ProgressBar className="mt-4" value={detail.today_required_completed} total={detail.total_required_goals} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-950">{selectedDate === todayISO() ? 'Today’s goals' : 'Daily goals'}</h2>
            <input
              type="date"
              value={selectedDate}
              min={detail.start_date}
              max={maxEditableDate}
              disabled={!canEditDays}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 outline-none ring-zinc-900/10 focus:border-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Select check-in date"
            />
          </div>
          <GoalChecklist goals={detail.goals} checkins={selectedDateCheckins} userId={profile!.id} selectedDate={selectedDate} onToggle={handleToggle} />
          {isSelf ? (
            <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-950">Progress calendar</h2>
                <Archive className="h-5 w-5 text-zinc-400" />
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
              <h2 className="mb-4 text-xl font-semibold text-zinc-950">Member progress</h2>
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
        <div key={index} className={`aspect-square rounded-md border ${index < completedDays ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200 bg-zinc-100'}`} />
      ))}
    </div>
  );
}
