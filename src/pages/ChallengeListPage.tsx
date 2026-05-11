import { CirclePlus, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChallengeCard } from '../components/ChallengeCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { getChallenges } from '../services/challengeService';
import type { ChallengeSummary } from '../types';

export function ChallengeListPage({ type = 'group' }: { type?: 'group' | 'self' }) {
  const { profile } = useAuth();
  const [items, setItems] = useState<ChallengeSummary[] | null>(null);

  useEffect(() => {
    if (profile) getChallenges(profile.id, type).then(setItems);
  }, [profile, type]);

  if (!items) return <LoadingState />;
  const isSelf = type === 'self';
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-ember">{isSelf ? 'Private mode' : 'Social mode'}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white">{isSelf ? 'Self Challenges' : 'Group Challenges'}</h1>
          <p className="mt-2 text-sm text-white/55">{isSelf ? 'Track goals nobody else needs to see.' : 'See your friend groups and their daily progress.'}</p>
        </div>
        <Link to="/create" className="btn-primary">
          <CirclePlus className="h-5 w-5" />
          Create
        </Link>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={UsersRound} title="Nothing here yet" description={isSelf ? 'Create your first private self challenge.' : 'Create a group challenge or join a friend with an invite code.'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
