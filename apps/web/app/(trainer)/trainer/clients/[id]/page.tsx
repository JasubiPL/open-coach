import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getClientMembership, listMembershipPlans, QueryError } from '@open-coach/shared';
import { requireTrainer } from '@/lib/auth';
import { EditClientForm } from '@/components/trainer/EditClientForm';
import { AssignPlanForm } from '@/components/trainer/AssignPlanForm';
import { deactivateClientAction } from '../actions';
import { formatDate } from '@/lib/format';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, organizationId } = await requireTrainer();
  const { id } = await params;

  let client;
  try {
    client = await getClient(supabase, id);
  } catch (e) {
    if (e instanceof QueryError) notFound();
    throw e;
  }

  const [membership, plans] = await Promise.all([
    getClientMembership(supabase, id),
    listMembershipPlans(supabase, organizationId, true),
  ]);
  const currentPlan = membership ? plans.find((p) => p.id === membership.plan_id) : undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/trainer/clients" className="text-sm text-neutral-400 hover:text-accent">
          ← Clientes
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{client.full_name || 'Cliente'}</h1>
        <p className="text-sm text-neutral-400">{client.email ?? 'Sin correo'}</p>
      </div>

      <Section title="Membresía">
        {membership ? (
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-neutral-100">{currentPlan?.name ?? 'Plan'}</span> ·{' '}
            {membership.status === 'active' ? 'Activa' : membership.status} · vence{' '}
            {formatDate(membership.end_date)}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">Sin membresía activa.</p>
        )}
        <div className="mt-4">
          <AssignPlanForm clientId={client.id} plans={plans} />
        </div>
      </Section>

      <Section title="Datos del cliente">
        <EditClientForm client={client} />
      </Section>

      {client.status === 'active' && (
        <form action={deactivateClientAction}>
          <input type="hidden" name="clientId" value={client.id} />
          <button className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
            Dar de baja al cliente
          </button>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}
