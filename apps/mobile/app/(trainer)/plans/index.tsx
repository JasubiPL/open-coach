import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  archivePlan,
  createPlan,
  listMembershipPlans,
  membershipPlanSchema,
  updatePlan,
  type MembershipPlan,
  type MembershipPlanInput,
} from '@open-coach/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useAsync } from '@/lib/useAsync';
import { formatMoney } from '@/lib/format';
import { Button, Card, ErrorText, Field, StatusBadge } from '@/components/ui';

const INTERVALS = ['month', 'year', 'custom'] as const;
type Interval = (typeof INTERVALS)[number];

function intervalLabel(interval: Interval): string {
  return interval === 'month' ? 'mes' : interval === 'year' ? 'año' : 'periodo';
}

export default function PlansScreen() {
  const { organizationId } = useAuth();
  const [creating, setCreating] = useState(false);

  const { data, loading, error, reload } = useAsync<MembershipPlan[]>(
    () => (organizationId ? listMembershipPlans(supabase, organizationId) : Promise.resolve([])),
    [organizationId],
  );
  useFocusEffect(useCallback(() => reload(), [reload]));

  return (
    <SafeAreaView className="flex-1 bg-neutral-950" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Planes</Text>
          <Button
            variant="secondary"
            label={creating ? 'Cancelar' : '+ Nuevo'}
            onPress={() => setCreating((v) => !v)}
          />
        </View>

        {creating && organizationId && (
          <Card title="Nuevo plan">
            <PlanForm
              organizationId={organizationId}
              onDone={() => {
                setCreating(false);
                reload();
              }}
            />
          </Card>
        )}

        {!loading && (data ?? []).length === 0 && (
          <Text className="mt-8 text-center text-neutral-500">
            {error ?? 'Sin planes todavía. Crea el primero.'}
          </Text>
        )}

        {(data ?? []).map((plan) => (
          <PlanCard key={plan.id} plan={plan} organizationId={organizationId!} onDone={reload} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({
  plan,
  organizationId,
  onDone,
}: {
  plan: MembershipPlan;
  organizationId: string;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-white">{plan.name}</Text>
            {!plan.active && <StatusBadge active={false} label="Archivado" />}
          </View>
          <Text className="mt-0.5 text-sm text-neutral-400">
            {formatMoney(plan.price_cents, plan.currency)} / {intervalLabel(plan.interval as Interval)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setEditing((v) => !v)}>
          <Text className="text-sm text-accent">{editing ? 'Cerrar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      {editing && (
        <PlanForm
          organizationId={organizationId}
          plan={plan}
          onDone={() => {
            setEditing(false);
            onDone();
          }}
        />
      )}

      {plan.active && !editing && (
        <Button
          variant="secondary"
          label="Archivar"
          onPress={() =>
            Alert.alert('Archivar plan', `¿Archivar "${plan.name}"?`, [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Archivar',
                onPress: async () => {
                  await archivePlan(supabase, plan.id);
                  onDone();
                },
              },
            ])
          }
        />
      )}
    </Card>
  );
}

function PlanForm({
  organizationId,
  plan,
  onDone,
}: {
  organizationId: string;
  plan?: MembershipPlan;
  onDone: () => void;
}) {
  const [name, setName] = useState(plan?.name ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  // El precio se edita en unidades (pesos); se convierte a centavos al guardar.
  const [price, setPrice] = useState(plan ? (plan.price_cents / 100).toString() : '');
  const [interval, setInterval] = useState<Interval>((plan?.interval as Interval) ?? 'month');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setError(null);
    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber)) {
      setError('Precio inválido');
      return;
    }
    const input: MembershipPlanInput = {
      name,
      description: description || null,
      priceCents: Math.round(priceNumber * 100),
      currency: plan?.currency ?? 'MXN',
      interval,
      active: plan?.active ?? true,
    };
    const parsed = membershipPlanSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    setSaving(true);
    try {
      if (plan) await updatePlan(supabase, plan.id, parsed.data);
      else await createPlan(supabase, organizationId, parsed.data);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Field label="Nombre" value={name} onChangeText={setName} />
      <Field label="Descripción" value={description} onChangeText={setDescription} multiline />
      <Field label="Precio (MXN)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Periodo
      </Text>
      <View className="mb-3 flex-row gap-2">
        {INTERVALS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => setInterval(opt)}
            className={`rounded-full border px-3 py-1.5 ${interval === opt ? 'border-accent bg-accent/15' : 'border-neutral-700'}`}
          >
            <Text className={`text-sm ${interval === opt ? 'text-accent' : 'text-neutral-300'}`}>
              {intervalLabel(opt)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ErrorText>{error}</ErrorText>
      <Button label={plan ? 'Guardar' : 'Crear plan'} onPress={onSave} loading={saving} />
    </View>
  );
}
