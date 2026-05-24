import { Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CreateGoalForm } from '../components/CreateGoalForm';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import { deleteChallenge, getChallengeDetail, updateChallenge } from '../services/challengeService';
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
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!detail || !profile || deleting) return;
    const confirmed = window.confirm(`Delete "${detail.name}"? This will remove the challenge, goals, check-ins, and activity feed.`);
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    try {
      await deleteChallenge(detail.id, profile.id);
      navigate(detail.type === 'self' ? '/self' : '/challenges');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete challenge.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-zinc-600">Edit challenge</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950">{detail.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
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
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-red-950">Delete challenge</h2>
            <p className="mt-1 text-sm leading-6 text-red-700">Remove this challenge and all of its saved progress.</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-5 w-5" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  );
}
