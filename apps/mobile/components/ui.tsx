import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';

/** Botón primario/secundario consistente con el acento del diseño. */
export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const base = 'rounded-lg py-3 px-4 items-center';
  const styles =
    variant === 'primary'
      ? 'bg-accent'
      : variant === 'danger'
        ? 'border border-red-500/40'
        : 'border border-neutral-700';
  const textStyles =
    variant === 'primary'
      ? 'text-accent-foreground'
      : variant === 'danger'
        ? 'text-red-400'
        : 'text-neutral-200';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${styles} ${disabled || loading ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0A0A0A' : '#A3E635'} />
      ) : (
        <Text className={`font-semibold ${textStyles}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

/** Campo de texto con etiqueta. */
export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View className="mb-3">
      <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#737373"
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"
        {...props}
      />
    </View>
  );
}

/** Tarjeta/sección con título opcional. */
export function Card({ title, children }: PropsWithChildren<{ title?: string }>) {
  return (
    <View className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      {title ? <Text className="mb-3 text-base font-semibold text-white">{title}</Text> : null}
      {children}
    </View>
  );
}

export function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <View
      className={`self-start rounded-full px-2.5 py-0.5 ${active ? 'bg-accent/15' : 'bg-neutral-800'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-accent' : 'text-neutral-400'}`}>
        {label}
      </Text>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <Text className="mb-3 text-sm text-red-400">{children}</Text>;
}

/** Estado de carga / error centrado para listas y detalles. */
export function LoadingOrError({ loading, error }: { loading: boolean; error: string | null }) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
      {loading ? (
        <ActivityIndicator color="#A3E635" />
      ) : (
        <Text className="text-center text-red-400">{error}</Text>
      )}
    </View>
  );
}
