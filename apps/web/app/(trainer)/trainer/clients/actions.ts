'use server';

import { revalidatePath } from 'next/cache';
import {
  assignMembershipSchema,
  inviteClientSchema,
  updateClient,
  updateClientSchema,
  assignMembership,
  deactivateClient,
} from '@open-coach/shared';
import { requireTrainer } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export type ActionState = { error?: string; ok?: boolean };

/**
 * Invita a un cliente por correo. Usa el cliente admin (secret key) para crear el
 * usuario en auth; el trigger handle_new_user crea su profile con la metadata
 * (organization_id, role=client, full_name). Luego completa datos opcionales.
 */
export async function inviteClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { organizationId } = await requireTrainer();

  const parsed = inviteClientSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    birthDate: formData.get('birthDate') || null,
    medicalNotes: formData.get('medicalNotes') || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      organization_id: organizationId,
      role: 'client',
      full_name: parsed.data.fullName,
    },
  });
  if (error) return { error: error.message };

  const userId = data.user?.id;
  if (userId) {
    // El profile ya existe (trigger). Completar datos opcionales con el admin (bypassa RLS).
    await admin
      .from('profiles')
      .update({
        phone: parsed.data.phone ?? null,
        birth_date: parsed.data.birthDate ?? null,
        medical_notes: parsed.data.medicalNotes ?? null,
      })
      .eq('id', userId);
  }

  revalidatePath('/trainer/clients');
  return { ok: true };
}

/** Edita los datos de un cliente (entrenador). */
export async function updateClientAction(
  clientId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireTrainer();

  const parsed = updateClientSchema.safeParse({
    fullName: formData.get('fullName') || undefined,
    phone: formData.get('phone') || null,
    birthDate: formData.get('birthDate') || null,
    medicalNotes: formData.get('medicalNotes') || null,
    status: formData.get('status') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    await updateClient(supabase, clientId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo actualizar' };
  }

  revalidatePath(`/trainer/clients/${clientId}`);
  revalidatePath('/trainer/clients');
  return { ok: true };
}

/** Baja lógica de un cliente. */
export async function deactivateClientAction(formData: FormData): Promise<void> {
  const { supabase } = await requireTrainer();
  const clientId = String(formData.get('clientId'));
  await deactivateClient(supabase, clientId);
  revalidatePath('/trainer/clients');
  revalidatePath(`/trainer/clients/${clientId}`);
}

/** Asigna (o cambia) el plan de membresía de un cliente. */
export async function assignMembershipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, organizationId } = await requireTrainer();

  const parsed = assignMembershipSchema.safeParse({
    clientId: formData.get('clientId'),
    planId: formData.get('planId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || null,
    status: formData.get('status') || 'active',
    paymentMethod: formData.get('paymentMethod') || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  try {
    await assignMembership(supabase, organizationId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'No se pudo asignar el plan' };
  }

  revalidatePath(`/trainer/clients/${parsed.data.clientId}`);
  return { ok: true };
}
