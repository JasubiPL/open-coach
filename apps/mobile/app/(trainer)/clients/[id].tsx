import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  assignMembership,
  deactivateClient,
  getClient,
  getClientMembership,
  listMembershipPlans,
  updateClient,
  updateClientSchema,
  type ClientMembership,
  type MembershipPlan,
  type Profile,
} from '@open-coach/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useAsync } from '@/lib/useAsync';
import { formatDate, todayIso } from '@/lib/format';
import { Button, Card, ErrorText, Field, LoadingOrError } from '@/components/ui';

type DetailData = {
  client: Profile;
  membership: ClientMembership | null;
  plans: MembershipPlan[];
};

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { organizationId } = useAuth();
  const router = useRouter();

  const { data, loading, error, reload } = useAsync<DetailData | null>(async () => {
    if (!id || !organizationId) return null;
    const [client, membership, plans] = await Promise.all([
      getClient(supabase, id),
      getClientMembership(supabase, id),
      listMembershipPlans(supabase, organizationId, true),
    ]);
    return { client, membership, plans };
  }, [id, organizationId]);

  if (!data) return <LoadingOrError loading={loading} error={error} />;

  const { client, membership, plans } = data;
  const currentPlan = membership ? plans.find((p) => p.id === membership.plan_id) : undefined;

  return (
    <ScrollView className="flex-1 bg-neutral-950" contentContainerStyle={{ padding: 16 }}>
      <View className="mb-4">
        <Text className="text-2xl font-bold text-white">{client.full_name || 'Cliente'}</Text>
        <Text className="text-sm text-neutral-400">{client.email ?? 'Sin correo'}</Text>
      </View>

      <Card title="Membresía">
        {membership ? (
          <Text className="mb-1 text-sm text-neutral-300">
            <Text className="font-medium text-white">{currentPlan?.name ?? 'Plan'}</Text> ·{' '}
            {membership.status === 'active' ? 'Activa' : membership.status} · vence{' '}
            {formatDate(membership.end_date)}
          </Text>
        ) : (
          <Text className="mb-1 text-sm text-neutral-400">Sin membresía activa.</Text>
        )}
        <AssignPlan
          clientId={client.id}
          organizationId={organizationId!}
          plans={plans}
          onDone={reload}
        />
      </Card>

      <Card title="Datos del cliente">
        <EditClient client={client} onDone={reload} />
      </Card>

      {client.status === 'active' && (
        <Button
          variant="danger"
          label="Dar de baja al cliente"
          onPress={() =>
            Alert.alert('Dar de baja', `¿Dar de baja a ${client.full_name || 'este cliente'}?`, [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Dar de baja',
                style: 'destructive',
                onPress: async () => {
                  await deactivateClient(supabase, client.id);
                  reload();
                },
              },
            ])
          }
        />
      )}

      <TouchableOpacity onPress={() => router.back()} className="mt-6 items-center">
        <Text className="text-neutral-400">← Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function EditClient({ client, onDone }: { client: Profile; onDone: () => void }) {
  const [fullName, setFullName] = useState(client.full_name);
  const [phone, setPhone] = useState(client.phone ?? '');
  const [birthDate, setBirthDate] = useState(client.birth_date ?? '');
  const [medicalNotes, setMedicalNotes] = useState(client.medical_notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setError(null);
    const parsed = updateClientSchema.safeParse({
      fullName,
      phone: phone || null,
      birthDate: birthDate || null,
      medicalNotes: medicalNotes || null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    setSaving(true);
    try {
      await updateClient(supabase, client.id, parsed.data);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <Field label="Nombre completo" value={fullName} onChangeText={setFullName} />
      <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field
        label="Fecha de nacimiento (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        autoCapitalize="none"
      />
      <Field
        label="Notas médicas"
        value={medicalNotes}
        onChangeText={setMedicalNotes}
        multiline
        numberOfLines={3}
      />
      <ErrorText>{error}</ErrorText>
      <Button label="Guardar cambios" onPress={onSave} loading={saving} />
    </View>
  );
}

function AssignPlan({
  clientId,
  organizationId,
  plans,
  onDone,
}: {
  clientId: string;
  organizationId: string;
  plans: MembershipPlan[];
  onDone: () => void;
}) {
  const [planId, setPlanId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Selecciona el primer plan disponible por defecto.
  useEffect(() => {
    const first = plans[0];
    if (!planId && first) setPlanId(first.id);
  }, [plans, planId]);

  if (plans.length === 0) {
    return <Text className="mt-3 text-sm text-neutral-500">Crea un plan activo para asignarlo.</Text>;
  }

  async function onAssign() {
    setError(null);
    if (!planId) {
      setError('Selecciona un plan');
      return;
    }
    setSaving(true);
    try {
      await assignMembership(supabase, organizationId, {
        clientId,
        planId,
        startDate,
        status: 'active',
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo asignar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="mt-4">
      <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Asignar plan
      </Text>
      <View className="mb-3 flex-row flex-wrap gap-2">
        {plans.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPlanId(p.id)}
            className={`rounded-full border px-3 py-1.5 ${planId === p.id ? 'border-accent bg-accent/15' : 'border-neutral-700'}`}
          >
            <Text className={`text-sm ${planId === p.id ? 'text-accent' : 'text-neutral-300'}`}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Field
        label="Inicio (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        autoCapitalize="none"
      />
      <ErrorText>{error}</ErrorText>
      <Button variant="secondary" label="Asignar plan" onPress={onAssign} loading={saving} />
    </View>
  );
}
