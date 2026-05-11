import { Activity } from 'lucide-react';
import type { ActivityFeedItem } from '../types';
import { EmptyState } from './EmptyState';
import { FeedItem } from './FeedItem';

export function GroupFeed({ items, onReact }: { items: ActivityFeedItem[]; onReact: (activityId: string) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-950">Group feed</h2>
        <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">{items.length} updates</span>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Activity} title="No feed activity yet" description="Complete a goal and the group feed will start to light up." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FeedItem key={item.id} item={item} onReact={onReact} />
          ))}
        </div>
      )}
    </section>
  );
}
