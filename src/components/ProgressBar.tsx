import { cn, percent } from '../lib/utils';

export function ProgressBar({ value, total, className }: { value: number; total: number; className?: string }) {
  const width = percent(value, total);
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-zinc-100', className)}>
      <div
        className="h-full rounded-full bg-zinc-900 transition-all duration-500"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
