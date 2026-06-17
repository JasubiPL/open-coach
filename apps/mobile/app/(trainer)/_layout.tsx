import { Tabs } from 'expo-router';

export default function TrainerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A0A0A', borderTopColor: '#262626' },
        tabBarActiveTintColor: '#A3E635',
        tabBarInactiveTintColor: '#737373',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="clients" options={{ title: 'Clientes' }} />
      <Tabs.Screen name="plans" options={{ title: 'Planes' }} />
    </Tabs>
  );
}
