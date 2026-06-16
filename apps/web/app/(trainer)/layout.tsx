import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '../(auth)/actions';

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== 'trainer') redirect('/');

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r border-neutral-800 bg-neutral-900 p-4 md:flex">
        <span className="mb-6 text-lg font-bold">
          Open <span className="text-accent">Coach</span>
        </span>
        <nav className="flex flex-col gap-1 text-sm text-neutral-300">
          <Link href="/trainer" className="rounded px-3 py-2 hover:bg-neutral-800">
            Dashboard
          </Link>
          <Link href="/trainer/clients" className="rounded px-3 py-2 hover:bg-neutral-800">
            Clientes
          </Link>
          <Link href="/trainer/plans" className="rounded px-3 py-2 hover:bg-neutral-800">
            Planes
          </Link>
          <span className="rounded px-3 py-2 text-neutral-600">Plantillas</span>
          <span className="rounded px-3 py-2 text-neutral-600">Pagos</span>
          <span className="rounded px-3 py-2 text-neutral-600">Notas</span>
        </nav>
        <form action={signOut} className="mt-auto">
          <button className="text-sm text-neutral-400 hover:text-neutral-200">Cerrar sesión</button>
        </form>
      </aside>
      <main className="flex-1 p-6">
        <p className="mb-4 text-sm text-neutral-400">Hola, {profile?.full_name ?? 'Entrenador'}</p>
        {children}
      </main>
    </div>
  );
}
