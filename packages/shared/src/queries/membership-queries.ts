import type { AssignMembershipInput } from '../schemas';
import type { TypedSupabaseClient } from '../supabase';
import type { ClientMembership } from '../types';
import { unwrap } from './internal';

/**
 * Membresía activa del cliente (la más reciente con status 'active'), o null.
 * Decisión: una sola membresía activa por cliente a la vez (+ histórico).
 */
export async function getClientMembership(
  supabase: TypedSupabaseClient,
  clientId: string,
): Promise<ClientMembership | null> {
  const { data, error } = await supabase
    .from('client_memberships')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Asigna un plan a un cliente. Expira la membresía activa previa (si la hay) para
 * mantener la invariante "una activa por cliente" y crea la nueva fila histórica.
 */
export async function assignMembership(
  supabase: TypedSupabaseClient,
  organizationId: string,
  input: AssignMembershipInput,
): Promise<ClientMembership> {
  if (input.status === 'active') {
    const { error: expireError } = await supabase
      .from('client_memberships')
      .update({ status: 'expired' })
      .eq('client_id', input.clientId)
      .eq('status', 'active');
    if (expireError) throw expireError;
  }

  return unwrap(
    supabase
      .from('client_memberships')
      .insert({
        organization_id: organizationId,
        client_id: input.clientId,
        plan_id: input.planId,
        status: input.status,
        start_date: input.startDate,
        end_date: input.endDate ?? null,
        payment_method: input.paymentMethod ?? null,
      })
      .select('*')
      .single(),
  );
}
