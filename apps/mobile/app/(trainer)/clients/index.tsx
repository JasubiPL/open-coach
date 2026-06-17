import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listClients, type Profile } from '@open-coach/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useAsync } from '@/lib/useAsync';
import { StatusBadge } from '@/components/ui';

type StatusFilter = 'active' | 'inactive' | undefined;

export default function ClientsList() {
  const { organizationId } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>(undefined);

  const { data, loading, error, reload } = useAsync<Profile[]>(
    () =>
      organizationId
        ? listClients(supabase, organizationId, { search: search.trim() || undefined, status })
        : Promise.resolve([]),
    [organizationId, search, status],
  );

  // Refresca al volver al tab (p. ej. tras editar/dar de baja en el detalle).
  useFocusEffect(useCallback(() => reload(), [reload]));

  return (
    <View className="flex-1 bg-neutral-950">
      <View className="gap-3 px-4 py-3">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o correo…"
          placeholderTextColor="#737373"
          autoCapitalize="none"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white"
        />
        <View className="flex-row gap-2">
          <FilterPill label="Todos" active={status === undefined} onPress={() => setStatus(undefined)} />
          <FilterPill label="Activos" active={status === 'active'} onPress={() => setStatus('active')} />
          <FilterPill
            label="Inactivos"
            active={status === 'inactive'}
            onPress={() => setStatus('inactive')}
          />
        </View>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor="#A3E635" />}
        ListEmptyComponent={
          !loading ? (
            <Text className="mt-12 text-center text-neutral-500">
              {error ?? 'Sin clientes. Invita desde la web.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(trainer)/clients/${item.id}`)}
            className="mb-2 flex-row items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
          >
            <View className="flex-1 pr-3">
              <Text className="font-medium text-white">{item.full_name || 'Sin nombre'}</Text>
              <Text className="text-sm text-neutral-400">{item.email ?? '—'}</Text>
            </View>
            <StatusBadge active={item.status === 'active'} label={item.status === 'active' ? 'Activo' : 'Inactivo'} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${active ? 'border-accent bg-accent/15' : 'border-neutral-700'}`}
    >
      <Text className={`text-sm ${active ? 'text-accent' : 'text-neutral-300'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
