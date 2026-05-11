import { CheckCircle2, Flame } from 'lucide-react';
import type { MemberProgress } from '../types';
import { ProgressBar } from './ProgressBar';

export function MemberProgressCard({ progress }: { progress: MemberProgress }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <img
          src={progress.member.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${progress.member.profile?.full_name || progress.member.user_id}`}
          alt=""
          className="h-11 w-11 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{progress.member.profile?.full_name || 'Member'}</p>
          <p className="text-xs text-white/45">{progress.member.role}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ember/10 px-2 py-1 text-xs font-bold text-ember">
          <Flame className="h-3.5 w-3.5" />
          {progress.currentStreak}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>Today</span>
          <span>{progress.requiredCompleted}/{progress.totalRequired}</span>
        </div>
        <ProgressBar value={progress.requiredCompleted} total={progress.totalRequired} />
      </div>
      {progress.dayComplete ? (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-lime">
          <CheckCircle2 className="h-4 w-4" />
          Completed today
        </div>
      ) : null}
    </div>
  );
}
