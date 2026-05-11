import { Circle } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
    <div className="min-h-screen bg-[#f7f6f3] px-4 py-8 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-8 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white">
                <Circle className="h-3.5 w-3.5 fill-zinc-900 text-zinc-900" />
              </span>
              1% Club
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight md:text-6xl">Tiny wins, visible momentum.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
              Create habit challenges with friends, prove the work, keep your streak alive, and build private goals when the audience is just you.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {['Proof', 'Streaks', 'Friends'].map((item) => (
                <div key={item} className="rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-600">{item}</div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-2xl font-semibold tracking-tight">{mode === 'signup' ? 'Create your club account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {mode === 'signup' ? 'Start with a profile, then create or join your first challenge.' : 'Log in with your account.'}
            </p>
            {checkEmail ? (
              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-600">
                Check your email to confirm your account, then come back and log in.
              </div>
            ) : null}
            <div className="mt-6 grid gap-3">
              {mode === 'signup' ? <input className="input" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" required /> : null}
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
            </div>
            {error ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={saving} className="btn-primary mt-5 w-full">
              {saving ? 'Working...' : mode === 'signup' ? 'Sign up' : 'Log in'}
            </button>
            <p className="mt-5 text-center text-sm text-zinc-500">
              {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
              <Link className="font-semibold text-zinc-600" to={mode === 'signup' ? '/login' : '/signup'}>
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
