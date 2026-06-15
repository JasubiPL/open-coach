import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInSchema } from '@open-coach/shared';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (signInError) setError(signInError.message);
    // El guard en _layout redirige según el rol.
  }

  return (
    <View className="flex-1 justify-center bg-neutral-950 px-6">
      <Text className="mb-1 text-center text-3xl font-bold text-white">
        Open <Text className="text-accent">Coach</Text>
      </Text>
      <Text className="mb-8 text-center text-neutral-400">Inicia sesión</Text>

      <TextInput
        placeholder="Correo"
        placeholderTextColor="#737373"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="mb-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#737373"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="mb-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-white"
      />

      {error ? <Text className="mb-3 text-red-400">{error}</Text> : null}

      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        className="rounded-lg bg-accent py-3"
      >
        <Text className="text-center font-semibold text-accent-foreground">
          {loading ? 'Entrando…' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
