import { Flame, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-950">Leaderboard</h2>
        <Medal className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.profile.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-600">#{index + 1}</span>
            <img src={entry.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.profile.full_name}`} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-950">{entry.profile.full_name}</p>
              <p className="text-xs text-zinc-400">{entry.completedDays} complete days</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-zinc-600">
              <Flame className="h-4 w-4" />
              {entry.currentStreak}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
