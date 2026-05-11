import { Flame } from 'lucide-react';
import type { ActivityFeedItem } from '../types';
import { timeAgo } from '../lib/utils';

export function FeedItem({ item, onReact }: { item: ActivityFeedItem; onReact: (activityId: string) => void }) {
  const reactionCount = item.reactions?.length ?? 0;
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex gap-3">
        <img
          src={item.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.profile?.full_name || item.user_id}`}
          alt=""
          className="h-10 w-10 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{item.profile?.full_name || 'Club member'}</p>
              <p className="mt-1 text-sm leading-6 text-white/60">{item.message}</p>
            </div>
            <span className="shrink-0 text-xs text-white/35">{timeAgo(item.created_at)}</span>
          </div>
          {item.proof_image_url ? <img src={item.proof_image_url} alt="Goal proof" className="mt-3 max-h-52 w-full rounded-2xl object-cover" /> : null}
          <button
            type="button"
            onClick={() => onReact(item.id)}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm font-semibold text-white/65 transition hover:border-ember/50 hover:text-white"
          >
            <Flame className="h-4 w-4 text-ember" />
            {reactionCount}
          </button>
        </div>
      </div>
    </article>
  );
}
