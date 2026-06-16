'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MembershipPlan } from '@open-coach/shared';
import {
  createPlanAction,
  updatePlanAction,
  type ActionState,
} from '@/app/(trainer)/trainer/plans/actions';
import { Field, FormAlert, SelectField, SubmitButton, TextAreaField } from '@/components/ui/form';

const initial: ActionState = {};

/** Formulario para crear (sin `plan`) o editar (con `plan`) un plan de membresía. */
export function PlanForm({ plan, onDone }: { plan?: MembershipPlan; onDone?: () => void }) {
  const action = plan ? updatePlanAction.bind(null, plan.id) : createPlanAction;
  const [state, formAction] = useActionState(action, initial);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (!plan) formRef.current?.reset();
      router.refresh();
      onDone?.();
    }
  }, [state.ok, plan, router, onDone]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre" name="name" defaultValue={plan?.name} required />
      <Field
        label="Precio (MXN / mes)"
        name="price"
        type="number"
        defaultValue={plan ? plan.price_cents / 100 : undefined}
      />
      <SelectField label="Intervalo" name="interval" defaultValue={plan?.interval ?? 'month'}>
        <option value="month">Mensual</option>
        <option value="year">Anual</option>
        <option value="custom">Personalizado</option>
      </SelectField>
      <div className="sm:col-span-2">
        <TextAreaField label="Descripción" name="description" defaultValue={plan?.description} />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton>{plan ? 'Guardar' : 'Crear plan'}</SubmitButton>
        <FormAlert state={state} />
      </div>
    </form>
  );
}

/** Botón que despliega el formulario de creación. */
export function NewPlanButton() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        + Nuevo plan
      </button>
    );
  }
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Nuevo plan</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-neutral-400 hover:text-neutral-200">
          Cerrar
        </button>
      </div>
      <PlanForm onDone={() => setOpen(false)} />
    </div>
  );
}
