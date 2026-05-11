import { Flame, Trophy } from 'lucide-react';

export function StreakCard({ current, longest, label = 'Overall streak' }: { current: number; longest: number; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-950">{current}</span>
            <span className="pb-2 text-sm font-medium text-zinc-500">days</span>
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
          <Flame className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-5 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
        <Trophy className="h-4 w-4 text-zinc-500" />
        Longest streak: <span className="font-semibold text-zinc-950">{longest}</span>
      </div>
    </div>
  );
}
