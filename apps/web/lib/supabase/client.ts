'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@open-coach/shared';
import { env } from '@/lib/env';

/** Cliente Supabase para componentes de cliente (browser). */
export function createClient() {
  return createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY);
}
