import { Flame, Trophy } from 'lucide-react';

export function StreakCard({ current, longest, label = 'Overall streak' }: { current: number; longest: number; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-5 shadow-glow">
      <div className="absolute right-[-30px] top-[-36px] h-28 w-28 rounded-full bg-ember/20 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/55">{label}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight text-white">{current}</span>
            <span className="pb-2 text-sm font-medium text-white/60">days</span>
          </div>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/15 text-ember">
          <Flame className="h-7 w-7" />
        </div>
      </div>
      <div className="relative mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65">
        <Trophy className="h-4 w-4 text-lime" />
        Longest streak: <span className="font-semibold text-white">{longest}</span>
      </div>
    </div>
  );
}
