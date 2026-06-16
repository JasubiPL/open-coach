'use server';

import { revalidatePath } from 'next/cache';
import { archivePlan, createPlan, membershipPlanSchema, updatePlan } from '@open-coach/shared';
import { requireTrainer } from '@/lib/auth';

export type ActionState = { error?: string; ok?: boolean };

function parsePlan(formData: FormData) {
  // Precio se captura en pesos (UI) y se persiste en centavos.
  const priceMxn = Number(formData.get('price') ?? 0);
  return membershipPlanSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    priceCents: Math.round((Number.isFinite(priceMxn) ? priceMxn : 0) * 100),
    currency: 'MXN',
    interval: formData.get('interval') || 'month',
    active: formData.get('active') !== 'false',
  });
}

export async function createPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, organizationId } = await requireTrainer();
  const parsed = parsePlan(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    await createPlan(supabase, organizationId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo crear el plan' };
  }
  revalidatePath('/trainer/plans');
  return { ok: true };
}

export async function updatePlanAction(
  planId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireTrainer();
  const parsed = parsePlan(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    await updatePlan(supabase, planId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo actualizar el plan' };
  }
  revalidatePath('/trainer/plans');
  return { ok: true };
}

export async function archivePlanAction(formData: FormData): Promise<void> {
  const { supabase } = await requireTrainer();
  await archivePlan(supabase, String(formData.get('planId')));
  revalidatePath('/trainer/plans');
}
