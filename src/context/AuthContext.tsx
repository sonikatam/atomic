import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile } from '../types';
import { getCurrentUserProfile, signIn as signInService, signOut as signOutService, signUp as signUpService } from '../services/authService';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<Profile | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const current = await getCurrentUserProfile();
    setProfile(current);
  }

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      loading,
      signIn: async (email, password) => {
        const current = await signInService(email, password);
        setProfile(current);
        return current;
      },
      signUp: async (email, password, fullName) => {
        const current = await signUpService(email, password, fullName);
        setProfile(current);
        return current;
      },
      signOut: async () => {
        await signOutService();
        setProfile(null);
      },
      refreshProfile,
    }),
    [profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
