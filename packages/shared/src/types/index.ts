import type { Database } from './database.types';

export type { Database, Json } from './database.types';

/** Roles de usuario en la plataforma. */
export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

/** Filas de dominio (atajos de tipado). */
type Tables = Database['public']['Tables'];
export type Organization = Tables['organizations']['Row'];
export type Profile = Tables['profiles']['Row'];
export type MembershipPlan = Tables['membership_plans']['Row'];
export type ClientMembership = Tables['client_memberships']['Row'];
export type Routine = Tables['routines']['Row'];
export type RoutineExercise = Tables['routine_exercises']['Row'];
export type DietPlan = Tables['diet_plans']['Row'];
export type Meal = Tables['meals']['Row'];
export type Assignment = Tables['assignments']['Row'];
export type ProgressLog = Tables['progress_logs']['Row'];
export type ProgressPhoto = Tables['progress_photos']['Row'];
export type AdherenceLog = Tables['adherence_logs']['Row'];
export type Payment = Tables['payments']['Row'];
export type Note = Tables['notes']['Row'];

export const USER_ROLES = ['trainer', 'client', 'super_admin'] as const;
export const DEFAULT_CURRENCY = 'MXN' as const;
export const DEFAULT_TIMEZONE = 'America/Mexico_City' as const;
