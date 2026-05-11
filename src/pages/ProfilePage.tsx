import { LogOut, Mail, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasSupabaseEnv } from '../lib/supabase';

export function ProfilePage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  if (!profile) return null;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <img src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} alt="" className="h-20 w-20 rounded-xl object-cover" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">{profile.full_name || '1% Club member'}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <Mail className="h-4 w-4" />
              {profile.email}
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-950">
          <UserCircle className="h-5 w-5 text-zinc-600" />
          Account setup
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          {hasSupabaseEnv
            ? 'Supabase is configured. Auth, database rows, and storage uploads will use your project.'
            : 'Running in mock mode because Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use your project.'}
        </p>
      </section>
      <button onClick={handleSignOut} className="btn-secondary w-full" type="button">
        <LogOut className="h-5 w-5" />
        Log out
      </button>
    </div>
  );
}
