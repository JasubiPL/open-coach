import type { MembershipPlanInput } from '../schemas';
import type { TypedSupabaseClient } from '../supabase';
import type { MembershipPlan } from '../types';
import { unwrap } from './internal';

/** Planes de membresía de una organización. `onlyActive` filtra los archivados. */
export async function listMembershipPlans(
  supabase: TypedSupabaseClient,
  organizationId: string,
  onlyActive = false,
): Promise<MembershipPlan[]> {
  let query = supabase
    .from('membership_plans')
    .select('*')
    .eq('organization_id', organizationId)
    .order('price_cents', { ascending: true });

  if (onlyActive) query = query.eq('active', true);
  return unwrap(query);
}

function toRow(input: MembershipPlanInput) {
  return {
    name: input.name,
    description: input.description ?? null,
    price_cents: input.priceCents,
    currency: input.currency,
    interval: input.interval,
    features: (input.features ?? {}) as MembershipPlan['features'],
    active: input.active ?? true,
  };
}

/** Crea un plan en la organización. */
export async function createPlan(
  supabase: TypedSupabaseClient,
  organizationId: string,
  input: MembershipPlanInput,
): Promise<MembershipPlan> {
  return unwrap(
    supabase
      .from('membership_plans')
      .insert({ organization_id: organizationId, ...toRow(input) })
      .select('*')
      .single(),
  );
}

/** Actualiza un plan existente. */
export async function updatePlan(
  supabase: TypedSupabaseClient,
  planId: string,
  input: MembershipPlanInput,
): Promise<MembershipPlan> {
  return unwrap(
    supabase.from('membership_plans').update(toRow(input)).eq('id', planId).select('*').single(),
  );
}

/** Archiva un plan (active = false); no se borra para preservar histórico. */
export async function archivePlan(
  supabase: TypedSupabaseClient,
  planId: string,
): Promise<MembershipPlan> {
  return unwrap(
    supabase.from('membership_plans').update({ active: false }).eq('id', planId).select('*').single(),
  );
}
