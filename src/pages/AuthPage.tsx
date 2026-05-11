import { Flame } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function SignupPage() {
  return <AuthForm mode="signup" />;
}

function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { profile, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('maya@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Maya Chen');
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const [saving, setSaving] = useState(false);

  if (profile) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setCheckEmail(false);
    try {
      if (mode === 'signup') {
        const signedUpProfile = await signUp(email, password, fullName);
        if (!signedUpProfile) {
          setCheckEmail(true);
          return;
        }
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete authentication.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-8 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(255,122,26,0.32),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(183,255,90,0.12),transparent_26%),linear-gradient(180deg,#090A12,#111018)]" />
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-8 flex items-center gap-3 font-black tracking-tight">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ember to-coral shadow-glow">
                <Flame className="h-6 w-6" />
              </span>
              1% Club
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">Tiny wins, visible momentum.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
              Create habit challenges with friends, prove the work, keep your streak alive, and build private goals when the audience is just you.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {['Proof', 'Streaks', 'Friends'].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-sm font-bold text-white/70">{item}</div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl md:p-7">
            <h2 className="text-2xl font-black tracking-tight">{mode === 'signup' ? 'Create your club account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {mode === 'signup' ? 'Start with a profile, then create or join your first challenge.' : 'Log in with your account.'}
            </p>
            {checkEmail ? (
              <div className="mt-5 rounded-2xl border border-lime/25 bg-lime/10 px-4 py-3 text-sm leading-6 text-lime">
                Check your email to confirm your account, then come back and log in.
              </div>
            ) : null}
            <div className="mt-6 grid gap-3">
              {mode === 'signup' ? <input className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" required /> : null}
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
            </div>
            {error ? <p className="mt-3 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
            <button type="submit" disabled={saving} className="btn-primary mt-5 w-full">
              {saving ? 'Working...' : mode === 'signup' ? 'Sign up' : 'Log in'}
            </button>
            <p className="mt-5 text-center text-sm text-white/50">
              {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
              <Link className="font-semibold text-ember" to={mode === 'signup' ? '/login' : '/signup'}>
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
