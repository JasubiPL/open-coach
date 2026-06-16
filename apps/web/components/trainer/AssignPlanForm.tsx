'use client';

import { useActionState } from 'react';
import type { MembershipPlan } from '@open-coach/shared';
import { assignMembershipAction, type ActionState } from '@/app/(trainer)/trainer/clients/actions';
import { Field, FormAlert, SelectField, SubmitButton } from '@/components/ui/form';

const initial: ActionState = {};

export function AssignPlanForm({ clientId, plans }: { clientId: string; plans: MembershipPlan[] }) {
  const [state, formAction] = useActionState(assignMembershipAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  if (plans.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        No hay planes activos. Crea uno en <span className="text-accent">Planes</span> para poder asignarlo.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="clientId" value={clientId} />
      <SelectField label="Plan" name="planId">
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Estado" name="status" defaultValue="active">
        <option value="active">Activa</option>
        <option value="pending">Pendiente</option>
      </SelectField>
      <Field label="Inicia" name="startDate" type="date" defaultValue={today} required />
      <Field label="Vence" name="endDate" type="date" />
      <SelectField label="Método de pago" name="paymentMethod" defaultValue="">
        <option value="">—</option>
        <option value="cash">Efectivo</option>
        <option value="transfer">Transferencia</option>
        <option value="card">Tarjeta</option>
        <option value="other">Otro</option>
      </SelectField>
      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton>Asignar plan</SubmitButton>
        <FormAlert state={state} />
      </div>
    </form>
  );
}
