'use client';

import { useActionState } from 'react';
import { signIn, type AuthState } from '../actions';

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-8"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">
            Open <span className="text-accent">Coach</span>
          </h1>
          <p className="text-sm text-neutral-400">Inicia sesión</p>
        </div>

        <label className="block space-y-1">
          <span className="text-sm text-neutral-300">Correo</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-neutral-300">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-accent py-2 font-semibold text-accent-foreground disabled:opacity-60"
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
