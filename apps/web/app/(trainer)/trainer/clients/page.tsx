import Link from 'next/link';
import { listClients } from '@open-coach/shared';
import { requireTrainer } from '@/lib/auth';
import { NewClientForm } from '@/components/trainer/NewClientForm';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { supabase, organizationId } = await requireTrainer();
  const params = await searchParams;
  const status = params.status === 'active' || params.status === 'inactive' ? params.status : undefined;

  const clients = await listClients(supabase, organizationId, { search: params.q, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <NewClientForm />
      </div>

      <form className="flex flex-wrap gap-2" action="/trainer/clients">
        <input
          name="q"
          defaultValue={params.q ?? ''}
          placeholder="Buscar por nombre o correo…"
          className="min-w-64 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button className="rounded-lg border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  Sin clientes todavía. Invita al primero.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-900/60">
                <td className="px-4 py-3">
                  <Link href={`/trainer/clients/${c.id}`} className="font-medium hover:text-accent">
                    {c.full_name || 'Sin nombre'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-400">{c.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const active = status === 'active';
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-accent/15 text-accent' : 'bg-neutral-800 text-neutral-400'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );
}
