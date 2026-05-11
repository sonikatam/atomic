import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinChallengeByInviteCode } from '../services/challengeService';

export function JoinChallengeForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setError('');
    setSaving(true);
    try {
      const challenge = await joinChallengeByInviteCode(inviteCode, profile.id);
      navigate(`/challenges/${challenge.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join challenge.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.055] p-5">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-ember/15 text-ember">
        <KeyRound className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white">Join a group challenge</h1>
      <p className="mt-2 text-sm leading-6 text-white/60">Enter the invite code your friend shared.</p>
      <input className="input mt-5 uppercase tracking-[0.28em]" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="CODE" required />
      {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
      <button type="submit" disabled={saving} className="btn-primary mt-5 w-full">
        {saving ? 'Joining...' : 'Join challenge'}
      </button>
    </form>
  );
}
