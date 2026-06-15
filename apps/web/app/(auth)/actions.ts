'use server';

import { redirect } from 'next/navigation';
import { signInSchema, signUpTrainerSchema, slugify } from '@open-coach/shared';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string };

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  redirect('/');
}

/**
 * Alta de entrenador + su organización. La organización se crea con la
 * service_role (vía RPC o Route Handler en sprints posteriores); aquí se deja
 * el flujo de signup de Auth con metadata para que el trigger cree el profile.
 */
export async function signUpTrainer(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpTrainerSchema.safeParse({
    fullName: formData.get('fullName'),
    organizationName: formData.get('organizationName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  // TODO(sprint-1): crear organización con service_role y pasar su id en metadata.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        role: 'trainer',
        full_name: parsed.data.fullName,
        organization_name: parsed.data.organizationName,
        organization_slug: slugify(parsed.data.organizationName),
      },
    },
  });
  if (error) return { error: error.message };

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
