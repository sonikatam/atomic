import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CreateGoalForm } from '../components/CreateGoalForm';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { getChallengeDetail, updateChallenge } from '../services/challengeService';
import type { ChallengeDetail, NewGoalInput } from '../types';

export function EditChallengePage({ selfOnly = false }: { selfOnly?: boolean }) {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [goals, setGoals] = useState<NewGoalInput[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id || !profile) return;
      setLoading(true);
      const result = await getChallengeDetail(id, profile.id);
      setDetail(result);
      if (result) {
        setName(result.name);
        setDescription(result.description || '');
        setStartDate(result.start_date);
        setEndDate(result.end_date);
        setReminderTime(result.reminder_time || '');
        setGoals(
          result.goals.map((goal) => ({
            id: goal.id,
            title: goal.title,
            description: goal.description || '',
            required: goal.required,
            proof_type: goal.proof_type,
            target_value: goal.target_value,
            target_unit: goal.target_unit || '',
          })),
        );
      }
      setLoading(false);
    }
    load();
  }, [id, profile]);

  if (loading) return <LoadingState />;
  if (!detail || !profile) return <Navigate to="/dashboard" replace />;
  if (selfOnly && detail.type !== 'self') return <Navigate to={`/challenges/${detail.id}/edit`} replace />;
  if (detail.created_by !== profile.id) return <Navigate to={detail.type === 'self' ? `/self/${detail.id}` : `/challenges/${detail.id}`} replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!detail || !profile) return;
    setSaving(true);
    setError('');
    try {
      const validGoals = goals.filter((goal) => goal.title.trim());
      if (validGoals.length === 0) throw new Error('Keep at least one goal.');
      if (endDate < startDate) throw new Error('End date must be after the start date.');
      const updated = await updateChallenge(
        {
          id: detail.id,
          type: detail.type,
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          reminder_time: reminderTime || null,
          goals: validGoals,
        },
        profile.id,
      );
      navigate(updated.type === 'self' ? `/self/${updated.id}` : `/challenges/${updated.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-ember">Edit challenge</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">{detail.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
          <div className="grid gap-3">
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
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
