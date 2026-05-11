import { Flame, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <Medal className="h-5 w-5 text-lime" />
      </div>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.profile.id} className="flex items-center gap-3 rounded-2xl bg-black/20 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white/70">#{index + 1}</span>
            <img src={entry.profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.profile.full_name}`} alt="" className="h-10 w-10 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{entry.profile.full_name}</p>
              <p className="text-xs text-white/45">{entry.completedDays} complete days</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-ember">
              <Flame className="h-4 w-4" />
              {entry.currentStreak}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
