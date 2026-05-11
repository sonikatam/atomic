import { Check, Circle, Hash, Image, MessageSquareText } from 'lucide-react';
import { useState } from 'react';
import type { DailyCheckin, Goal } from '../types';
import { cn } from '../lib/utils';
import { ProofUploader } from './ProofUploader';

interface GoalCheckItemProps {
  goal: Goal;
  checkin?: DailyCheckin;
  userId: string;
  onToggle: (goal: Goal, payload: { proofImageUrl?: string | null; textResponse?: string | null; numericValue?: number | null; completed: boolean }) => Promise<void>;
}

export function GoalCheckItem({ goal, checkin, userId, onToggle }: GoalCheckItemProps) {
  const [proofImageUrl, setProofImageUrl] = useState(checkin?.proof_image_url);
  const [textResponse, setTextResponse] = useState(checkin?.text_response || '');
  const [numericValue, setNumericValue] = useState<number | ''>(checkin?.numeric_value ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const completed = Boolean(checkin?.completed);
  const Icon = goal.proof_type === 'photo' ? Image : goal.proof_type === 'text' ? MessageSquareText : goal.proof_type === 'number' ? Hash : Circle;

  async function toggle() {
    setSaving(true);
    setError('');
    try {
      await onToggle(goal, {
        completed: !completed,
        proofImageUrl,
        textResponse,
        numericValue: numericValue === '' ? null : Number(numericValue),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save check-in.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn('rounded-xl border p-4 transition', completed ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-200 bg-white')}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={cn('mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition', completed ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-zinc-50 text-zinc-400 hover:border-zinc-400')}
          aria-label={completed ? 'Uncheck goal' : 'Complete goal'}
        >
          <Check className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-zinc-950">{goal.title}</h4>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">{goal.required ? 'Required' : 'Optional'}</span>
          </div>
          {goal.description ? <p className="mt-1 text-sm leading-6 text-zinc-500">{goal.description}</p> : null}
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Icon className="h-4 w-4 text-zinc-600" />
            {goal.proof_type === 'none' ? 'No proof required' : `${goal.proof_type} proof`}
            {goal.target_value ? <span>{goal.target_value} {goal.target_unit}</span> : null}
          </div>
          {goal.proof_type === 'photo' ? <ProofUploader userId={userId} challengeId={goal.challenge_id} goalId={goal.id} value={proofImageUrl} onChange={setProofImageUrl} /> : null}
          {goal.proof_type === 'text' ? (
            <textarea
              value={textResponse}
              onChange={(event) => setTextResponse(event.target.value)}
              placeholder="Add your proof note..."
              className="mt-3 min-h-20 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-950 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2"
            />
          ) : null}
          {goal.proof_type === 'number' ? (
            <input
              type="number"
              value={numericValue}
              onChange={(event) => setNumericValue(event.target.value === '' ? '' : Number(event.target.value))}
              placeholder={`Enter ${goal.target_unit || 'value'}`}
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-950 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2"
            />
          ) : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
