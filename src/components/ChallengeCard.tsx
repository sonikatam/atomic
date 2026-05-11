import { CalendarDays, Flame, Lock, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChallengeSummary } from '../types';
import { daysRemaining, formatDate, percent } from '../lib/utils';
import { ProgressBar } from './ProgressBar';

export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  const route = challenge.type === 'self' ? `/self/${challenge.id}` : `/challenges/${challenge.id}`;
  return (
    <Link to={route} className="group block rounded-3xl border border-white/10 bg-white/[0.055] p-5 transition hover:-translate-y-0.5 hover:border-ember/40 hover:bg-white/[0.08]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold text-white/60">
              {challenge.type === 'group' ? 'Group' : 'Private'}
            </span>
            {challenge.type === 'self' ? <Lock className="h-4 w-4 text-white/35" /> : null}
          </div>
          <h3 className="text-lg font-bold text-white">{challenge.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">{challenge.description || 'Build a better day, one required goal at a time.'}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ember/25 to-coral/20 text-ember">
          <Flame className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/55">
          <span>Today</span>
          <span>{percent(challenge.today_required_completed, challenge.total_required_goals)}%</span>
        </div>
        <ProgressBar value={challenge.today_required_completed} total={challenge.total_required_goals} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-white/55">
        <div className="rounded-2xl bg-black/20 p-3">
          <Flame className="mb-1 h-4 w-4 text-ember" />
          <span className="font-semibold text-white">{challenge.current_streak}</span> streak
        </div>
        <div className="rounded-2xl bg-black/20 p-3">
          <CalendarDays className="mb-1 h-4 w-4 text-skyglass" />
          {formatDate(challenge.start_date)}-{formatDate(challenge.end_date)}
        </div>
        <div className="rounded-2xl bg-black/20 p-3">
          <UsersRound className="mb-1 h-4 w-4 text-lime" />
          {challenge.type === 'group' ? `${challenge.member_count} members` : `${daysRemaining(challenge.end_date)} days`}
        </div>
      </div>
    </Link>
  );
}
