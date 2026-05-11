import { ArrowRight, CirclePlus, Flame, KeyRound, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChallengeCard } from '../components/ChallengeCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { StreakCard } from '../components/StreakCard';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/challengeService';
import type { DashboardData } from '../types';

export function DashboardPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (profile) getDashboardData(profile.id).then(setData);
  }, [profile]);

  if (!profile || !data) return <LoadingState />;

  return (
    <div className="space-y-7">
      <section className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8">
          <p className="text-sm font-semibold text-zinc-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{data.profile.full_name?.split(' ')[0] || 'Builder'}, get your 1% today.</h1>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/create" className="btn-primary">
              <CirclePlus className="h-5 w-5" />
              Create challenge
            </Link>
            <Link to="/join" className="btn-secondary">
              <KeyRound className="h-5 w-5" />
              Join by code
            </Link>
          </div>
        </div>
        <StreakCard current={data.overallCurrentStreak} longest={data.overallLongestStreak} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-950">Today’s pending goals</h2>
          <span className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">{data.pendingGoals.length} left</span>
        </div>
        {data.pendingGoals.length === 0 ? (
          <EmptyState icon={Flame} title="Today is complete" description="All required goals are handled." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.pendingGoals.slice(0, 6).map(({ challenge, goal }) => (
              <Link key={`${challenge.id}-${goal.id}`} to={challenge.type === 'self' ? `/self/${challenge.id}` : `/challenges/${challenge.id}`} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-950">{goal.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{challenge.name}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-400" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <ChallengeSection title="Group Challenges" icon={UsersRound} items={data.groupChallenges} empty="Create a group challenge or join with an invite code." />
      <ChallengeSection title="Self Challenges" icon={Flame} items={data.selfChallenges} empty="Create a private goal system that only you can see." />
    </div>
  );
}

function ChallengeSection({ title, icon: Icon, items, empty }: { title: string; icon: typeof UsersRound; items: DashboardData['groupChallenges']; empty: string }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-950">
          <Icon className="h-5 w-5 text-zinc-600" />
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} description={empty} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </section>
  );
}
