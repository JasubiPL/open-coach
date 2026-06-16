import { listMembershipPlans } from '@open-coach/shared';
import { requireTrainer } from '@/lib/auth';
import { NewPlanButton, PlanForm } from '@/components/trainer/PlanForm';
import { archivePlanAction } from './actions';
import { formatMoney } from '@/lib/format';

export default async function PlansPage() {
  const { supabase, organizationId } = await requireTrainer();
  const plans = await listMembershipPlans(supabase, organizationId);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Planes de membresía</h1>
        <NewPlanButton />
      </div>

      <div className="space-y-4">
        {plans.length === 0 && (
          <p className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-500">
            Sin planes todavía. Crea el primero.
          </p>
        )}
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">
                  {plan.name}
                  {!plan.active && (
                    <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                      Archivado
                    </span>
                  )}
                </h2>
                <p className="text-sm text-neutral-400">
                  {formatMoney(plan.price_cents, plan.currency)} / {intervalLabel(plan.interval)}
                </p>
              </div>
              {plan.active && (
                <form action={archivePlanAction}>
                  <input type="hidden" name="planId" value={plan.id} />
                  <button className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800">
                    Archivar
                  </button>
                </form>
              )}
            </div>
            <PlanForm plan={plan} />
          </div>
        ))}
      </div>
    </div>
  );
}

function intervalLabel(interval: 'month' | 'year' | 'custom'): string {
  return interval === 'month' ? 'mes' : interval === 'year' ? 'año' : 'periodo';
}
