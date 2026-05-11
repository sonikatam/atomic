import { Flame } from 'lucide-react';
import type { ActivityFeedItem } from '../types';
import { timeAgo } from '../lib/utils';

export function FeedItem({ item, onReact }: { item: ActivityFeedItem; onReact: (activityId: string) => void }) {
  const reactionCount = item.reactions?.length ?? 0;
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex gap-3">
        <img
          src={item.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profile?.full_name || item.user_id}`}
          alt=""
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zinc-950">{item.profile?.full_name || 'atomic member'}</p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">{item.message}</p>
            </div>
            <span className="shrink-0 text-xs text-zinc-400">{timeAgo(item.created_at)}</span>
          </div>
          {item.proof_image_url ? <img src={item.proof_image_url} alt="Goal proof" className="mt-3 max-h-52 w-full rounded-lg object-cover" /> : null}
          <button
            type="button"
            onClick={() => onReact(item.id)}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950"
          >
            <Flame className="h-4 w-4 text-zinc-600" />
            {reactionCount}
          </button>
        </div>
      </div>
    </article>
  );
}
