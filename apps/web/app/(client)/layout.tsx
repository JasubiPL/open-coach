import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../(auth)/actions';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'client') redirect('/');

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <span className="text-lg font-bold">
          Open <span className="text-accent">Coach</span>
        </span>
        <form action={signOut}>
          <button className="text-sm text-neutral-400 hover:text-neutral-200">Salir</button>
        </form>
      </header>
      <p className="mb-4 text-sm text-neutral-400">Hola, {profile?.full_name ?? 'Cliente'}</p>
      {children}
    </div>
  );
}
