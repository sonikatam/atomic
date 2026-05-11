import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChallenge } from '../services/challengeService';
import type { ChallengeType, NewGoalInput } from '../types';
import { todayISO } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { initialGoal } from '../data/defaults';
import { CreateGoalForm } from './CreateGoalForm';

export function CreateChallengeForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<ChallengeType>('group');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [reminderTime, setReminderTime] = useState('19:30');
  const [goals, setGoals] = useState<NewGoalInput[]>([{ ...initialGoal }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setError('');
    setSaving(true);
    try {
      const validGoals = goals.filter((goal) => goal.title.trim());
      if (validGoals.length === 0) throw new Error('Add at least one goal.');
      if (endDate < startDate) throw new Error('End date must be after the start date.');
      const challenge = await createChallenge({ type, name, description, start_date: startDate, end_date: endDate, reminder_time: reminderTime || null, goals: validGoals }, profile.id);
      navigate(challenge.type === 'self' ? `/self/${challenge.id}` : `/challenges/${challenge.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create challenge. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1">
          {(['group', 'self'] as ChallengeType[]).map((item) => (
            <button key={item} type="button" onClick={() => setType(item)} className={`rounded-xl px-4 py-3 text-sm font-bold capitalize transition ${type === item ? 'bg-white text-black' : 'text-white/55 hover:text-white'}`}>
              {item} challenge
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-3">
          <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Challenge name" required />
          <textarea className="input min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
            <input className="input" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
            <input className="input" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
          </div>
        </div>
      </div>
      <CreateGoalForm goals={goals} onChange={setGoals} />
      {error ? <p className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
      <button type="submit" disabled={saving} className="btn-primary w-full">
        <CalendarPlus className="h-5 w-5" />
        {saving ? 'Creating...' : 'Create challenge'}
      </button>
    </form>
  );
}
