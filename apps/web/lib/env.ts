/** Validación de variables de entorno públicas en build/runtime. */
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  // Nuevo formato de claves de Supabase: "publishable key" (sustituye a la anon key).
  SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
};

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  // No lanzamos en build para permitir CI sin secretos; avisamos en runtime.
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[open-coach] Falta NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
  }
}
