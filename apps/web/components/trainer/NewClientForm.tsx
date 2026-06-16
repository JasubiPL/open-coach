'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { inviteClientAction, type ActionState } from '@/app/(trainer)/trainer/clients/actions';

const initial: ActionState = {};

export function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(inviteClientAction, initial);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
      >
        + Nuevo cliente
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Invitar cliente</h2>
        <button onClick={() => setOpen(false)} className="text-sm text-neutral-400 hover:text-neutral-200">
          Cerrar
        </button>
      </div>
      <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre completo" name="fullName" required />
        <Field label="Correo" name="email" type="email" required />
        <Field label="Teléfono" name="phone" />
        <Field label="Fecha de nacimiento" name="birthDate" type="date" />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">
            Notas médicas
          </label>
          <textarea
            name="medicalNotes"
            rows={2}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        {state.error && <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>}
        {state.ok && (
          <p className="text-sm text-accent sm:col-span-2">Invitación enviada por correo.</p>
        )}
        <div className="sm:col-span-2">
          <button
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Enviando…' : 'Enviar invitación'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
