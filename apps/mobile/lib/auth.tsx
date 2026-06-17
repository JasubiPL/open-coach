import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getMyProfile, type Profile, type UserRole } from '@open-coach/shared';
import { supabase } from './supabase';

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  organizationId: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  profile: null,
  role: null,
  organizationId: null,
  loading: true,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadProfile = useCallback(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    getMyProfile(supabase)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [session]);

  useEffect(loadProfile, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        role: profile?.role ?? null,
        organizationId: profile?.organization_id ?? null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
