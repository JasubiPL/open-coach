import type { Database } from './database.types';

export type { Database, Json } from './database.types';

/** Roles de usuario en la plataforma. */
export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

/** Filas de dominio (atajos de tipado). */
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export const USER_ROLES = ['trainer', 'client', 'super_admin'] as const;
export const DEFAULT_CURRENCY = 'MXN' as const;
export const DEFAULT_TIMEZONE = 'America/Mexico_City' as const;
