'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';

type ReactNode = React.ReactNode;

const inputCls =
  'w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-accent';
const labelCls = 'mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400';

export function Field({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        className={inputCls}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 2,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? undefined} className={inputCls} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select name={name} defaultValue={defaultValue} className={inputCls}>
        {children}
      </select>
    </div>
  );
}

export function SubmitButton({ children = 'Guardar' }: { children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Guardando…' : children}
    </button>
  );
}

export function FormAlert({ state }: { state: { error?: string; ok?: boolean } }) {
  if (state.error) return <p className="text-sm text-red-400">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-accent">Guardado.</p>;
  return null;
}
