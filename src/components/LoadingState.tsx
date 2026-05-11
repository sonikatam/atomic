import { Circle } from 'lucide-react';

export function LoadingState({ label = 'Loading your club...' }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-zinc-600">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm">
        <Circle className="h-7 w-7 animate-pulse text-zinc-600" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}
