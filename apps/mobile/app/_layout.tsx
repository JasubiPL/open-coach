import '../global.css';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/lib/auth';

function Guard() {
  const { session, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(trainer)' || segments[0] === '(client)';

    if (!session && inAuthGroup) {
      router.replace('/');
    } else if (session && role) {
      const target = role === 'trainer' ? '/(trainer)' : '/(client)';
      if (!inAuthGroup) router.replace(target);
    }
  }, [session, role, loading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Guard />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
