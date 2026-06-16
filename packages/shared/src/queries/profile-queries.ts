import type { TypedSupabaseClient } from '../supabase';
import type { Organization, Profile } from '../types';
import { unwrap } from './internal';

/** Perfil del usuario autenticado (o null si no hay sesión). */
export async function getMyProfile(supabase: TypedSupabaseClient): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Organización del usuario autenticado (o null para super_admin / sin org). */
export async function getMyOrganization(
  supabase: TypedSupabaseClient,
  organizationId: string | null,
): Promise<Organization | null> {
  if (!organizationId) return null;
  return unwrap(supabase.from('organizations').select('*').eq('id', organizationId).single());
}
