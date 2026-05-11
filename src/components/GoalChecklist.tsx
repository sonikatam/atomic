import type { DailyCheckin, Goal } from '../types';
import { GoalCheckItem } from './GoalCheckItem';
import { EmptyState } from './EmptyState';
import { ListChecks } from 'lucide-react';

interface GoalChecklistProps {
  goals: Goal[];
  checkins: DailyCheckin[];
  userId: string;
  onToggle: (goal: Goal, payload: { proofImageUrl?: string | null; textResponse?: string | null; numericValue?: number | null; completed: boolean }) => Promise<void>;
}

export function GoalChecklist({ goals, checkins, userId, onToggle }: GoalChecklistProps) {
  if (goals.length === 0) {
    return <EmptyState icon={ListChecks} title="No goals yet" description="Add goals to make this challenge trackable." />;
  }
  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <GoalCheckItem
          key={goal.id}
          goal={goal}
          checkin={checkins.find((checkin) => checkin.goal_id === goal.id && checkin.user_id === userId)}
          userId={userId}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
