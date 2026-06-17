import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function TrainerDashboard() {
  const { profile } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-neutral-950 px-6" edges={['top']}>
      <View className="flex-1 justify-center">
        <Text className="text-sm text-neutral-400">Hola,</Text>
        <Text className="text-3xl font-bold text-white">
          {profile?.full_name || 'Entrenador'}
        </Text>

        <View className="mt-8 gap-3">
          <Link href="/(trainer)/clients" asChild>
            <TouchableOpacity className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <Text className="text-base font-semibold text-white">Clientes</Text>
              <Text className="mt-1 text-sm text-neutral-400">Gestiona y asigna planes.</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(trainer)/plans" asChild>
            <TouchableOpacity className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <Text className="text-base font-semibold text-white">Planes de membresía</Text>
              <Text className="mt-1 text-sm text-neutral-400">Crea, edita y archiva.</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity onPress={() => supabase.auth.signOut()} className="mt-8">
          <Text className="text-accent">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
