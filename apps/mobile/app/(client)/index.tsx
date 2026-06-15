import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function ClientHome() {
  return (
    <View className="flex-1 justify-center bg-neutral-950 px-6">
      <Text className="text-2xl font-bold text-white">Mi inicio</Text>
      <Text className="mt-2 text-neutral-400">
        Scaffold de Fase 0. Tu rutina, dieta y progreso llegan en el Sprint 3.
      </Text>
      <TouchableOpacity onPress={() => supabase.auth.signOut()} className="mt-6">
        <Text className="text-accent">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
