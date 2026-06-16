import { redirect } from 'next/navigation';
import type { Profile } from '@open-coach/shared';
import { createClient } from '@/lib/supabase/server';

export type TrainerContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
  organizationId: string;
};

/**
 * Garantiza que hay un entrenador autenticado con organización. Redirige a /login
 * o / si no cumple. Devuelve el cliente Supabase (con sesión), el perfil y el org id
 * para usarlos en Server Components y Server Actions del entrenador.
 */
export async function requireTrainer(): Promise<TrainerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'trainer' || !profile.organization_id) redirect('/');

  return { supabase, profile, organizationId: profile.organization_id };
}
