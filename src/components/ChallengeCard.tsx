import { CalendarDays, Flame, Lock, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChallengeSummary } from '../types';
import { daysRemaining, formatDate, percent } from '../lib/utils';
import { ProgressBar } from './ProgressBar';

export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  const route = challenge.type === 'self' ? `/self/${challenge.id}` : `/challenges/${challenge.id}`;
  return (
    <Link to={route} className="group block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500">
              {challenge.type === 'group' ? 'Group' : 'Private'}
            </span>
            {challenge.type === 'self' ? <Lock className="h-4 w-4 text-zinc-400" /> : null}
          </div>
          <h3 className="text-base font-semibold text-zinc-950">{challenge.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">{challenge.description || 'Build a better day, one required goal at a time.'}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
          <Flame className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500">
          <span>Today</span>
          <span>{percent(challenge.today_required_completed, challenge.total_required_goals)}%</span>
        </div>
        <ProgressBar value={challenge.today_required_completed} total={challenge.total_required_goals} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-zinc-500">
        <div className="rounded-lg bg-zinc-50 p-3">
          <Flame className="mb-1 h-4 w-4 text-zinc-500" />
          <span className="font-semibold text-zinc-950">{challenge.current_streak}</span> streak
        </div>
        <div className="rounded-lg bg-zinc-50 p-3">
          <CalendarDays className="mb-1 h-4 w-4 text-zinc-500" />
          {formatDate(challenge.start_date)}-{formatDate(challenge.end_date)}
        </div>
        <div className="rounded-lg bg-zinc-50 p-3">
          <UsersRound className="mb-1 h-4 w-4 text-zinc-500" />
          {challenge.type === 'group' ? `${challenge.member_count} members` : `${daysRemaining(challenge.end_date)} days`}
        </div>
      </div>
    </Link>
  );
}
