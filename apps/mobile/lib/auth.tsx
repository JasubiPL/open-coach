import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from '@open-coach/shared';
import { supabase } from './supabase';

type AuthValue = {
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, role: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
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

  useEffect(() => {
    if (!session) {
      setRole(null);
      return;
    }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [session]);

  return <AuthContext.Provider value={{ session, role, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
