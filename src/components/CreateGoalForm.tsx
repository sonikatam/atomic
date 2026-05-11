import { Plus, Trash2 } from 'lucide-react';
import type { NewGoalInput, ProofType } from '../types';
import { initialGoal } from '../data/defaults';

interface CreateGoalFormProps {
  goals: NewGoalInput[];
  onChange: (goals: NewGoalInput[]) => void;
}

export function CreateGoalForm({ goals, onChange }: CreateGoalFormProps) {
  function updateGoal(index: number, updates: Partial<NewGoalInput>) {
    onChange(goals.map((goal, current) => (current === index ? { ...goal, ...updates } : goal)));
  }

  return (
    <div className="space-y-3">
      {goals.map((goal, index) => (
        <div key={index} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-zinc-950">Goal {index + 1}</h3>
            {goals.length > 1 ? (
              <button type="button" onClick={() => onChange(goals.filter((_, current) => current !== index))} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="mt-3 grid gap-3">
            <input className="input" value={goal.title} onChange={(event) => updateGoal(index, { title: event.target.value })} placeholder="Goal title" required />
            <input className="input" value={goal.description || ''} onChange={(event) => updateGoal(index, { description: event.target.value })} placeholder="Description" />
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-600">
                <input type="checkbox" checked={goal.required} onChange={(event) => updateGoal(index, { required: event.target.checked })} />
                Required
              </label>
              <select className="input" value={goal.proof_type} onChange={(event) => updateGoal(index, { proof_type: event.target.value as ProofType })}>
                <option value="none">No proof</option>
                <option value="photo">Photo proof</option>
                <option value="text">Text proof</option>
                <option value="number">Number proof</option>
              </select>
            </div>
            {goal.proof_type === 'number' ? (
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="number" value={goal.target_value ?? ''} onChange={(event) => updateGoal(index, { target_value: event.target.value ? Number(event.target.value) : null })} placeholder="Optional target" />
                <input className="input" value={goal.target_unit || ''} onChange={(event) => updateGoal(index, { target_unit: event.target.value })} placeholder="Unit, e.g. min" />
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...goals, { ...initialGoal }])} className="btn-secondary w-full">
        <Plus className="h-4 w-4" />
        Add another goal
      </button>
    </div>
  );
}
