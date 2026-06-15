import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

/** Cliente Supabase tipado con el esquema de Open Coach. */
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Factory genérico. Cada plataforma construye su cliente:
 *  - web (browser): `@supabase/ssr` createBrowserClient
 *  - web (server):  `@supabase/ssr` createServerClient (con cookies)
 *  - móvil:         este factory con storage = AsyncStorage
 *
 * Para el navegador/SSR las apps usan `@supabase/ssr`; este helper cubre
 * el caso de React Native y entornos sin cookies.
 */
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: Parameters<typeof createClient>[2],
): TypedSupabaseClient {
  if (!url || !anonKey) {
    throw new Error('Faltan SUPABASE_URL / SUPABASE_ANON_KEY al crear el cliente Supabase.');
  }
  return createClient<Database>(url, anonKey, options);
}

export type { Database } from '../types/database.types';
