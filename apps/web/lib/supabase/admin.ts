import { createClient } from '@supabase/supabase-js';
import type { Database } from '@open-coach/shared';

/**
 * Cliente Supabase con la SECRET KEY (sustituye a service_role). BYPASSA RLS.
 * Sólo para operaciones privilegiadas server-only (invitar clientes, crear orgs,
 * webhooks). NUNCA importar en código de cliente: la SECRET_KEY no lleva prefijo
 * NEXT_PUBLIC_, así que sólo existe en el servidor. Importar este módulo sólo desde
 * Server Actions / Route Handlers.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const secret = process.env.SUPABASE_SECRET_KEY ?? '';
  if (!url || !secret) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY para el cliente admin.');
  }
  return createClient<Database>(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
