import { Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function TrainerDashboard() {
  return (
    <View className="flex-1 justify-center bg-neutral-950 px-6">
      <Text className="text-2xl font-bold text-white">Dashboard del entrenador</Text>
      <Text className="mt-2 text-neutral-400">
        Scaffold de Fase 0. Las funciones llegan en el Sprint 1.
      </Text>
      <TouchableOpacity onPress={() => supabase.auth.signOut()} className="mt-6">
        <Text className="text-accent">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
