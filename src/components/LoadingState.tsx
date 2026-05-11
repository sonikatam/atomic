import { Flame } from 'lucide-react';

export function LoadingState({ label = 'Loading your club...' }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-white/70">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-glow">
        <Flame className="h-7 w-7 animate-pulse text-ember" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}
