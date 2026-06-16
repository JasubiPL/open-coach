import type { ClientListFilter, UpdateClientInput } from '../schemas';
import type { TypedSupabaseClient } from '../supabase';
import type { Database, Profile } from '../types';
import { unwrap } from './internal';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Lista los clientes de una organización. La RLS ya restringe al org del
 * entrenador, pero filtramos por `organization_id` y `role` para que la query sea
 * explícita y reutilizable. `search` busca por nombre o correo.
 */
export async function listClients(
  supabase: TypedSupabaseClient,
  organizationId: string,
  filter: ClientListFilter = {},
): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('role', 'client')
    .order('full_name', { ascending: true });

  if (filter.status) query = query.eq('status', filter.status);
  if (filter.search) {
    const term = `%${filter.search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }

  return unwrap(query);
}

/** Un cliente por id (RLS limita a su organización). */
export async function getClient(supabase: TypedSupabaseClient, clientId: string): Promise<Profile> {
  return unwrap(supabase.from('profiles').select('*').eq('id', clientId).single());
}

/** Actualiza datos del cliente (entrenador). Mapea camelCase → snake_case. */
export async function updateClient(
  supabase: TypedSupabaseClient,
  clientId: string,
  input: UpdateClientInput,
): Promise<Profile> {
  const patch: ProfileUpdate = {};
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.birthDate !== undefined) patch.birth_date = input.birthDate;
  if (input.medicalNotes !== undefined) patch.medical_notes = input.medicalNotes;
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
  if (input.status !== undefined) patch.status = input.status;

  return unwrap(supabase.from('profiles').update(patch).eq('id', clientId).select('*').single());
}

/** Baja lógica de un cliente (status = 'inactive'). */
export async function deactivateClient(
  supabase: TypedSupabaseClient,
  clientId: string,
): Promise<Profile> {
  return unwrap(
    supabase.from('profiles').update({ status: 'inactive' }).eq('id', clientId).select('*').single(),
  );
}
