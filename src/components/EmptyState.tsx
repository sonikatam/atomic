import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50">
        <Icon className="h-6 w-6 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
